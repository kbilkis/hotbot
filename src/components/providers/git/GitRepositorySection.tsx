import { useState, useEffect } from "preact/hooks";

import { GitProviderData } from "@/lib/validation/provider-schemas";
import * as modalStyles from "@/styles/providers/modal.css";
import * as repoStyles from "@/styles/providers/repositories.css";
import { button } from "@/styles/theme/index.css";

import { getProviderApi } from "./utils";

interface GitRepositorySectionProps {
  provider: GitProviderData;
  isConnected: boolean;
}

export default function GitRepositorySection({
  provider,
  isConnected,
}: Readonly<GitRepositorySectionProps>) {
  const [repositories, setRepositories] = useState<string[]>([]);
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [repositoriesError, setRepositoriesError] = useState<string | null>(
    null
  );
  const [showAllRepositories, setShowAllRepositories] = useState(false);

  // Fetch repositories when connected
  useEffect(() => {
    if (isConnected) {
      fetchRepositories();
    }
  }, [isConnected]);

  const fetchRepositories = async () => {
    try {
      setRepositoriesLoading(true);
      setRepositoriesError(null);

      const api = getProviderApi(provider.provider);
      const response = await api.repositories.$get();

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      setRepositories(data.data?.repositories || []);
    } catch (err) {
      console.error("Failed to fetch repositories:", err);
      setRepositoriesError(
        err instanceof Error ? err.message : "Failed to fetch repositories"
      );
    } finally {
      setRepositoriesLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className={modalStyles.formGroup}>
      <div className={modalStyles.formLabel}>Accessible Repositories</div>
      <div className={repoStyles.repositoriesSection}>
        {repositoriesLoading && (
          <div className={repoStyles.repositoriesLoading}>
            <span>Loading repositories...</span>
          </div>
        )}

        {repositoriesError && (
          <div className={repoStyles.repositoriesError}>
            <span>Error loading repositories: {repositoriesError}</span>
            <button
              className={button({ color: "danger", size: "xs" })}
              onClick={fetchRepositories}
              disabled={repositoriesLoading}
            >
              Retry
            </button>
          </div>
        )}

        {!repositoriesLoading &&
          !repositoriesError &&
          repositories.length > 0 && (
            <div className={repoStyles.repositoriesList}>
              <div className={repoStyles.repositoriesCount}>
                {repositories.length} repositories accessible
              </div>
              <div className={repoStyles.repositoriesContainer}>
                {(showAllRepositories
                  ? repositories
                  : repositories.slice(0, 10)
                ).map((repo) => (
                  <div key={repo} className={repoStyles.repositoryItem}>
                    <span className={repoStyles.repoIcon}>📁</span>
                    <span className={repoStyles.repoName}>{repo}</span>
                  </div>
                ))}
                {repositories.length > 10 && !showAllRepositories && (
                  <button
                    className={button({
                      color: "ghost",
                      size: "sm",
                    })}
                    onClick={() => setShowAllRepositories(true)}
                  >
                    ⋯ Show {repositories.length - 10} more repositories
                  </button>
                )}
                {showAllRepositories && repositories.length > 10 && (
                  <button
                    className={button({
                      color: "ghost",
                      size: "sm",
                    })}
                    onClick={() => setShowAllRepositories(false)}
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          )}

        {!repositoriesLoading &&
          !repositoriesError &&
          repositories.length === 0 && (
            <div className={repoStyles.repositoriesEmpty}>
              <span>No repositories found</span>
            </div>
          )}
      </div>
    </div>
  );
}

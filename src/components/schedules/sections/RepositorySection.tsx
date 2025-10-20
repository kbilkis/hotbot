import { useState } from "preact/hooks";

import { useRepositories } from "@/hooks/useRepositories";
import * as formStyles from "@/styles/schedules/forms.css";

interface RepositorySectionProps {
  selectedGitProviderId: string;
  selectedRepositories: string[];
  onRepositoriesChange: (repositories: string[]) => void;
  errors: {
    repositories?: string;
  };
}

const NoProviderSelected = () => (
  <div className={formStyles.selectProviderFirst}>
    Select a git provider first
  </div>
);

const LoadingState = ({ isRefreshing }: { isRefreshing: boolean }) => (
  <div className={formStyles.loadingText}>
    {isRefreshing ? "Refreshing repositories..." : "Loading repositories..."}
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className={formStyles.errorState}>
    <div className={formStyles.errorMessage}>
      Failed to load repositories: {error}
    </div>
    <button type="button" onClick={onRetry} className={formStyles.retryButton}>
      Try Again
    </button>
  </div>
);

const NoRepositoriesFound = () => (
  <div className={formStyles.noRepositories}>
    No repositories found for this provider
  </div>
);

const RepositoryList = ({
  repositories,
  searchTerm,
  onSearchChange,
  selectedRepositories,
  onToggle,
}: {
  repositories: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRepositories: string[];
  onToggle: (repo: string, checked: boolean) => void;
}) => (
  <>
    <input
      type="text"
      className={formStyles.formInput}
      placeholder="Search repositories..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.currentTarget.value)}
      style={{ marginBottom: "8px" }}
    />
    <div className={formStyles.checkboxGroup}>
      {repositories.map((repo: string) => (
        <label key={repo} className={formStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={selectedRepositories.includes(repo)}
            onChange={(e) => onToggle(repo, e.currentTarget.checked)}
          />
          {repo}
        </label>
      ))}
      {repositories.length === 0 && searchTerm && (
        <div className={formStyles.noRepositories}>
          No repositories match your search
        </div>
      )}
    </div>
  </>
);

export default function RepositorySection({
  selectedGitProviderId,
  selectedRepositories,
  onRepositoriesChange,
  errors,
}: Readonly<RepositorySectionProps>) {
  const [repositorySearchTerm, setRepositorySearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { repositories, loading, error, refetch } = useRepositories(
    selectedGitProviderId
  );

  const filteredRepositories = repositories.filter((repo: string) =>
    repo.toLowerCase().includes(repositorySearchTerm.toLowerCase())
  );

  const handleRepositoryToggle = (repo: string, checked: boolean) => {
    const newRepositories = checked
      ? [...selectedRepositories, repo]
      : selectedRepositories.filter((r) => r !== repo);
    onRepositoriesChange(newRepositories);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = loading || isRefreshing;

  const renderContent = () => {
    if (!selectedGitProviderId) return <NoProviderSelected />;
    if (isLoading) return <LoadingState isRefreshing={isRefreshing} />;
    if (error) return <ErrorState error={error} onRetry={handleRefresh} />;
    if (repositories.length === 0) return <NoRepositoriesFound />;

    return (
      <RepositoryList
        repositories={filteredRepositories}
        searchTerm={repositorySearchTerm}
        onSearchChange={setRepositorySearchTerm}
        selectedRepositories={selectedRepositories}
        onToggle={handleRepositoryToggle}
      />
    );
  };

  return (
    <div className={formStyles.formSection}>
      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <div className={formStyles.formLabelRow}>
            <label className={formStyles.formLabel}>
              Repositories to Monitor
            </label>
            {selectedGitProviderId && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className={formStyles.refreshButton}
                title="Refresh repositories"
              >
                {isRefreshing ? "⟳" : "↻"}
              </button>
            )}
          </div>

          <div className={formStyles.repositorySelection}>
            {renderContent()}
          </div>

          {errors.repositories && (
            <div className={formStyles.fieldError}>{errors.repositories}</div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "preact/hooks";
import { mutate } from "swr";

import { gitApi, githubApi, gitlabApi } from "@/lib/api/client";
import { GitProviderData } from "@/lib/validation/provider-schemas";
import * as modalStyles from "@/styles/providers/modal.css";
import * as repoStyles from "@/styles/providers/repositories.css";
import { button } from "@/styles/theme/index.css";

interface GitProviderModalProps {
  provider: GitProviderData;
  onClose: () => void;
}

export default function GitProviderModal({
  provider,
  onClose,
}: Readonly<GitProviderModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [repositoriesError, setRepositoriesError] = useState<string | null>(
    null
  );
  const [showAllRepositories, setShowAllRepositories] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [isConnected, setIsConnected] = useState(provider.connected);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  // Fetch repositories when modal opens for connected providers
  useEffect(() => {
    if (isConnected) {
      fetchRepositories();
    }
  }, [isConnected]);

  const getFineGrainedTokenUrl = () => {
    const urls = {
      github: "https://github.com/settings/personal-access-tokens/new",
      gitlab: "https://gitlab.com/-/profile/personal_access_tokens",
      bitbucket: "https://bitbucket.org/account/settings/app-passwords/new",
    };
    return urls[provider.provider];
  };

  const getClassicTokenUrl = () => {
    const urls = {
      github:
        "https://github.com/settings/tokens/new?scopes=repo,read:user,read:org&description=Git%20Messaging%20Scheduler",
      gitlab: "https://gitlab.com/-/profile/personal_access_tokens",
      bitbucket: "https://bitbucket.org/account/settings/app-passwords/new",
    };
    return urls[provider.provider];
  };

  const fetchRepositories = async () => {
    try {
      setRepositoriesLoading(true);
      setRepositoriesError(null);

      const api = provider.provider === "github" ? githubApi : gitlabApi;
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

  const providerConfig = {
    github: {
      name: "GitHub",
      logo: (
        <img
          src="/images/providers/github/GitHub_Lockup_Light.svg"
          alt="GitHub"
          className={modalStyles.providerLogoButton}
        />
      ),
      logoDark: (
        <img
          src="/images/providers/github/GitHub_Lockup_Dark.svg"
          alt="GitHub"
          className={modalStyles.providerLogoButton}
        />
      ),
      placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
    },
    gitlab: {
      name: "GitLab",
      logo: (
        <img
          src="/images/providers/gitlab/gitlab-logo-200-rgb.svg"
          alt="GitLab"
          className={modalStyles.providerLogoButtonGitlab}
        />
      ),
      logoDark: null,
      placeholder: "glpat-xxxxxxxxxxxxxxxxxxxx",
    },
    bitbucket: {
      name: "Bitbucket",
      logo: (
        <img
          src="/images/providers/bitbucket/Bitbucket_attribution_dark.svg"
          alt="Bitbucket"
          className={modalStyles.providerLogoButton}
        />
      ),
      logoDark: (
        <img
          src="/images/providers/bitbucket/Bitbucket_attribution_light.svg"
          alt="Bitbucket"
          className={modalStyles.providerLogoButton}
        />
      ),
      placeholder: "ATBB-xxxxxxxxxxxxxxxxxxxx",
    },
  };

  const config = providerConfig[provider.provider];

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current URL for redirect
      const redirectUri = `${globalThis.window.location.origin}/auth/callback/${provider.provider}`;

      // Get provider-specific scopes
      const getScopes = () => {
        switch (provider.provider) {
          case "github":
            return ["repo", "read:user", "read:org"];
          case "gitlab":
            return ["read_user", "read_api", "read_repository"];
          case "bitbucket":
            return ["repositories", "account"];
          default:
            return [];
        }
      };

      // Get OAuth authorization URL
      const api = provider.provider === "github" ? githubApi : gitlabApi;
      const response = await api["auth-url"].$post({
        json: {
          redirectUri,
          scopes: getScopes(),
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      // Redirect to OAuth page
      globalThis.window.location.href = data.authUrl;
    } catch (err) {
      console.error("Failed to initiate OAuth:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect provider"
      );
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!accessToken.trim()) {
      setError("Access token is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the manual connect API endpoint
      const api = provider.provider === "github" ? githubApi : gitlabApi;
      const response = await api["connect-manual"].$post({
        json: {
          accessToken: accessToken.trim(),
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      console.log("Successfully connected git provider:", data);

      // Invalidate SWR cache to refresh provider data
      await mutate("/api/providers/git");

      // Update local connection state to show manage view
      setIsConnected(true);

      // Don't close modal automatically - let user see repositories
      // Clear the token input for security
      setAccessToken("");

      // Fetch repositories to show what we have access to
      fetchRepositories();
    } catch (err) {
      console.error("Failed to connect git provider:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect provider"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the disconnect API endpoint
      const response = await gitApi.$delete({
        query: { type: provider.provider },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      console.log("Successfully disconnected git provider:", data);

      // Invalidate SWR cache to refresh provider data
      await mutate("/api/providers/git");

      // Update local connection state
      setIsConnected(false);
      setRepositories([]);

      onClose();
    } catch (err) {
      console.error("Failed to disconnect git provider:", err);
      setError(
        err instanceof Error ? err.message : "Failed to disconnect provider"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div
        className={modalStyles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>
            Connect {config.name} Provider
          </h2>
          <button className={modalStyles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={modalStyles.modalBody}>
          <p className={modalStyles.modalDescription}>
            {isConnected
              ? `Manage your ${config.name} connection and settings.`
              : `Connect your ${config.name} account to receive notifications for pull requests and repository events.`}
          </p>
          {isConnected && (
            <>
              <div className={modalStyles.formGroup}>
                <div className={modalStyles.providerDisplay}>
                  <span className={modalStyles.connectionStatusConnected}>
                    ✓ Connected
                  </span>
                </div>
              </div>
              <div className={modalStyles.formGroup}>
                <div className={modalStyles.formLabel}>
                  Accessible Repositories
                </div>
                <div className={repoStyles.repositoriesSection}>
                  {repositoriesLoading && (
                    <div className={repoStyles.repositoriesLoading}>
                      <span>Loading repositories...</span>
                    </div>
                  )}

                  {repositoriesError && (
                    <div className={repoStyles.repositoriesError}>
                      <span>
                        Error loading repositories: {repositoriesError}
                      </span>
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
                            <div
                              key={repo}
                              className={repoStyles.repositoryItem}
                            >
                              <span className={repoStyles.repoIcon}>📁</span>
                              <span className={repoStyles.repoName}>
                                {repo}
                              </span>
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
                              ⋯ Show {repositories.length - 10} more
                              repositories
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
            </>
          )}
          {!isConnected && (
            <div className={modalStyles.formGroup}>
              {/* Primary OAuth connection - always visible */}
              <div>
                <button
                  className={button({ color: provider.provider })}
                  onClick={handleOAuthConnect}
                  disabled={loading}
                >
                  {loading ? (
                    <>Redirecting to {config.logoDark || config.logo}</>
                  ) : (
                    <>Sign in with {config.logo}</>
                  )}
                </button>
                <small className={modalStyles.formHelp}>
                  {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
                  {config.name} to grant repository access permissions.`}
                </small>
              </div>
              {/* Alternative connection option - hidden by default */}
              <div className={modalStyles.alternativeSection}>
                {showManualOption ? (
                  <div className={modalStyles.manualConnectionWrapper}>
                    <div className={modalStyles.alternativeHeader}>
                      <span>Alternative: Personal Access Token</span>
                      <button
                        className={button({ color: "ghost", size: "xs" })}
                        onClick={() => {
                          setShowManualOption(false);
                          setAccessToken("");
                          setError(null);
                        }}
                        disabled={loading}
                      >
                        ← Back to OAuth
                      </button>
                    </div>

                    <div className={modalStyles.manualConnectSection}>
                      <div className={modalStyles.formGroup}>
                        <label
                          htmlFor="access-token"
                          className={modalStyles.formLabel}
                        >
                          Personal Access Token{" "}
                          <span className={modalStyles.required}>*</span>
                        </label>
                        <div className={modalStyles.inputWithIcon}>
                          <span className={modalStyles.inputIcon}>🔑</span>
                          <input
                            id="access-token"
                            type="password"
                            className={modalStyles.formInput}
                            placeholder={config.placeholder}
                            value={accessToken}
                            onChange={(e) =>
                              setAccessToken(e.currentTarget.value)
                            }
                          />
                        </div>
                        <div className={modalStyles.helpSection}>
                          <div className={modalStyles.helpContent}>
                            <strong>Option 1 (Recommended):</strong>{" "}
                            <a
                              href={getFineGrainedTokenUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={modalStyles.helpLink}
                            >
                              Create a fine-grained token
                            </a>{" "}
                            with repository access and Contents, Metadata, and
                            Pull requests permissions.
                          </div>
                          <div className={modalStyles.helpContent}>
                            <strong>Option 2 (Quick):</strong>{" "}
                            <a
                              href={getClassicTokenUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={modalStyles.helpLink}
                            >
                              Create a classic token
                            </a>{" "}
                            (pre-configured with required scopes).
                          </div>
                        </div>
                      </div>
                      <button
                        className={button({ color: "primary" })}
                        onClick={handleManualConnect}
                        disabled={!accessToken.trim() || loading}
                      >
                        {loading ? "Connecting..." : `Connect with Token`}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={button({
                      color: "ghost",
                      size: "sm",
                      alternative: true,
                    })}
                    onClick={() => {
                      setShowManualOption(true);
                    }}
                    disabled={loading}
                  >
                    Use personal access token instead
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={modalStyles.modalFooter}>
          {error && (
            <div className={modalStyles.modalFooterError}>
              <div className={modalStyles.errorMessage}>{error}</div>
            </div>
          )}
          <div className={modalStyles.modalFooterButtons}>
            {isConnected ? (
              <button
                className={button({ color: "danger" })}
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : (
              <button
                className={button({ color: "outline" })}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

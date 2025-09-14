import React, { useState, useEffect } from "react";
import { mutate } from "swr";

import { GitProviderData } from "../../lib/validation/provider-schemas";
import {
  getProviderColor,
  getProviderBgColor,
  getProviderAccentColor,
} from "../../utils/providerColors";

interface GitProviderModalProps {
  provider: GitProviderData;
  onClose: () => void;
}

export default function GitProviderModal({
  provider,
  onClose,
}: GitProviderModalProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [repositoriesError, setRepositoriesError] = useState<string | null>(
    null
  );
  const [showAllRepositories, setShowAllRepositories] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"oauth" | "manual">(
    "oauth"
  );
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

      const response = await fetch(
        `/api/providers/git/${provider.provider}/repositories`
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
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
          className="provider-logo-button"
        />
      ),
      logoDark: (
        <img
          src="/images/providers/github/GitHub_Lockup_Dark.svg"
          alt="GitHub"
          className="provider-logo-button"
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
          className="provider-logo-button gitlab"
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
          className="provider-logo-button"
        />
      ),
      logoDark: (
        <img
          src="/images/providers/bitbucket/Bitbucket_attribution_light.svg"
          alt="Bitbucket"
          className="provider-logo-button"
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
      const redirectUri = `${window.location.origin}/auth/callback/${provider.provider}`;

      // Get OAuth authorization URL
      const response = await fetch(
        `/api/providers/git/${provider.provider}/auth-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            redirectUri,
            scopes: ["repo", "read:user", "read:org"], // Full access including private repos and org info
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("AUTH_URL RESP BAD", errorText);
        let errorMessage = `Request failed: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("AUTH_URL RESP GOOD", data);
      // Redirect to GitHub OAuth page
      window.location.href = data.authUrl;
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

      // Call the manual connect API endpoint (we need to create this)
      const response = await fetch(
        `/api/providers/git/${provider.provider}/connect-manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: accessToken.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
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
      const response = await fetch(
        `/api/providers/git?type=${provider.provider}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={
          {
            "--provider-color": getProviderColor(provider.provider),
            "--provider-bg-color": getProviderBgColor(provider.provider),
            "--provider-accent-color": getProviderAccentColor(
              provider.provider
            ),
          } as React.CSSProperties
        }
      >
        <div className="modal-header">
          <h2>Connect {config.name} Provider</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {isConnected
              ? `Manage your ${config.name} connection and settings.`
              : `Connect your ${config.name} account to receive notifications for pull requests and repository events.`}
          </p>

          <div className="form-group">
            <div className="provider-display">
              {isConnected && (
                <span className="connection-status connected">✓ Connected</span>
              )}
            </div>
          </div>

          {isConnected && (
            <div className="form-group">
              <label>Accessible Repositories</label>
              <div className="repositories-section">
                {repositoriesLoading && (
                  <div className="repositories-loading">
                    <span>Loading repositories...</span>
                  </div>
                )}

                {repositoriesError && (
                  <div className="repositories-error">
                    <span>Error loading repositories: {repositoriesError}</span>
                    <button
                      className="retry-button"
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
                    <div className="repositories-list">
                      <div className="repositories-count">
                        {repositories.length} repositories accessible
                      </div>
                      <div className="repositories-container">
                        {(showAllRepositories
                          ? repositories
                          : repositories.slice(0, 10)
                        ).map((repo) => (
                          <div key={repo} className="repository-item">
                            <span className="repo-icon">📁</span>
                            <span className="repo-name">{repo}</span>
                          </div>
                        ))}
                        {repositories.length > 10 && !showAllRepositories && (
                          <button
                            className="show-more-button"
                            onClick={() => setShowAllRepositories(true)}
                          >
                            ⋯ Show {repositories.length - 10} more repositories
                          </button>
                        )}
                        {showAllRepositories && repositories.length > 10 && (
                          <button
                            className="show-less-button"
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
                    <div className="repositories-empty">
                      <span>No repositories found</span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="form-group">
              {/* Primary OAuth connection - always visible */}
              <div className="primary-connection-section">
                {error && connectionMethod === "oauth" && (
                  <div className="error-message prominent-error">{error}</div>
                )}
                <button
                  className="oauth-connect-button primary provider-branded"
                  onClick={handleOAuthConnect}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="oauth-button-content">
                      Redirecting to {config.logoDark || config.logo}
                    </span>
                  ) : (
                    <span className="oauth-button-content">
                      Sign in with {config.logo}
                    </span>
                  )}
                </button>
                <small className="form-help oauth-help">
                  {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
                  {config.name} to grant repository access permissions.`}
                </small>
              </div>

              {/* Alternative connection option - hidden by default */}
              <div className="alternative-connection-section">
                {!showManualOption ? (
                  <button
                    className="show-alternative-button"
                    onClick={() => {
                      setShowManualOption(true);
                      setConnectionMethod("manual");
                    }}
                    disabled={loading}
                  >
                    Use personal access token instead
                  </button>
                ) : (
                  <div className="manual-connection-wrapper">
                    <div className="alternative-header">
                      <span>Alternative: Personal Access Token</span>
                      <button
                        className="hide-alternative-button"
                        onClick={() => {
                          setShowManualOption(false);
                          setConnectionMethod("oauth");
                          setAccessToken("");
                          setError(null);
                        }}
                        disabled={loading}
                      >
                        ← Back to OAuth
                      </button>
                    </div>

                    <div className="manual-connect-section">
                      <div className="token-input-group">
                        <label htmlFor="access-token">
                          Personal Access Token{" "}
                          <span className="required">*</span>
                        </label>
                        <div className="input-with-icon">
                          <span className="input-icon">🔑</span>
                          <input
                            id="access-token"
                            type="password"
                            className="form-input"
                            placeholder={config.placeholder}
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                          />
                        </div>
                        <div className="token-help">
                          <div className="token-option">
                            <strong>Option 1 (Recommended):</strong>{" "}
                            <a
                              href={getFineGrainedTokenUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="help-link"
                            >
                              Create a fine-grained token
                            </a>{" "}
                            with repository access and Contents, Metadata, and
                            Pull requests permissions.
                          </div>
                          <div className="token-option">
                            <strong>Option 2 (Quick):</strong>{" "}
                            <a
                              href={getClassicTokenUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="help-link"
                            >
                              Create a classic token
                            </a>{" "}
                            (pre-configured with required scopes).
                          </div>
                        </div>
                      </div>
                      {error && connectionMethod === "manual" && (
                        <div className="error-message prominent-error">
                          {error}
                        </div>
                      )}
                      <button
                        className="manual-connect-button"
                        onClick={handleManualConnect}
                        disabled={!accessToken.trim() || loading}
                      >
                        {loading ? "Connecting..." : `Connect with Token`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isConnected ? (
            <button
              className="disconnect-button"
              onClick={handleDisconnect}
              disabled={loading}
            >
              {loading ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

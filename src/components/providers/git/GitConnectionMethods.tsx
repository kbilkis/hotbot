import { useState } from "preact/hooks";

import { GitProviderData } from "@/lib/validation/provider-schemas";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

import { getProviderApi } from "./utils";

interface GitConnectionMethodsProps {
  provider: GitProviderData;
  onConnectionSuccess: () => void;
  onError: (error: string) => void;
}

export default function GitConnectionMethods({
  provider,
  onConnectionSuccess,
  onError,
}: Readonly<GitConnectionMethodsProps>) {
  const [loading, setLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<
    "oauth" | "app" | "manual"
  >("oauth");
  const [accessToken, setAccessToken] = useState("");

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

  const getClassicTokenUrl = () => {
    const urls = {
      github:
        "https://github.com/settings/tokens/new?scopes=repo,read:user,read:org&description=Git%20Messaging%20Scheduler",
      gitlab: "https://gitlab.com/-/profile/personal_access_tokens",
      bitbucket: "https://bitbucket.org/account/settings/app-passwords/new",
    };
    return urls[provider.provider];
  };

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      onError("");

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
            // TODO: Add bitbucketApi when implemented
            throw new Error("Bitbucket API not yet implemented");
          default:
            return [];
        }
      };

      // Get OAuth authorization URL
      const api = getProviderApi(provider.provider);
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
      onError(
        err instanceof Error ? err.message : "Failed to connect provider"
      );
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!accessToken.trim()) {
      onError("Access token is required");
      return;
    }

    try {
      setLoading(true);
      onError("");

      // Call the manual connect API endpoint
      const api = getProviderApi(provider.provider);
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

      setAccessToken("");
      onConnectionSuccess();
    } catch (err) {
      console.error("Failed to connect git provider:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect provider"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAppInstall = () => {
    try {
      setLoading(true);
      onError("");

      const appName = "hotbot-sh";

      const installUrl = `https://github.com/apps/${appName}/installations/new`;

      console.log("GitHub App installation URL:", installUrl);

      // Redirect to GitHub App installation page
      globalThis.location.href = installUrl;
    } catch (err) {
      console.error("Failed to initiate GitHub App installation:", err);
      onError(
        err instanceof Error
          ? err.message
          : "Failed to start GitHub App installation"
      );
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.formGroup}>
      {/* Connection Type Selection - Only for GitHub */}
      {provider.provider === "github" && (
        <div className={modalStyles.connectionTypeSection}>
          <h4 className={modalStyles.sectionTitle}>Choose Connection Type</h4>
          <div className={modalStyles.connectionOptions}>
            <label className={modalStyles.connectionOption}>
              <input
                type="radio"
                name="connectionType"
                value="oauth"
                checked={connectionType === "oauth"}
                onChange={() => setConnectionType("oauth")}
                disabled={loading}
                aria-label="Connect via personal account using OAuth"
              />
              <div className={modalStyles.connectionOptionContent}>
                <strong>Personal Account</strong>
                <span>Connect your personal GitHub account (OAuth)</span>
                <small>✓ Quick setup ✓ Access to all your repositories</small>
              </div>
            </label>
            <label className={modalStyles.connectionOption}>
              <input
                type="radio"
                name="connectionType"
                value="app"
                checked={connectionType === "app"}
                onChange={() => setConnectionType("app")}
                disabled={loading}
                aria-label="Connect via organization using GitHub App"
              />
              <div className={modalStyles.connectionOptionContent}>
                <strong>Organization</strong>
                <span>Connect via GitHub App installation</span>
                <small>
                  ✓ Real-time webhooks ✓ Better for teams ✓ Higher rate limits
                </small>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* OAuth Connection */}
      {connectionType === "oauth" && (
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
            ${config.name} to grant repository access permissions.`}
          </small>
        </div>
      )}

      {/* GitHub App Connection */}
      {provider.provider === "github" && connectionType === "app" && (
        <div>
          <button
            className={button({ color: "primary" })}
            onClick={handleGitHubAppInstall}
            disabled={loading}
          >
            {loading ? (
              <>Installing GitHub App...</>
            ) : (
              <>Install & Connect GitHub App</>
            )}
          </button>
          <small className={modalStyles.formHelp}>
            🔒 You&apos;ll be redirected to GitHub to install our app on your
            organization or personal account. After installation, you&apos;ll be
            automatically connected with webhook support.
          </small>
        </div>
      )}

      {/* Manual Token Option */}
      {(connectionType === "oauth" || connectionType === "manual") && (
        <div className={modalStyles.alternativeSection}>
          {connectionType === "manual" ? (
            <div className={modalStyles.manualConnectionWrapper}>
              <div className={modalStyles.alternativeHeader}>
                <span>Personal Access Token</span>
                <button
                  className={button({ color: "ghost", size: "xs" })}
                  onClick={() => {
                    setConnectionType("oauth");
                    setAccessToken("");
                    onError("");
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
                      onChange={(e) => setAccessToken(e.currentTarget.value)}
                    />
                  </div>
                  <div className={modalStyles.helpSection}>
                    <div className={modalStyles.helpContent}>
                      <a
                        href={getClassicTokenUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={modalStyles.helpLink}
                      >
                        Create a personal access token
                      </a>{" "}
                      with repository access permissions.
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
                setConnectionType("manual");
              }}
              disabled={loading}
            >
              Use personal access token instead
            </button>
          )}
        </div>
      )}
    </div>
  );
}

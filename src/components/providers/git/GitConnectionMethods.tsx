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
  const [connectionType, setConnectionType] = useState<"oauth" | "app">(
    "oauth"
  );
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
          <h5 className={modalStyles.sectionTitle}>
            Quick Setup (Recommended)
          </h5>
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
          <a
            href="https://github.com/apps/hotbot-sh/installations/new"
            className={button({ color: "primary" })}
          >
            Install & Connect GitHub App
          </a>
          <small className={modalStyles.formHelp}>
            🔒 You&apos;ll be redirected to GitHub to install our app on your
            organization or personal account. After installation, you&apos;ll be
            automatically connected with webhook support.
          </small>
        </div>
      )}

      {/* Personal Access Token Option - Only for Personal Account */}
      {connectionType === "oauth" && (
        <div className={modalStyles.alternativeSection}>
          <div className={modalStyles.manualConnectSection}>
            <h5 className={modalStyles.sectionTitle}>
              Or use a Personal Access Token
            </h5>
            <div className={modalStyles.formGroup}>
              <label htmlFor="access-token" className={modalStyles.formLabel}>
                Personal Access Token (optional)
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
                  Alternative to OAuth:{" "}
                  <a
                    href={getClassicTokenUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={modalStyles.helpLink}
                  >
                    Create a personal access token
                  </a>{" "}
                  for manual authentication.
                </div>
              </div>
            </div>
            {accessToken.trim() && (
              <button
                className={button({ color: "secondary" })}
                onClick={handleManualConnect}
                disabled={loading}
              >
                {loading ? "Connecting..." : `Connect with Token`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

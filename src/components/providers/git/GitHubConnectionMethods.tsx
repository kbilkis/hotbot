import { useState } from "preact/hooks";

import { githubApi } from "@/lib/api/client";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

interface GitHubConnectionMethodsProps {
  onConnectionSuccess: () => void;
  onError: (error: string) => void;
}

export default function GitHubConnectionMethods({
  onConnectionSuccess,
  onError,
}: Readonly<GitHubConnectionMethodsProps>) {
  const [loading, setLoading] = useState(false);
  const [showPersonalAccount, setShowPersonalAccount] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      onError("");

      const redirectUri = `${globalThis.window.location.origin}/auth/callback/github`;
      const scopes = ["repo", "read:user", "read:org"];

      const response = await githubApi["auth-url"].$post({
        json: { redirectUri, scopes },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      globalThis.window.location.href = data.authUrl;
    } catch (err) {
      console.error("Failed to initiate OAuth:", err);
      onError(err instanceof Error ? err.message : "Failed to connect GitHub");
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

      const response = await githubApi["connect-manual"].$post({
        json: { accessToken: accessToken.trim() },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      setAccessToken("");
      onConnectionSuccess();
    } catch (err) {
      console.error("Failed to connect GitHub:", err);
      onError(err instanceof Error ? err.message : "Failed to connect GitHub");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.formGroup}>
      {/* Primary: GitHub App (Recommended) */}
      <div>
        <h4 className={modalStyles.sectionTitle}>
          Connect GitHub App (Recommended)
        </h4>
        <p className={modalStyles.sectionDescription}>
          Best for organizations and teams. Provides webhooks and higher rate
          limits.
        </p>
        <a
          href="https://github.com/apps/hotbot-sh/installations/new"
          className={button({ color: "github" })}
        >
          <img
            src="/images/providers/github/GitHub_Lockup_Light.svg"
            alt="GitHub"
            className={modalStyles.providerLogoButton}
          />{" "}
          Install GitHub App
        </a>
      </div>

      {/* Secondary: Personal Account (Hidden by default) */}
      <div className={modalStyles.alternativeSection}>
        {showPersonalAccount ? (
          <div className={modalStyles.personalAccountSection}>
            <div className={modalStyles.personalAccountHeader}>
              <span className={modalStyles.personalAccountTitle}>
                Personal Account
              </span>
              <button
                className={button({ color: "ghost", size: "xs" })}
                onClick={() => {
                  setShowPersonalAccount(false);
                  setAccessToken("");
                  onError("");
                }}
                disabled={loading}
              >
                ✕
              </button>
            </div>

            {/* Simplified options - side by side */}
            <div className={modalStyles.personalAccountOptions}>
              <button
                className={button({ color: "github", size: "sm" })}
                onClick={handleOAuthConnect}
                disabled={loading}
              >
                {loading ? (
                  "Redirecting..."
                ) : (
                  <>
                    <img
                      src="/images/providers/github/GitHub_Lockup_Light.svg"
                      alt="GitHub"
                      className={modalStyles.providerLogoButton}
                    />{" "}
                    Sign in with GitHub
                  </>
                )}
              </button>

              <div className={modalStyles.tokenInputGroup}>
                <input
                  type="password"
                  className={modalStyles.tokenInput}
                  placeholder="Or paste personal access token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.currentTarget.value)}
                />
                {accessToken.trim() && (
                  <button
                    className={button({ color: "primary", size: "sm" })}
                    onClick={handleManualConnect}
                    disabled={loading}
                  >
                    {loading ? "..." : "Connect"}
                  </button>
                )}
              </div>
            </div>

            {accessToken.trim() && (
              <small className={modalStyles.tokenHelp}>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user,read:org&description=Git%20Messaging%20Scheduler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={modalStyles.helpLink}
                >
                  Need a token?
                </a>
              </small>
            )}
          </div>
        ) : (
          <button
            className={button({ color: "ghost", size: "sm" })}
            onClick={() => setShowPersonalAccount(true)}
            disabled={loading}
          >
            Connect personal account instead?
          </button>
        )}
      </div>
    </div>
  );
}

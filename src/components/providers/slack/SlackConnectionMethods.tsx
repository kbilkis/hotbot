import { useState } from "preact/hooks";

import { slackApi } from "@/lib/api/client";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

interface SlackConnectionMethodsProps {
  onConnectionSuccess: () => void;
  onError: (error: string) => void;
}

export default function SlackConnectionMethods({
  onConnectionSuccess,
  onError,
}: Readonly<SlackConnectionMethodsProps>) {
  const [loading, setLoading] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      onError("");

      const response = await slackApi["auth-url"].$post({
        json: {
          redirectUri: `${globalThis.window.location.origin}/auth/callback/slack`,
          scopes: [
            "channels:read",
            "chat:write",
            "chat:write.public",
            "groups:read",
          ],
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Redirect to Slack OAuth page
      globalThis.window.location.href = data.authUrl;
    } catch (err) {
      console.error("Failed to initiate Slack OAuth:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect to Slack"
      );
    } finally {
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

      const response = await slackApi["connect-manual"].$post({
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

      console.log("Successfully connected Slack:", data);

      setAccessToken("");
      onConnectionSuccess();
    } catch (err) {
      console.error("Failed to connect Slack:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect to Slack"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.formGroup}>
      {/* Primary OAuth connection - always visible */}
      <div>
        <button
          className={button({ color: "slack" })}
          onClick={handleOAuthConnect}
          disabled={loading}
        >
          {loading ? (
            <>
              Redirecting to{" "}
              <img
                src="images/providers/slack/SLA-Slack-from-Salesforce-logo-inverse.png"
                alt="Slack"
                className={modalStyles.oauthButtonLogo}
              />
            </>
          ) : (
            <>
              Sign in with{" "}
              <img
                src="images/providers/slack/SLA-Slack-from-Salesforce-logo-inverse.png"
                alt="Slack"
                className={modalStyles.oauthButtonLogo}
              />
            </>
          )}
        </button>
        <small className={modalStyles.formHelp}>
          {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
          Slack to grant channel access permissions.`}
        </small>
      </div>

      {/* Alternative connection option - hidden by default */}
      <div className={modalStyles.alternativeSection}>
        {showManualOption ? (
          <div className={modalStyles.manualConnectionWrapper}>
            <div className={modalStyles.alternativeHeader}>
              <span>Alternative: Bot Token</span>
              <button
                className={button({ color: "ghost", size: "xs" })}
                onClick={() => {
                  setShowManualOption(false);
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
                <label htmlFor="bot-token" className={modalStyles.formLabel}>
                  Bot Token <span className={modalStyles.required}>*</span>
                </label>
                <div className={modalStyles.inputWithIcon}>
                  <span className={modalStyles.inputIcon}>🤖</span>
                  <input
                    id="bot-token"
                    type="password"
                    className={modalStyles.formInput}
                    placeholder="xoxb-..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.currentTarget.value)}
                  />
                </div>
                <div className={modalStyles.helpSection}>
                  <div className={modalStyles.helpContent}>
                    <strong>How to get a bot token:</strong>
                    <ol>
                      <li>
                        Go to{" "}
                        <a
                          href="https://api.slack.com/apps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={modalStyles.helpLink}
                        >
                          api.slack.com/apps
                        </a>
                      </li>
                      <li>Create a new app or select an existing one</li>
                      <li>
                        {`Go to "OAuth & Permissions" and add these
                        scopes:`}
                        <ul>
                          <li>
                            <code>channels:read</code> - View public channels
                          </li>
                          <li>
                            <code>chat:write</code> - Send messages
                          </li>
                          <li>
                            <code>chat:write.public</code> - Send to public
                            channels
                          </li>
                          <li>
                            <code>groups:read</code> - View private channels
                          </li>
                        </ul>
                      </li>
                      <li>Install the app to your workspace</li>
                      <li>{`Copy the "Bot User OAuth Token"`}</li>
                    </ol>
                  </div>
                </div>
              </div>
              <button
                className={button({ color: "primary" })}
                onClick={handleManualConnect}
                disabled={!accessToken.trim() || loading}
              >
                {loading ? "Connecting..." : "Connect with Token"}
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
            Use bot token instead
          </button>
        )}
      </div>
    </div>
  );
}

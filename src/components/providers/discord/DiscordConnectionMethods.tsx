import { useState } from "preact/hooks";

import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { discordApi } from "@/lib/api/client";
import * as channelStyles from "@/styles/providers/channels.css";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

interface DiscordConnectionMethodsProps {
  onConnectionSuccess: (username: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function DiscordConnectionMethods({
  onConnectionSuccess,
  onError,
  onClose,
}: Readonly<DiscordConnectionMethodsProps>) {
  const [loading, setLoading] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<
    "oauth" | "manual" | "webhook"
  >("oauth");
  const [showManualOption, setShowManualOption] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const { refetch } = useMessagingProviders();

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      onError("");

      // Get the current URL for redirect
      const redirectUri = `${globalThis.window.location.origin}/auth/callback/discord`;

      // Get OAuth authorization URL
      const response = await discordApi["auth-url"].$post({
        json: {
          redirectUri,
          scopes: ["bot", "applications.commands"],
          permissions: "68608", // VIEW_CHANNEL + SEND_MESSAGES + READ_MESSAGE_HISTORY
        },
      });

      const data = await response.json();
      if (data.success) {
        // Redirect to Discord OAuth page
        globalThis.window.location.href = data.authUrl;
      } else {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Failed to initiate Discord OAuth:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect to Discord"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (connectionMethod === "manual" && !accessToken.trim()) {
      onError("Access token is required");
      return;
    }

    if (connectionMethod === "webhook" && !webhookUrl.trim()) {
      onError("Webhook URL is required");
      return;
    }

    try {
      setLoading(true);
      onError("");

      if (connectionMethod === "manual") {
        // Call the manual connect API endpoint
        const response = await discordApi["connect-manual"].$post({
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

        console.log("Successfully connected Discord:", data);

        refetch();
        setAccessToken("");
        onConnectionSuccess(data.userInfo?.username || "Discord User");
      } else {
        // Webhook connection - just store the webhook URL
        console.log("Connecting Discord webhook:", { webhookUrl });
        // For webhook connections, we don't store in the database
        // This is handled differently in the scheduling logic
        onClose();
      }
    } catch (err) {
      console.error("Failed to connect Discord:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect to Discord"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (webhookUrl: string, guildName: string) => {
    try {
      setTestingWebhook(webhookUrl);
      onError("");

      const response = await discordApi["test-webhook"].$post({
        json: {
          webhookUrl,
          message: `🧪 Test message from HotBot - connection successful! (${new Date().toLocaleTimeString()})`,
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log("Successfully sent test message:", data);

      // Store test result
      setTestResults((prev) => ({
        ...prev,
        [webhookUrl]: {
          success: true,
          message: `✅ Test message sent successfully to ${guildName}`,
        },
      }));
    } catch (err) {
      console.error("Failed to send test message:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send test message";

      setTestResults((prev) => ({
        ...prev,
        [webhookUrl]: {
          success: false,
          message: `❌ Failed to send test message: ${errorMessage}`,
        },
      }));
    } finally {
      setTestingWebhook(null);
    }
  };

  return (
    <div className={modalStyles.formGroup}>
      {/* Primary OAuth connection - always visible */}
      <div>
        <button
          className={button({ color: "discord" })}
          onClick={handleOAuthConnect}
          disabled={loading}
        >
          {loading ? (
            <>
              Redirecting to{" "}
              <img
                src="/images/providers/discord/Discord-Logo-White.svg"
                alt="Discord"
                className={modalStyles.oauthButtonLogo}
              />
            </>
          ) : (
            <>
              Sign in with{" "}
              <img
                src="/images/providers/discord/Discord-Logo-White.svg"
                alt="Discord"
                className={modalStyles.oauthButtonLogo}
              />
            </>
          )}
        </button>
        <small className={modalStyles.formHelp}>
          {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
          Discord to grant server access permissions.`}
        </small>
      </div>

      {/* Alternative connection options - hidden by default */}
      <div className={modalStyles.alternativeSection}>
        {showManualOption ? (
          <div className={modalStyles.manualConnectionWrapper}>
            <div className={modalStyles.alternativeHeader}>
              <span>Alternative Connection Methods</span>
              <button
                className={button({ color: "ghost", size: "xs" })}
                onClick={() => {
                  setShowManualOption(false);
                  setConnectionMethod("oauth");
                  setAccessToken("");
                  setWebhookUrl("");
                  onError("");
                }}
                disabled={loading}
              >
                ← Back to OAuth
              </button>
            </div>

            <div className={channelStyles.connectionMethodTabs}>
              <button
                className={
                  connectionMethod === "manual"
                    ? channelStyles.methodTabActive
                    : channelStyles.methodTab
                }
                onClick={() => {
                  setConnectionMethod("manual");
                  onError("");
                }}
              >
                Bot Token
              </button>
              <button
                className={
                  connectionMethod === "webhook"
                    ? channelStyles.methodTabActive
                    : channelStyles.methodTab
                }
                onClick={() => {
                  setConnectionMethod("webhook");
                  onError("");
                }}
              >
                Webhook URL
              </button>
            </div>

            {connectionMethod === "manual" && (
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
                      placeholder="Bot token..."
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
                            href="https://discord.com/developers/applications"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={modalStyles.helpLink}
                          >
                            Discord Developer Portal
                          </a>
                        </li>
                        <li>Create a new application or select existing</li>
                        <li>Go to &quot;Bot&quot; section and create a bot</li>
                        <li>Copy the bot token</li>
                        <li>
                          Invite bot to your server with appropriate permissions
                        </li>
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
            )}

            {connectionMethod === "webhook" && (
              <div className={channelStyles.webhookConnectSection}>
                <div className={channelStyles.discordSetupInfo}>
                  <h3>How to set up Discord webhook:</h3>
                  <ol>
                    <li>Go to your Discord server channel</li>
                    <li>
                      Click &quot;Edit Channel&quot; → &quot;Integrations&quot;
                      → &quot;Webhooks&quot;
                    </li>
                    <li>Click &quot;New Webhook&quot; and configure it</li>
                    <li>Copy the webhook URL and paste it below</li>
                  </ol>
                </div>

                <div className={modalStyles.formGroup}>
                  <label
                    htmlFor="webhook-url"
                    className={modalStyles.formLabel}
                  >
                    Webhook URL <span className={modalStyles.required}>*</span>
                  </label>
                  <div className={modalStyles.inputWithIcon}>
                    <span className={modalStyles.inputIcon}>🔗</span>
                    <input
                      id="webhook-url"
                      type="url"
                      className={modalStyles.formInput}
                      placeholder="https://discord.com/api/webhooks/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.currentTarget.value)}
                    />
                  </div>
                  <small className={modalStyles.formHelp}>
                    Create a webhook URL in your Discord server settings
                  </small>
                </div>

                <button
                  className={button({ color: "discord" })}
                  onClick={handleManualConnect}
                  disabled={!webhookUrl.trim() || loading}
                >
                  {loading ? "Connecting..." : "Connect with Webhook"}
                </button>

                {webhookUrl.trim() && (
                  <button
                    className={button({ color: "info", size: "xs" })}
                    onClick={() =>
                      handleTestWebhook(webhookUrl, "Discord Server")
                    }
                    disabled={testingWebhook === webhookUrl}
                  >
                    {testingWebhook === webhookUrl
                      ? "Testing..."
                      : "Test Webhook"}
                  </button>
                )}

                {testResults[webhookUrl] && (
                  <div
                    className={
                      testResults[webhookUrl].success
                        ? channelStyles.testResultSuccess
                        : channelStyles.testResultError
                    }
                  >
                    {testResults[webhookUrl].message}
                  </div>
                )}
              </div>
            )}
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
              setConnectionMethod("manual");
            }}
            disabled={loading}
          >
            Use bot token or webhook instead
          </button>
        )}
      </div>
    </div>
  );
}

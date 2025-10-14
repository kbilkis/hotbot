import { useState, useEffect } from "preact/hooks";
import { mutate } from "swr";

import { useDiscordGuilds, useDiscordChannels } from "../../hooks/useChannels";
import { discordApi, messagingApi } from "../../lib/api/client";
import * as channelStyles from "../../styles/providers/channels.css";
import * as modalStyles from "../../styles/providers/modal.css";
import {
  getProviderColor,
  getProviderBgColor,
  getProviderAccentColor,
} from "../../utils/providerColors";

interface DiscordProviderModalProps {
  onClose: () => void;
  isConnected?: boolean;
  connectedAt?: string;
  username?: string;
}

export default function DiscordProviderModal({
  onClose,
  isConnected: initialIsConnected = false,
  username: initialUsername = "",
}: DiscordProviderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [connectionMethod, setConnectionMethod] = useState<
    "oauth" | "manual" | "webhook"
  >("oauth");
  const [showManualOption, setShowManualOption] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [username, setUsername] = useState(initialUsername);

  // Use hooks for Discord data fetching
  const {
    guilds,
    loading: guildsLoading,
    error: guildsError,
    refetch: refetchGuilds,
  } = useDiscordGuilds(isConnected);
  const { channels, loading: channelsLoading } = useDiscordChannels(
    selectedGuild || undefined,
    !!selectedGuild
  );

  // Hooks handle all data fetching automatically

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  // Fetch additional data when connected
  useEffect(() => {
    if (isConnected) {
      fetchAdditionalData();
    }
  }, [isConnected]);

  const fetchAdditionalData = async () => {
    try {
      const userResponse = await discordApi.user.$get();
      const userData = await userResponse.json();
      if (userData.success && !username) {
        setUsername(userData.data.username || "Discord User");
      } else {
        throw new Error(userData.message);
      }
    } catch (err) {
      console.error("Failed to fetch additional Discord info:", err);
    }
  };

  // Hooks handle all data fetching automatically

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current URL for redirect
      const redirectUri = `${window.location.origin}/auth/callback/discord`;

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
        window.location.href = data.authUrl;
      } else {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Failed to initiate Discord OAuth:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to Discord"
      );
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (connectionMethod === "manual" && !accessToken.trim()) {
      setError("Access token is required");
      return;
    }

    if (connectionMethod === "webhook" && !webhookUrl.trim()) {
      setError("Webhook URL is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

        // Invalidate SWR cache to refresh provider data
        await mutate("/api/providers/messaging");

        // Update local connection state
        setIsConnected(true);
        setUsername(data.userInfo?.username || "Discord User");

        // Trigger guilds refetch
        refetchGuilds();

        // Clear the token input for security
        setAccessToken("");
      } else {
        // Webhook connection - just store the webhook URL
        console.log("Connecting Discord webhook:", { webhookUrl });
        // For webhook connections, we don't store in the database
        // This is handled differently in the scheduling logic
        onClose();
      }
    } catch (err) {
      console.error("Failed to connect Discord:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to Discord"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestChannel = async (channelId: string, channelName: string) => {
    try {
      setTestingChannel(channelId);
      setError(null);

      const response = await discordApi["test-channel"].$post({
        json: {
          channelId,
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
        [channelId]: {
          success: true,
          message: `✅ Test message sent successfully to #${channelName}`,
        },
      }));
    } catch (err) {
      console.error("Failed to send test message:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send test message";

      setTestResults((prev) => ({
        ...prev,
        [channelId]: {
          success: false,
          message: `❌ Failed to send test message: ${errorMessage}`,
        },
      }));
    } finally {
      setTestingChannel(null);
    }
  };

  const handleTestWebhook = async (webhookUrl: string, guildName: string) => {
    try {
      setTestingWebhook(webhookUrl);
      setError(null);

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

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the disconnect API endpoint
      const response = await messagingApi.$delete({
        query: { type: "discord" },
      });
      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log("Successfully disconnected Discord:", data);

      // Invalidate SWR cache to refresh provider data
      await mutate("/api/providers/messaging");

      // Update local connection state
      setIsConnected(false);
      setSelectedGuild(null);
      setUsername("");

      onClose();
    } catch (err) {
      console.error("Failed to disconnect Discord:", err);
      setError(
        err instanceof Error ? err.message : "Failed to disconnect Discord"
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
        style={
          {
            "--provider-color": getProviderColor("discord"),
            "--provider-bg-color": getProviderBgColor("discord"),
            "--provider-accent-color": getProviderAccentColor("discord"),
          } as preact.CSSProperties
        }
      >
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>Connect Discord</h2>
          <button className={modalStyles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={modalStyles.modalBody}>
          <p className={modalStyles.modalDescription}>
            {isConnected
              ? `Manage your Discord connection and server settings.`
              : `Connect your Discord server to receive pull request notifications in your channels.`}
          </p>

          {isConnected && (
            <div className={modalStyles.formGroup}>
              <div className={modalStyles.providerDisplay}>
                <span className={modalStyles.connectionStatusConnected}>
                  ✓ Connected
                </span>
                {username && (
                  <span className={modalStyles.teamName}>as {username}</span>
                )}
              </div>
            </div>
          )}

          {isConnected && (
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.formLabel}>Available Servers</label>
              <div>
                {guildsLoading && (
                  <div className={modalStyles.loadingState}>
                    <span>Loading servers...</span>
                  </div>
                )}

                {guildsError && (
                  <div className={modalStyles.errorState}>
                    <span>Error loading servers: {guildsError}</span>
                    <button
                      className={modalStyles.retryButton}
                      onClick={refetchGuilds}
                      disabled={guildsLoading}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!guildsLoading && !guildsError && guilds.length > 0 && (
                  <div>
                    <div className={modalStyles.itemCount}>
                      {guilds.length} server{guilds.length !== 1 ? "s" : ""}{" "}
                      available
                    </div>
                    <div className={channelStyles.guildsContainer}>
                      {guilds.map((guild) => (
                        <div key={guild.id} className={channelStyles.guildItem}>
                          <div className={channelStyles.guildHeader}>
                            <div className={channelStyles.guildIcon}>🏰</div>
                            <span className={channelStyles.guildName}>
                              {guild.name}
                            </span>
                            <button
                              className={
                                selectedGuild === guild.id
                                  ? channelStyles.selectGuildButtonSelected
                                  : channelStyles.selectGuildButton
                              }
                              onClick={() => setSelectedGuild(guild.id)}
                              disabled={selectedGuild === guild.id}
                            >
                              {selectedGuild === guild.id
                                ? "Selected"
                                : "Select"}
                            </button>
                          </div>

                          {selectedGuild === guild.id && (
                            <div className={channelStyles.guildChannels}>
                              <div className={channelStyles.guildChannelsTitle}>
                                Channels
                              </div>
                              {channelsLoading && (
                                <div className={modalStyles.loadingState}>
                                  <span>Loading channels...</span>
                                </div>
                              )}

                              {!channelsLoading && channels.length > 0 && (
                                <div>
                                  <div className={modalStyles.itemCount}>
                                    {channels.length} text channel
                                    {channels.length !== 1 ? "s" : ""}
                                  </div>
                                  <div
                                    className={channelStyles.channelsContainer}
                                  >
                                    {channels.map((channel) => (
                                      <div
                                        key={channel.id}
                                        className={channelStyles.channelItem}
                                      >
                                        <div
                                          className={channelStyles.channelInfo}
                                        >
                                          <span
                                            className={
                                              channelStyles.channelIcon
                                            }
                                          >
                                            #
                                          </span>
                                          <span
                                            className={
                                              channelStyles.channelName
                                            }
                                          >
                                            {channel.name}
                                          </span>
                                        </div>
                                        <div
                                          className={
                                            channelStyles.channelActions
                                          }
                                        >
                                          <button
                                            className={
                                              testingChannel === channel.id
                                                ? channelStyles.testButtonTesting
                                                : channelStyles.testButton
                                            }
                                            onClick={() =>
                                              handleTestChannel(
                                                channel.id,
                                                channel.name ||
                                                  "Unknown Channel"
                                              )
                                            }
                                            disabled={
                                              testingChannel === channel.id
                                            }
                                            title={`Send test message to #${channel.name}`}
                                          >
                                            {testingChannel === channel.id
                                              ? "Sending..."
                                              : "Test message"}
                                          </button>
                                        </div>
                                        {testResults[channel.id] && (
                                          <div
                                            className={
                                              testResults[channel.id].success
                                                ? channelStyles.testResultSuccess
                                                : channelStyles.testResultError
                                            }
                                          >
                                            {testResults[channel.id].message}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!channelsLoading && channels.length === 0 && (
                                <div className={modalStyles.emptyState}>
                                  <span>No text channels found</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!guildsLoading && !guildsError && guilds.length === 0 && (
                  <div className={modalStyles.emptyState}>
                    <span>No servers found with webhook permissions</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isConnected && (
            <div className={modalStyles.formGroup}>
              {/* Primary OAuth connection - always visible */}
              <div>
                <button
                  className={`${modalStyles.oauthButtonPrimary} ${modalStyles.providerBranded}`}
                  onClick={handleOAuthConnect}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={modalStyles.oauthButtonContent}>
                      Redirecting to{" "}
                      <img
                        src="/images/providers/discord/Discord-Logo-White.svg"
                        alt="Discord"
                        className={modalStyles.oauthButtonLogo}
                      />
                    </span>
                  ) : (
                    <span className={modalStyles.oauthButtonContent}>
                      Sign in with{" "}
                      <img
                        src="/images/providers/discord/Discord-Logo-White.svg"
                        alt="Discord"
                        className={modalStyles.oauthButtonLogo}
                      />
                    </span>
                  )}
                </button>
                <small className={modalStyles.formHelp}>
                  {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
                  Discord to grant server access permissions.`}
                </small>
              </div>

              {/* Alternative connection options - hidden by default */}
              <div className={modalStyles.alternativeSection}>
                {!showManualOption ? (
                  <button
                    className={modalStyles.showAlternativeButton}
                    onClick={() => {
                      setShowManualOption(true);
                      setConnectionMethod("manual");
                    }}
                    disabled={loading}
                  >
                    Use bot token or webhook instead
                  </button>
                ) : (
                  <div className={modalStyles.manualConnectionWrapper}>
                    <div className={modalStyles.alternativeHeader}>
                      <span>Alternative Connection Methods</span>
                      <button
                        className={modalStyles.hideAlternativeButton}
                        onClick={() => {
                          setShowManualOption(false);
                          setConnectionMethod("oauth");
                          setAccessToken("");
                          setWebhookUrl("");
                          setError(null);
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
                          setError(null);
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
                          setError(null);
                        }}
                      >
                        Webhook URL
                      </button>
                    </div>

                    {connectionMethod === "manual" && (
                      <div className={modalStyles.manualConnectSection}>
                        <div className={modalStyles.formGroup}>
                          <label
                            htmlFor="bot-token"
                            className={modalStyles.formLabel}
                          >
                            Bot Token{" "}
                            <span className={modalStyles.required}>*</span>
                          </label>
                          <div className={modalStyles.inputWithIcon}>
                            <span className={modalStyles.inputIcon}>🤖</span>
                            <input
                              id="bot-token"
                              type="password"
                              className={modalStyles.formInput}
                              placeholder="Bot token..."
                              value={accessToken}
                              onChange={(e) =>
                                setAccessToken(e.currentTarget.value)
                              }
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
                                <li>
                                  Create a new application or select existing
                                </li>
                                <li>
                                  Go to &quot;Bot&quot; section and create a bot
                                </li>
                                <li>Copy the bot token</li>
                                <li>
                                  Invite bot to your server with appropriate
                                  permissions
                                </li>
                              </ol>
                            </div>
                          </div>
                        </div>
                        <button
                          className={modalStyles.manualConnectButton}
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
                              Click &quot;Edit Channel&quot; →
                              &quot;Integrations&quot; → &quot;Webhooks&quot;
                            </li>
                            <li>
                              Click &quot;New Webhook&quot; and configure it
                            </li>
                            <li>Copy the webhook URL and paste it below</li>
                          </ol>
                        </div>

                        <div className={modalStyles.formGroup}>
                          <label
                            htmlFor="webhook-url"
                            className={modalStyles.formLabel}
                          >
                            Webhook URL{" "}
                            <span className={modalStyles.required}>*</span>
                          </label>
                          <div className={modalStyles.inputWithIcon}>
                            <span className={modalStyles.inputIcon}>🔗</span>
                            <input
                              id="webhook-url"
                              type="url"
                              className={modalStyles.formInput}
                              placeholder="https://discord.com/api/webhooks/..."
                              value={webhookUrl}
                              onChange={(e) =>
                                setWebhookUrl(e.currentTarget.value)
                              }
                            />
                          </div>
                          <small className={modalStyles.formHelp}>
                            Create a webhook URL in your Discord server settings
                          </small>
                        </div>

                        <button
                          className={channelStyles.webhookConnectButton}
                          onClick={handleManualConnect}
                          disabled={!webhookUrl.trim() || loading}
                        >
                          {loading ? "Connecting..." : "Connect with Webhook"}
                        </button>

                        {webhookUrl.trim() && (
                          <button
                            className={channelStyles.testButton}
                            onClick={() =>
                              handleTestWebhook(webhookUrl, "Discord Server")
                            }
                            disabled={testingWebhook === webhookUrl}
                            style={{ marginTop: "0.5rem" }}
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
                className={modalStyles.disconnectButton}
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : (
              <button
                className={modalStyles.cancelButton}
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

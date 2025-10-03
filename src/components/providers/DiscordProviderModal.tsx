import { useState, useEffect } from "preact/hooks";
import { mutate } from "swr";

import { useDiscordGuilds, useDiscordChannels } from "../../hooks/useChannels";
import { discordApi, messagingApi } from "../../lib/api/client";
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={
          {
            "--provider-color": getProviderColor("discord"),
            "--provider-bg-color": getProviderBgColor("discord"),
            "--provider-accent-color": getProviderAccentColor("discord"),
          } as React.CSSProperties
        }
      >
        <div className="modal-header">
          <h2>Connect Discord</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {isConnected
              ? `Manage your Discord connection and server settings.`
              : `Connect your Discord server to receive pull request notifications in your channels.`}
          </p>

          {isConnected && (
            <div className="form-group">
              <div className="provider-display">
                <span className="connection-status connected">✓ Connected</span>
                {username && <span className="team-name">as {username}</span>}
              </div>
            </div>
          )}

          {isConnected && (
            <div className="form-group">
              <label>Available Servers</label>
              <div className="guilds-section">
                {guildsLoading && (
                  <div className="guilds-loading">
                    <span>Loading servers...</span>
                  </div>
                )}

                {guildsError && (
                  <div className="guilds-error">
                    <span>Error loading servers: {guildsError}</span>
                    <button
                      className="retry-button"
                      onClick={refetchGuilds}
                      disabled={guildsLoading}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!guildsLoading && !guildsError && guilds.length > 0 && (
                  <div className="guilds-list">
                    <div className="guilds-count">
                      {guilds.length} server{guilds.length !== 1 ? "s" : ""}{" "}
                      available
                    </div>
                    <div className="guilds-container scrollable">
                      {guilds.map((guild) => (
                        <div key={guild.id} className="guild-item">
                          <div className="guild-info">
                            <span className="guild-name">{guild.name}</span>
                            <div className="guild-meta">
                              <button
                                className="select-guild-button"
                                onClick={() => setSelectedGuild(guild.id)}
                                disabled={selectedGuild === guild.id}
                              >
                                {selectedGuild === guild.id
                                  ? "Selected"
                                  : "Select"}
                              </button>
                            </div>
                          </div>

                          {selectedGuild === guild.id && (
                            <div className="channels-section">
                              {channelsLoading && (
                                <div className="channels-loading">
                                  <span>Loading channels...</span>
                                </div>
                              )}

                              {!channelsLoading && channels.length > 0 && (
                                <div className="channels-list">
                                  <div className="channels-count">
                                    {channels.length} text channel
                                    {channels.length !== 1 ? "s" : ""}
                                  </div>
                                  <div className="channels-container">
                                    {channels.map((channel) => (
                                      <div
                                        key={channel.id}
                                        className="channel-item"
                                      >
                                        <div className="channel-info">
                                          <span className="channel-icon">
                                            #
                                          </span>
                                          <span className="channel-name">
                                            {channel.name}
                                          </span>
                                          <div className="channel-meta">
                                            <button
                                              className="test-channel-button"
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
                                        </div>
                                        {testResults[channel.id] && (
                                          <div
                                            className={`test-result ${
                                              testResults[channel.id].success
                                                ? "success"
                                                : "error"
                                            }`}
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
                                <div className="channels-empty">
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
                  <div className="guilds-empty">
                    <span>No servers found with webhook permissions</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="form-group">
              {/* Primary OAuth connection - always visible */}
              <div className="primary-connection-section">
                <button
                  className="oauth-connect-button primary provider-branded"
                  onClick={handleOAuthConnect}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="oauth-button-content">
                      Redirecting to{" "}
                      <img
                        src="/images/providers/discord/Discord-Logo-White.svg"
                        alt="Discord"
                        className="oauth-button-content-discord"
                      />
                    </span>
                  ) : (
                    <span className="oauth-button-content">
                      Sign in with{" "}
                      <img
                        src="/images/providers/discord/Discord-Logo-White.svg"
                        alt="Discord"
                        className="oauth-button-content-discord"
                      />
                    </span>
                  )}
                </button>
                <small className="form-help oauth-help">
                  {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
                  Discord to grant server access permissions.`}
                </small>
              </div>

              {/* Alternative connection options - hidden by default */}
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
                    Use bot token or webhook instead
                  </button>
                ) : (
                  <div className="manual-connection-wrapper">
                    <div className="alternative-header">
                      <span>Alternative Connection Methods</span>
                      <button
                        className="hide-alternative-button"
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

                    <div className="connection-method-tabs">
                      <button
                        className={`method-tab ${
                          connectionMethod === "manual" ? "active" : ""
                        }`}
                        onClick={() => {
                          setConnectionMethod("manual");
                          setError(null);
                        }}
                      >
                        Bot Token
                      </button>
                      <button
                        className={`method-tab ${
                          connectionMethod === "webhook" ? "active" : ""
                        }`}
                        onClick={() => {
                          setConnectionMethod("webhook");
                          setError(null);
                        }}
                      >
                        Webhook URL
                      </button>
                    </div>

                    {connectionMethod === "manual" && (
                      <div className="manual-connect-section">
                        <div className="token-input-group">
                          <label htmlFor="bot-token">
                            Bot Token <span className="required">*</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon">🤖</span>
                            <input
                              id="bot-token"
                              type="password"
                              className="form-input"
                              placeholder="Bot token..."
                              value={accessToken}
                              onChange={(e) =>
                                setAccessToken(e.currentTarget.value)
                              }
                            />
                          </div>
                          <div className="token-help">
                            <div className="token-option">
                              <strong>How to get a bot token:</strong>
                              <ol>
                                <li>
                                  Go to{" "}
                                  <a
                                    href="https://discord.com/developers/applications"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="help-link"
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
                          className="manual-connect-button"
                          onClick={handleManualConnect}
                          disabled={!accessToken.trim() || loading}
                        >
                          {loading ? "Connecting..." : "Connect with Token"}
                        </button>
                      </div>
                    )}

                    {connectionMethod === "webhook" && (
                      <div className="webhook-connect-section">
                        <div className="discord-setup-info">
                          <h3>How to set up Discord webhook:</h3>
                          <ol>
                            <li>Go to your Discord server channel</li>
                            <li>{`Click "Edit Channel" → "Integrations" → "Webhooks"`}</li>
                            <li>{`Click "New Webhook" and configure it`}</li>
                            <li>Copy the webhook URL and paste it below</li>
                          </ol>
                        </div>

                        <label htmlFor="webhook-url">
                          Webhook URL <span className="required">*</span>
                        </label>
                        <div className="input-with-icon">
                          <span className="input-icon">🔗</span>
                          <input
                            id="webhook-url"
                            type="url"
                            className="form-input"
                            placeholder="https://discord.com/api/webhooks/..."
                            value={webhookUrl}
                            onChange={(e) =>
                              setWebhookUrl(e.currentTarget.value)
                            }
                          />
                        </div>
                        <small className="form-help">
                          Create a webhook URL in your Discord server settings
                        </small>

                        <button
                          className="webhook-connect-button"
                          onClick={handleManualConnect}
                          disabled={!webhookUrl.trim() || loading}
                        >
                          {loading ? "Connecting..." : "Connect with Webhook"}
                        </button>

                        {webhookUrl.trim() && (
                          <button
                            className="test-channel-button"
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
                            className={`test-result ${
                              testResults[webhookUrl].success
                                ? "success"
                                : "error"
                            }`}
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

        <div className="modal-footer">
          {error && (
            <div className="modal-footer-error">
              <div className="error-message prominent-error">{error}</div>
            </div>
          )}
          <div className="modal-footer-buttons">
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
    </div>
  );
}

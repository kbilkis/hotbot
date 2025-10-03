import { useEffect, useState } from "preact/hooks";
import { mutate } from "swr";

import type { SlackChannel } from "@/types/slack";

import { slackApi, messagingApi } from "../../lib/api/client";
import {
  getProviderColor,
  getProviderBgColor,
  getProviderAccentColor,
} from "../../utils/providerColors";

interface SlackProviderModalProps {
  onClose: () => void;
  isConnected?: boolean;
  teamName?: string;
}

export default function SlackProviderModal({
  onClose,
  isConnected: initialIsConnected = false,
  teamName: initialTeamName = "",
}: SlackProviderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [showManualOption, setShowManualOption] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [teamName, setTeamName] = useState(initialTeamName);

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
      // Fetch channels and user info if connected
      const [channelsResponse, userResponse] = await Promise.all([
        slackApi.channels.$get(),
        slackApi.user.$get(),
      ]);

      const [channelsData, userData] = await Promise.all([
        channelsResponse.json(),
        userResponse.json(),
      ]);

      if (channelsData.success) {
        setChannels(channelsData.data?.channels || []);
      }

      if (userData.success && !teamName) {
        setTeamName(userData.data?.teamName || "Slack Workspace");
      }
    } catch (err) {
      console.warn("Failed to fetch additional Slack info:", err);
    }
  };

  // Fetch channels when connected
  useEffect(() => {
    if (isConnected) {
      fetchChannels();
    }
  }, [isConnected]);

  const fetchChannels = async () => {
    try {
      setChannelsLoading(true);
      setChannelsError(null);

      const response = await slackApi.channels.$get();
      const data = await response.json();

      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      setChannels(data.data?.channels || []);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      setChannelsError(
        err instanceof Error ? err.message : "Failed to fetch channels"
      );
    } finally {
      setChannelsLoading(false);
    }
  };

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current URL for redirect
      const redirectUri = `${window.location.origin}/auth/callback/slack`;

      // Get OAuth authorization URL
      const response = await slackApi["auth-url"].$post({
        json: {
          redirectUri,
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
      window.location.href = data.authUrl;
    } catch (err) {
      console.error("Failed to initiate Slack OAuth:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to Slack"
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

      // Invalidate SWR cache to refresh provider data
      await mutate("/api/providers/messaging");

      // Update local connection state
      setIsConnected(true);
      setTeamName(data.userInfo?.teamName || "Slack Workspace");

      // Fetch channels to display available options
      if (data.channels) {
        setChannels(data.channels);
      } else {
        fetchChannels();
      }

      // Clear the token input for security
      setAccessToken("");
    } catch (err) {
      console.error("Failed to connect Slack:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to Slack"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestChannel = async (channelId: string, channelName: string) => {
    try {
      setTestingChannel(channelId);
      setError(null);

      const response = await slackApi["test-channel"].$post({
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

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the disconnect API endpoint
      const response = await messagingApi.$delete({
        query: { type: "slack" },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      console.log("Successfully disconnected Slack:", data);

      // Invalidate SWR cache to refresh provider data
      await mutate("/api/providers/messaging");

      // Update local connection state
      setIsConnected(false);
      setChannels([]);
      setTeamName("");

      onClose();
    } catch (err) {
      console.error("Failed to disconnect Slack:", err);
      setError(
        err instanceof Error ? err.message : "Failed to disconnect Slack"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content slack-modal"
        onClick={(e) => e.stopPropagation()}
        style={
          {
            "--provider-color": getProviderColor("slack"),
            "--provider-bg-color": getProviderBgColor("slack"),
            "--provider-accent-color": getProviderAccentColor("slack"),
          } as React.CSSProperties
        }
      >
        <div className="modal-header">
          <h2>Connect Slack</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {isConnected
              ? `Manage your Slack connection and channel settings.`
              : `Connect your Slack workspace to receive pull request notifications in your team channels.`}
          </p>

          {isConnected && (
            <div className="form-group">
              <div className="provider-display">
                <>
                  <span className="connection-status connected">
                    ✓ Connected
                  </span>
                  {teamName && <span className="team-name">to {teamName}</span>}
                </>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="form-group">
              <label>Available Channels</label>
              <div className="channels-section">
                {channelsLoading && (
                  <div className="channels-loading">
                    <span>Loading channels...</span>
                  </div>
                )}

                {channelsError && (
                  <div className="channels-error">
                    <span>Error loading channels: {channelsError}</span>
                    <button
                      className="retry-button"
                      onClick={fetchChannels}
                      disabled={channelsLoading}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!channelsLoading && !channelsError && channels.length > 0 && (
                  <div className="channels-list">
                    <div className="channels-count">
                      {channels.length} channels available
                    </div>
                    <div className="channels-container scrollable">
                      {channels.map((channel) => (
                        <div key={channel.id} className="channel-item">
                          <div className="channel-info">
                            <span className="channel-icon">
                              {channel.type === "private" ? "🔒" : "#"}
                            </span>
                            <span className="channel-name">{channel.name}</span>
                            <div className="channel-meta">
                              {channel.memberCount && (
                                <span className="channel-members">
                                  {channel.memberCount} members
                                </span>
                              )}
                              <button
                                className="test-channel-button"
                                onClick={() =>
                                  handleTestChannel(channel.id, channel.name)
                                }
                                disabled={testingChannel === channel.id}
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

                {!channelsLoading &&
                  !channelsError &&
                  channels.length === 0 && (
                    <div className="channels-empty">
                      <span>No channels found</span>
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
                        src="images/providers/slack/SLA-Slack-from-Salesforce-logo-inverse.png"
                        alt="Slack"
                        className="oauth-button-content-slack"
                      />
                    </span>
                  ) : (
                    <span className="oauth-button-content">
                      Sign in with{" "}
                      <img
                        src="images/providers/slack/SLA-Slack-from-Salesforce-logo-inverse.png"
                        alt="Slack"
                        className="oauth-button-content-slack"
                      />
                    </span>
                  )}
                </button>
                <small className="form-help oauth-help">
                  {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
                  Slack to grant channel access permissions.`}
                </small>
              </div>

              {/* Alternative connection option - hidden by default */}
              <div className="alternative-connection-section">
                {!showManualOption ? (
                  <button
                    className="show-alternative-button"
                    onClick={() => {
                      setShowManualOption(true);
                    }}
                    disabled={loading}
                  >
                    Use bot token instead
                  </button>
                ) : (
                  <div className="manual-connection-wrapper">
                    <div className="alternative-header">
                      <span>Alternative: Bot Token</span>
                      <button
                        className="hide-alternative-button"
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
                            placeholder="xoxb-..."
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
                                  href="https://api.slack.com/apps"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="help-link"
                                >
                                  api.slack.com/apps
                                </a>
                              </li>
                              <li>
                                Create a new app or select an existing one
                              </li>
                              <li>
                                {`Go to "OAuth & Permissions" and add these
                                scopes:`}
                                <ul>
                                  <li>
                                    <code>channels:read</code> - View public
                                    channels
                                  </li>
                                  <li>
                                    <code>chat:write</code> - Send messages
                                  </li>
                                  <li>
                                    <code>chat:write.public</code> - Send to
                                    public channels
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
                        className="manual-connect-button"
                        onClick={handleManualConnect}
                        disabled={!accessToken.trim() || loading}
                      >
                        {loading ? "Connecting..." : "Connect with Token"}
                      </button>
                    </div>
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

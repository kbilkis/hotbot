import React, { useState, useEffect } from "react";
import { mutate } from "swr";

interface SlackProviderModalProps {
  onClose: () => void;
  isConnected?: boolean;
  teamName?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  memberCount?: number;
}

export default function SlackProviderModal({
  onClose,
  isConnected: initialIsConnected = false,
  teamName: initialTeamName = "",
}: SlackProviderModalProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"oauth" | "manual">(
    "oauth"
  );
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
        fetch("/api/providers/messaging/slack/channels"),
        fetch("/api/providers/messaging/slack/user"),
      ]);

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json();
        setChannels(channelsData.data?.channels || []);
      }

      if (userResponse.ok && !teamName) {
        const userData = await userResponse.json();
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

      const response = await fetch("/api/providers/messaging/slack/channels");

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
      const response = await fetch("/api/providers/messaging/slack/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUri,
          scopes: ["channels:read", "chat:write", "chat:write.public"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("SLACK_AUTH_URL RESP BAD", errorText);
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
      console.log("SLACK_AUTH_URL RESP GOOD", data);
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
      const response = await fetch(
        "/api/providers/messaging/slack/connect-manual",
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

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the disconnect API endpoint (we need to implement this)
      const response = await fetch(
        "/api/providers/messaging/disconnect?type=slack",
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

          <div className="form-group">
            <div className="provider-display">
              {isConnected && (
                <>
                  <span className="connection-status connected">
                    ✓ Connected
                  </span>
                  {teamName && <span className="team-name">to {teamName}</span>}
                </>
              )}
            </div>
          </div>

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
                    <div className="channels-container">
                      {(showAllChannels ? channels : channels.slice(0, 10)).map(
                        (channel) => (
                          <div key={channel.id} className="channel-item">
                            <span className="channel-icon">
                              {channel.type === "private" ? "🔒" : "#"}
                            </span>
                            <span className="channel-name">{channel.name}</span>
                            {channel.memberCount && (
                              <span className="channel-members">
                                {channel.memberCount} members
                              </span>
                            )}
                          </div>
                        )
                      )}
                      {channels.length > 10 && !showAllChannels && (
                        <button
                          className="show-more-button"
                          onClick={() => setShowAllChannels(true)}
                        >
                          ⋯ Show {channels.length - 10} more channels
                        </button>
                      )}
                      {showAllChannels && channels.length > 10 && (
                        <button
                          className="show-less-button"
                          onClick={() => setShowAllChannels(false)}
                        >
                          Show less
                        </button>
                      )}
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
                {error && connectionMethod === "oauth" && (
                  <div className="error-message prominent-error">{error}</div>
                )}
                <button
                  className="oauth-connect-button primary slack-button"
                  onClick={handleOAuthConnect}
                  disabled={loading}
                >
                  {loading ? "Redirecting to Slack..." : "Sign in with Slack"}
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
                      setConnectionMethod("manual");
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
                            onChange={(e) => setAccessToken(e.target.value)}
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

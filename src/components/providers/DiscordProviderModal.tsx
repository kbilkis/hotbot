import React, { useState, useEffect } from "react";

interface DiscordProviderModalProps {
  onClose: () => void;
  isConnected?: boolean;
  connectedAt?: string;
}

export default function DiscordProviderModal({
  onClose,
  isConnected = false,
}: DiscordProviderModalProps): React.ReactElement {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const handleConnect = async () => {
    if (!webhookUrl.trim()) {
      setError("Webhook URL is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement Discord webhook connection
      console.log("Connecting Discord webhook:", { webhookUrl, channelId });

      // For now, just close the modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implement Discord disconnect
      console.log("Disconnecting Discord");

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connect Discord</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {isConnected
              ? "Manage your Discord webhook connection."
              : "Connect Discord to receive pull request notifications in your server channels."}
          </p>

          {isConnected && (
            <div className="form-group">
              <div className="provider-display">
                <span className="connection-status connected">✓ Connected</span>
                <span className="team-name">to Discord</span>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="form-group">
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
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <small className="form-help">
                Create a webhook URL in your Discord server settings
              </small>

              <label htmlFor="channel-id">
                Channel ID <span className="optional">(Optional)</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">#</span>
                <input
                  id="channel-id"
                  type="text"
                  className="form-input"
                  placeholder="123456789012345678"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
              </div>
              <small className="form-help">
                {`Optional: Specify a channel ID to override the webhook's default
                channel`}
              </small>

              {error && <div className="error-message">{error}</div>}
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
            <>
              <button
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="connect-button-modal"
                onClick={handleConnect}
                disabled={!webhookUrl.trim() || loading}
              >
                {loading ? "Connecting..." : "Connect Discord"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

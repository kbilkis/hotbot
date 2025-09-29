import { useState, useEffect } from "preact/hooks";

import {
  getProviderColor,
  getProviderBgColor,
  getProviderAccentColor,
} from "../../utils/providerColors";

interface TeamsProviderModalProps {
  onClose: () => void;
  isConnected?: boolean;
  connectedAt?: string;
}

export default function TeamsProviderModal({
  onClose,
  isConnected = false,
}: TeamsProviderModalProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
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

      // TODO: Implement Teams webhook connection
      console.log("Connecting Teams webhook:", webhookUrl);

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

      // TODO: Implement Teams disconnect
      console.log("Disconnecting Teams");

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          "--provider-color": getProviderColor("teams"),
          "--provider-bg-color": getProviderBgColor("teams"),
          "--provider-accent-color": getProviderAccentColor("teams"),
        }}
      >
        <div className="modal-header">
          <h2>Connect Microsoft Teams</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {isConnected
              ? "Manage your Microsoft Teams webhook connection."
              : "Connect Microsoft Teams to receive pull request notifications in your team channels."}
          </p>

          {isConnected && (
            <div className="form-group">
              <div className="provider-display">
                <span className="connection-status connected">✓ Connected</span>
                <span className="team-name">to Microsoft Teams</span>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="form-group">
              <div className="teams-setup-info">
                <h3>How to set up Teams webhook:</h3>
                <ol>
                  <li>Go to your Teams channel</li>
                  <li>{`Click "..." → "Connectors" → "Incoming Webhook"`}</li>
                  <li>Configure the webhook and copy the URL</li>
                  <li>Paste the URL below</li>
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
                  placeholder="https://outlook.office.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <small className="form-help">
                Create a webhook URL in your Microsoft Teams channel settings
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
                className="connect-button-modal provider-branded"
                onClick={handleConnect}
                disabled={!webhookUrl.trim() || loading}
              >
                {loading ? "Connecting..." : "Connect Teams"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "preact/hooks";

import * as channelStyles from "@/styles/providers/channels.css";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

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
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div
        className={modalStyles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>Connect Microsoft Teams</h2>
          <button className={modalStyles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={modalStyles.modalBody}>
          <p className={modalStyles.modalDescription}>
            {isConnected
              ? "Manage your Microsoft Teams webhook connection."
              : "Connect Microsoft Teams to receive pull request notifications in your team channels."}
          </p>

          {isConnected && (
            <div className={modalStyles.formGroup}>
              <div className={modalStyles.providerDisplay}>
                <span className={modalStyles.connectionStatusConnected}>
                  ✓ Connected
                </span>
                <span className={modalStyles.teamName}>to Microsoft Teams</span>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className={modalStyles.formGroup}>
              <div className={channelStyles.discordSetupInfo}>
                <h3>How to set up Teams webhook:</h3>
                <ol>
                  <li>Go to your Teams channel</li>
                  <li>
                    Click &quot;...&quot; → &quot;Connectors&quot; →
                    &quot;Incoming Webhook&quot;
                  </li>
                  <li>Configure the webhook and copy the URL</li>
                  <li>Paste the URL below</li>
                </ol>
              </div>

              <label htmlFor="webhook-url" className={modalStyles.formLabel}>
                Webhook URL <span className={modalStyles.required}>*</span>
              </label>
              <div className={modalStyles.inputWithIcon}>
                <span className={modalStyles.inputIcon}>🔗</span>
                <input
                  id="webhook-url"
                  type="url"
                  className={modalStyles.formInput}
                  placeholder="https://outlook.office.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.currentTarget.value)}
                />
              </div>
              <small className={modalStyles.formHelp}>
                Create a webhook URL in your Microsoft Teams channel settings
              </small>

              {error && <div className={modalStyles.errorMessage}>{error}</div>}
            </div>
          )}
        </div>

        <div className={modalStyles.modalFooter}>
          {isConnected ? (
            <button
              className={button({ color: "danger" })}
              onClick={handleDisconnect}
              disabled={loading}
            >
              {loading ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <div className={modalStyles.modalFooterButtons}>
              <button
                className={button({ color: "outline" })}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={button({ color: "teams" })}
                onClick={handleConnect}
                disabled={!webhookUrl.trim() || loading}
              >
                {loading ? "Connecting..." : "Connect Teams"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

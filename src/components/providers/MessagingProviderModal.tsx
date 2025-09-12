import React, { useState, useEffect } from "react";
import { Provider } from "../../types/dashboard";

interface MessagingProviderModalProps {
  provider: Provider;
  onClose: () => void;
}

export default function MessagingProviderModal({
  provider,
  onClose,
}: MessagingProviderModalProps): React.ReactElement {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelId, setChannelId] = useState("");
  const [botToken, setBotToken] = useState("");

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const messagingProviders = [
    {
      id: "slack",
      name: "Slack",
      fields: ["webhookUrl", "channelId"],
      webhookPlaceholder: "https://hooks.slack.com/services/...",
      channelPlaceholder: "#general or C1234567890",
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      fields: ["webhookUrl"],
      webhookPlaceholder: "https://outlook.office.com/webhook/...",
      channelPlaceholder: "",
    },
    {
      id: "discord",
      name: "Discord",
      fields: ["webhookUrl", "channelId"],
      webhookPlaceholder: "https://discord.com/api/webhooks/...",
      channelPlaceholder: "Channel ID (e.g., 123456789012345678)",
    },
  ];

  const selectedProviderData = messagingProviders.find(
    (p) => p.id === selectedProvider
  );

  const handleConnect = () => {
    console.log("Connecting messaging provider:", {
      provider: selectedProvider,
      webhookUrl,
      channelId,
      botToken,
    });
    onClose();
  };

  const showWebhookField = selectedProviderData?.fields.includes("webhookUrl");
  const showChannelField = selectedProviderData?.fields.includes("channelId");
  const showBotTokenField = selectedProvider === "slack";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connect Messaging Provider</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Connect your messaging provider to receive notifications in your
            team channels.
          </p>

          <div className="form-group">
            <label htmlFor="messaging-provider-select">
              Messaging Provider
            </label>
            <select
              id="messaging-provider-select"
              className="form-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="">Select a Messaging Provider</option>
              {messagingProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {showWebhookField && (
            <div className="form-group">
              <label htmlFor="webhook-url">
                Webhook URL <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🔗</span>
                <input
                  id="webhook-url"
                  type="url"
                  className="form-input"
                  placeholder={selectedProviderData?.webhookPlaceholder}
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <small className="form-help">
                Create a webhook URL in your {selectedProviderData?.name}{" "}
                workspace settings
              </small>
            </div>
          )}

          {showChannelField && (
            <div className="form-group">
              <label htmlFor="channel-id">
                Channel {selectedProvider === "slack" ? "Name or ID" : "ID"}{" "}
                <span className="optional">(Optional)</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">#</span>
                <input
                  id="channel-id"
                  type="text"
                  className="form-input"
                  placeholder={selectedProviderData?.channelPlaceholder}
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
              </div>
              <small className="form-help">
                Specify a channel to send notifications to (defaults to
                webhook's configured channel)
              </small>
            </div>
          )}

          {showBotTokenField && (
            <div className="form-group">
              <label htmlFor="bot-token">
                Bot Token <span className="optional">(Optional)</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🤖</span>
                <input
                  id="bot-token"
                  type="password"
                  className="form-input"
                  placeholder="xoxb-..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                />
              </div>
              <small className="form-help">
                Required for advanced features like thread replies and user
                mentions
              </small>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="connect-button-modal"
            onClick={handleConnect}
            disabled={!selectedProvider || (showWebhookField && !webhookUrl)}
          >
            Connect Messaging Provider
          </button>
        </div>
      </div>
    </div>
  );
}

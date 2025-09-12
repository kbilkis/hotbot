import React, { useState, useEffect } from "react";

interface Provider {
  id: string;
  name: string;
  type: "git" | "messaging";
  connected: boolean;
  icon: string;
}

interface ProviderConnectionModalProps {
  provider: Provider;
  onClose: () => void;
}

export default function ProviderConnectionModal({
  provider,
  onClose,
}: ProviderConnectionModalProps): React.ReactElement {
  const [selectedProviderType, setSelectedProviderType] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const gitProviders = [
    { id: "github", name: "GitHub" },
    { id: "gitlab", name: "GitLab" },
    { id: "bitbucket", name: "Bitbucket" },
  ];

  const messagingProviders = [
    { id: "slack", name: "Slack" },
    { id: "teams", name: "Microsoft Teams" },
    { id: "discord", name: "Discord" },
  ];

  const availableProviders =
    provider.type === "git" ? gitProviders : messagingProviders;

  const handleConnect = () => {
    // Handle connection logic here
    console.log(
      "Connecting to:",
      selectedProviderType,
      "with API key:",
      apiKey
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connect a Provider</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Choose a {provider.type === "git" ? "Git" : "messaging"} provider to
            integrate with HotBot.
          </p>

          <div className="form-group">
            <label htmlFor="provider-select">Provider</label>
            <select
              id="provider-select"
              className="form-select"
              value={selectedProviderType}
              onChange={(e) => setSelectedProviderType(e.target.value)}
            >
              <option value="">
                Select a {provider.type === "git" ? "Git" : "Messaging"}{" "}
                Provider
              </option>
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="api-key">
              API Key <span className="optional">(Optional)</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">🔑</span>
              <input
                id="api-key"
                type="password"
                className="form-input"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="connect-button-modal"
            onClick={handleConnect}
            disabled={!selectedProviderType}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

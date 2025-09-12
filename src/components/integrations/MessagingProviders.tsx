import React, { useState } from "react";
import { Provider } from "../../types/dashboard";
import MessagingProviderModal from "../providers/MessagingProviderModal";

interface MessagingProvidersProps {}

export default function MessagingProviders({}: MessagingProvidersProps): React.ReactElement {
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  const handleConnectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProvider(null);
  };
  const messagingProviders: Provider[] = [
    {
      id: "slack",
      name: "Slack",
      type: "messaging",
      connected: false,
      icon: "💬",
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      type: "messaging",
      connected: false,
      icon: "👥",
    },
    {
      id: "discord",
      name: "Discord",
      type: "messaging",
      connected: false,
      icon: "🎮",
    },
  ];

  return (
    <div className="provider-section">
      <h2>Messaging Providers</h2>
      <p>Connect your messaging provider to receive notifications.</p>
      <div className="provider-list">
        {messagingProviders.map((provider) => (
          <div key={provider.id} className="provider-card">
            <div className="provider-info">
              <span className="provider-icon">{provider.icon}</span>
              <span className="provider-name">{provider.name}</span>
            </div>
            <button
              className="connect-button"
              onClick={() => handleConnectProvider(provider)}
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      {showModal && selectedProvider && (
        <MessagingProviderModal
          provider={selectedProvider}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

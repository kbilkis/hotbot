import React, { useState } from "react";

import { useMessagingProviders } from "@/hooks/useMessagingProviders";

import { Provider } from "../../types/dashboard";
import DiscordProviderModal from "../providers/DiscordProviderModal";
import SlackProviderModal from "../providers/SlackProviderModal";
import TeamsProviderModal from "../providers/TeamsProviderModal";

export default function MessagingProviders(): React.ReactElement {
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  // Fetch messaging providers data
  const { providers, loading, error } = useMessagingProviders();

  const handleConnectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProvider(null);
  };

  // Default provider structure
  const defaultProviders = [
    {
      id: "slack",
      name: "Slack",
      type: "slack" as const,
      connected: false,
      icon: "💬",
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      type: "teams" as const,
      connected: false,
      icon: "👥",
    },
    {
      id: "discord",
      name: "Discord",
      type: "discord" as const,
      connected: false,
      icon: "🎮",
    },
  ];

  // Merge API data with default structure
  const messagingProviders: Provider[] = defaultProviders.map(
    (defaultProvider) => {
      const apiProvider = providers.find((p) => p.type === defaultProvider.id);
      return {
        ...defaultProvider,
        id: apiProvider?.id || defaultProvider.id,
        connected: apiProvider?.connected || false,
        connectedAt: apiProvider?.connectedAt,
      };
    }
  );

  if (loading) {
    return (
      <div className="provider-section">
        <h2>Messaging Providers</h2>
        <p>Loading messaging providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-section">
        <h2>Messaging Providers</h2>
        <p>Error loading messaging providers. Please try again.</p>
      </div>
    );
  }

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
              {provider.connected && (
                <span className="connection-status connected">✓</span>
              )}
            </div>
            <button
              className={`connect-button ${
                provider.connected ? "connected" : ""
              }`}
              onClick={() => handleConnectProvider(provider)}
            >
              {provider.connected ? "Manage" : "Connect"}
            </button>
          </div>
        ))}
      </div>

      {showModal && selectedProvider && (
        <>
          {selectedProvider.type === "slack" && (
            <SlackProviderModal
              onClose={handleCloseModal}
              isConnected={selectedProvider.connected}
            />
          )}
          {selectedProvider.type === "teams" && (
            <TeamsProviderModal
              onClose={handleCloseModal}
              isConnected={selectedProvider.connected}
            />
          )}
          {selectedProvider.type === "discord" && (
            <DiscordProviderModal
              onClose={handleCloseModal}
              isConnected={selectedProvider.connected}
            />
          )}
        </>
      )}
    </div>
  );
}

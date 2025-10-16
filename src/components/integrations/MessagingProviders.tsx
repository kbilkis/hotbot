import { useState } from "preact/hooks";

import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import * as styles from "@/styles/dashboard/providers.css";
import { button } from "@/styles/theme/index.css";
import { Provider } from "@/types/dashboard";
import { getProviderColor, getProviderBgColor } from "@/utils/providerColors";

import DiscordProviderModal from "../providers/DiscordProviderModal";
import SlackProviderModal from "../providers/SlackProviderModal";
import TeamsProviderModal from "../providers/TeamsProviderModal";

export default function MessagingProviders() {
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
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      type: "teams" as const,
      connected: false,
    },
    {
      id: "discord",
      name: "Discord",
      type: "discord" as const,
      connected: false,
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
      <div className={styles.providerSection}>
        <h2 className={styles.providerSectionTitle}>Messaging Providers</h2>
        <p className={styles.providerSectionDescription}>
          Loading messaging providers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.providerSection}>
        <h2 className={styles.providerSectionTitle}>Messaging Providers</h2>
        <p className={styles.providerSectionDescription}>
          Error loading messaging providers. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.providerSection}>
      <h2 className={styles.providerSectionTitle}>Messaging Providers</h2>
      <p className={styles.providerSectionDescription}>
        Connect your messaging provider to receive notifications.
      </p>
      <div className={styles.providerList}>
        {messagingProviders.map((provider) => (
          <div
            key={provider.id}
            className={styles.providerCard}
            style={{
              backgroundColor: getProviderBgColor(provider.type),
              borderColor: getProviderColor(provider.type) + "20",
            }}
          >
            <div className={styles.providerInfo}>
              <div className={styles.providerIcon}>
                {provider.type === "slack" && (
                  <img
                    src="/images/providers/slack/SLA-appIcon-iOS.png"
                    alt="Slack"
                    className={styles.providerLogo}
                  />
                )}
                {provider.type === "discord" && (
                  <img
                    src="/images/providers/discord/Discord-Symbol-Blurple.svg"
                    alt="Discord"
                    className={styles.providerLogo}
                  />
                )}
                {provider.type === "teams" && (
                  <img
                    src="/images/providers/teams/icons8-microsoft-teams.svg"
                    alt="Teams"
                    className={styles.providerLogo}
                  />
                )}
              </div>
              <span className={styles.providerName}>{provider.name}</span>
              {provider.connected && (
                <span
                  className={styles.connectionStatusConnected}
                  style={{ color: getProviderColor(provider.type) }}
                >
                  ✓ Connected
                </span>
              )}
            </div>
            <button
              className={
                provider.connected
                  ? button({ color: "secondary", size: "sm" })
                  : button({ color: "success", size: "sm" })
              }
              onClick={() => handleConnectProvider(provider)}
              disabled={provider.type === "teams"}
            >
              {provider.type === "teams"
                ? "Coming Soon"
                : provider.connected
                ? "Manage"
                : "Connect"}
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

import { useState, useEffect } from "preact/hooks";

import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { discordApi, messagingApi } from "@/lib/api/client";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";
import { Provider } from "@/types/dashboard";

import Modal from "../ui/Modal";

import DiscordChannelSection from "./discord/DiscordChannelSection";
import DiscordConnectionMethods from "./discord/DiscordConnectionMethods";

interface DiscordProviderModalProps {
  onClose: () => void;
  provider: Provider;
}

export default function DiscordProviderModal({
  onClose,
  provider,
}: Readonly<DiscordProviderModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const { refetch } = useMessagingProviders();
  const isConnected = provider.connected;

  // Fetch additional data when connected
  useEffect(() => {
    if (isConnected) {
      fetchAdditionalData();
    }
  }, [isConnected]);

  const fetchAdditionalData = async () => {
    try {
      const userResponse = await discordApi.user.$get();
      const userData = await userResponse.json();
      if (userData.success && !username) {
        setUsername(userData.data.username || "Discord User");
      } else {
        throw new Error(userData.message);
      }
    } catch (err) {
      console.error("Failed to fetch additional Discord info:", err);
    }
  };

  const handleConnectionSuccess = (newUsername: string) => {
    refetch();
    setError(null);
    setUsername(newUsername);
  };

  const handleConnectionError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the disconnect API endpoint
      const response = await messagingApi.$delete({
        query: { type: "discord" },
      });
      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log("Successfully disconnected Discord:", data);
      refetch();
      setUsername("");
      onClose();
    } catch (err) {
      console.error("Failed to disconnect Discord:", err);
      setError(
        err instanceof Error ? err.message : "Failed to disconnect Discord"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Connect Discord"
      onClose={onClose}
      error={error}
      footerActions={
        isConnected ? (
          <button
            className={button({ color: "danger" })}
            onClick={handleDisconnect}
            disabled={loading}
          >
            {loading ? "Disconnecting..." : "Disconnect"}
          </button>
        ) : (
          <button
            className={button({ color: "outline" })}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        )
      }
    >
      <p className={modalStyles.modalDescription}>
        {isConnected
          ? `Manage your Discord connection and server settings.`
          : `Connect your Discord server to receive pull request notifications in your channels.`}
      </p>

      <DiscordChannelSection isConnected={isConnected} username={username} />

      {!isConnected && (
        <DiscordConnectionMethods
          onConnectionSuccess={handleConnectionSuccess}
          onError={handleConnectionError}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

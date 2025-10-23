import * as Sentry from "@sentry/react";
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
  const [fetchingUserData, setFetchingUserData] = useState(false);
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
      setFetchingUserData(true);
      setError(null);

      const userResponse = await discordApi.user.$get();
      const userData = await userResponse.json();

      if (userData.success) {
        setUsername(userData.data.username || "Discord User");
      } else {
        throw userData.message || "Failed to fetch Discord user data";
      }
    } catch (err) {
      Sentry.captureException(err);
    } finally {
      setFetchingUserData(false);
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
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while disconnecting Discord";
      setError(`Disconnect failed: ${errorMessage}`);
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

      {isConnected ? (
        <>
          {fetchingUserData && (
            <div className={modalStyles.loadingState}>
              <span>Loading Discord user information...</span>
            </div>
          )}

          {error && !fetchingUserData && (
            <div className={modalStyles.errorState}>
              <span>{error}</span>
              <button
                className={button({ color: "info", size: "xs" })}
                onClick={fetchAdditionalData}
                disabled={fetchingUserData}
              >
                Retry
              </button>
            </div>
          )}

          {!fetchingUserData && !error && (
            <DiscordChannelSection username={username} />
          )}
        </>
      ) : (
        <DiscordConnectionMethods
          onConnectionSuccess={handleConnectionSuccess}
          onError={handleConnectionError}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

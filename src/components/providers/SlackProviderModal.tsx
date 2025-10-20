import { useState, useEffect } from "preact/hooks";

import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { messagingApi, slackApi } from "@/lib/api/client";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";
import { Provider } from "@/types/dashboard";

import Modal from "../ui/Modal";

import SlackChannelSection from "./slack/SlackChannelSection";
import SlackConnectionMethods from "./slack/SlackConnectionMethods";

interface SlackProviderModalProps {
  onClose: () => void;
  provider: Provider;
}

export default function SlackProviderModal({
  onClose,
  provider,
}: Readonly<SlackProviderModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
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
      // Fetch user info if connected and no team name
      if (!teamName) {
        const userResponse = await slackApi.user.$get();
        const userData = await userResponse.json();

        if (userData.success) {
          setTeamName(userData.data?.teamName || "Slack Workspace");
        }
      }
    } catch (err) {
      console.warn("Failed to fetch additional Slack info:", err);
    }
  };

  const handleConnectionSuccess = () => {
    refetch();
    setError(null);
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
        query: { type: "slack" },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      console.log("Successfully disconnected Slack:", data);

      refetch();
      setTeamName("");
      onClose();
    } catch (err) {
      console.error("Failed to disconnect Slack:", err);
      setError(
        err instanceof Error ? err.message : "Failed to disconnect Slack"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Connect Slack"
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
          ? `Manage your Slack connection and channel settings.`
          : `Connect your Slack workspace to receive pull request notifications in your team channels.`}
      </p>

      <SlackChannelSection isConnected={isConnected} teamName={teamName} />

      {!isConnected && (
        <SlackConnectionMethods
          onConnectionSuccess={handleConnectionSuccess}
          onError={handleConnectionError}
        />
      )}
    </Modal>
  );
}

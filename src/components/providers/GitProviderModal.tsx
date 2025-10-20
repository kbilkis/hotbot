import { useState } from "preact/hooks";

import { useGitProviders } from "@/hooks/useGitProviders";
import { gitApi } from "@/lib/api/client";
import { GitProviderData } from "@/lib/validation/provider-schemas";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

import Modal from "../ui/Modal";

import GitConnectionMethods from "./git/GitConnectionMethods";
import GitRepositorySection from "./git/GitRepositorySection";

interface GitProviderModalProps {
  provider: GitProviderData;
  onClose: () => void;
}

export default function GitProviderModal({
  provider,
  onClose,
}: Readonly<GitProviderModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetch } = useGitProviders();
  const isConnected = provider.connected;

  const providerNames = {
    github: "GitHub",
    gitlab: "GitLab",
    bitbucket: "Bitbucket",
  };

  const providerName = providerNames[provider.provider];

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
      const response = await gitApi.$delete({
        query: { type: provider.provider },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      console.log("Successfully disconnected git provider:", data);

      refetch();
      onClose();
    } catch (err) {
      console.error("Failed to disconnect git provider:", err);
      setError(
        err instanceof Error ? err.message : "Failed to disconnect provider"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Connect ${providerName} Provider`}
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
          ? `Manage your ${providerName} connection and settings.`
          : `Connect your ${providerName} account to receive notifications for pull requests and repository events.`}
      </p>
      {isConnected && (
        <>
          <div className={modalStyles.formGroup}>
            <div className={modalStyles.providerDisplay}>
              <span className={modalStyles.connectionStatusConnected}>
                ✓ Connected
              </span>
            </div>
          </div>
          <GitRepositorySection provider={provider} isConnected={isConnected} />
        </>
      )}
      {!isConnected && (
        <GitConnectionMethods
          provider={provider}
          onConnectionSuccess={handleConnectionSuccess}
          onError={handleConnectionError}
        />
      )}
    </Modal>
  );
}

import React, { useState } from "react";

import { useGitProviders } from "../../hooks/useGitProviders";
import { GitProviderData } from "../../lib/validation/provider-schemas";
import GitProviderModal from "../providers/GitProviderModal";

// Provider icons mapping
const providerIcons: Record<string, string> = {
  github: "🐙",
  gitlab: "🦊",
  bitbucket: "🪣",
};

export default function GitProviders(): React.ReactElement {
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<GitProviderData | null>(null);
  const { providers, loading, error, refetch } = useGitProviders();

  const handleConnectProvider = (provider: GitProviderData) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProvider(null);
    // No need to refetch here - the modal already invalidates SWR cache after successful operations
  };

  if (loading) {
    return (
      <div className="provider-section">
        <h2>Git Providers</h2>
        <p>Loading providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-section">
        <h2>Git Providers</h2>
        <p className="error">Error: {error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="provider-section">
      <h2>Git Providers</h2>
      <p>
        Connect your Git provider to start receiving notifications for pull
        requests.
      </p>
      <div className="provider-list">
        {providers.map((provider) => (
          <div key={provider.provider} className="provider-card">
            <div className="provider-info">
              <span className="provider-icon">
                {providerIcons[provider.provider]}
              </span>
              <span className="provider-name">{provider.name}</span>
              {provider.connected && (
                <span className="connection-status connected">✓ Connected</span>
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
        <GitProviderModal
          provider={selectedProvider}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

import { useState } from "preact/hooks";

import { GitProviderData } from "@/lib/validation/provider-schemas";

import { useGitProviders } from "../../hooks/useGitProviders";
import {
  getProviderColor,
  getProviderBgColor,
} from "../../utils/providerColors";
import GitProviderModal from "../providers/GitProviderModal";

export default function GitProviders() {
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
          <div
            key={provider.provider}
            className="provider-card"
            style={{
              backgroundColor: getProviderBgColor(provider.provider),
              borderColor: getProviderColor(provider.provider) + "20",
            }}
          >
            <div className="provider-info">
              <div className="provider-icon">
                {provider.provider === "github" && (
                  <img
                    src="/images/providers/github/GitHub_Invertocat_Dark.svg"
                    alt="GitHub"
                    className="provider-logo"
                  />
                )}
                {provider.provider === "gitlab" && (
                  <img
                    src="/images/providers/gitlab/gitlab-logo-500-rgb.svg"
                    alt="GitLab"
                    className="provider-logo gitlab"
                  />
                )}
                {provider.provider === "bitbucket" && (
                  <img
                    src="/images/providers/bitbucket/Bitbucket_mark_brand_RGB.svg"
                    alt="Bitbucket"
                    className="provider-logo"
                  />
                )}
              </div>
              <span className="provider-name">{provider.name}</span>
              {provider.connected && (
                <span
                  className="connection-status connected"
                  style={{ color: getProviderColor(provider.provider) }}
                >
                  ✓ Connected
                </span>
              )}
            </div>
            <button
              className={`connect-button ${
                provider.connected ? "connected" : ""
              } ${provider.provider === "bitbucket" ? "coming-soon" : ""}`}
              onClick={() => handleConnectProvider(provider)}
              disabled={provider.provider === "bitbucket"}
            >
              {provider.provider === "bitbucket"
                ? "Coming Soon"
                : provider.connected
                ? "Manage"
                : "Connect"}
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

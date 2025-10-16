import { useState } from "preact/hooks";

import { useGitProviders } from "@/hooks/useGitProviders";
import { GitProviderData } from "@/lib/validation/provider-schemas";
import * as styles from "@/styles/dashboard/providers.css";
import { button } from "@/styles/theme/index.css";
import { getProviderColor, getProviderBgColor } from "@/utils/providerColors";

import GitProviderModal from "../providers/GitProviderModal";

export default function GitProviders() {
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<GitProviderData | null>(null);
  const { providers, loading, error } = useGitProviders();

  const handleConnectProvider = (provider: GitProviderData) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProvider(null);
  };

  if (loading) {
    return (
      <div className={styles.providerSection}>
        <h2 className={styles.providerSectionTitle}>Git Providers</h2>
        <p className={styles.providerSectionDescription}>
          Loading providers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.providerSection}>
        <h2 className={styles.providerSectionTitle}>Git Providers</h2>
        <p className={styles.providerSectionDescription}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.providerSection}>
      <h2 className={styles.providerSectionTitle}>Git Providers</h2>
      <p className={styles.providerSectionDescription}>
        Connect your Git provider to start receiving notifications for pull
        requests.
      </p>
      <div className={styles.providerList}>
        {providers.map((provider) => (
          <div
            key={provider.provider}
            className={styles.providerCard}
            style={{
              backgroundColor: getProviderBgColor(provider.provider),
              borderColor: getProviderColor(provider.provider) + "20",
            }}
          >
            <div className={styles.providerInfo}>
              <div className={styles.providerIcon}>
                {provider.provider === "github" && (
                  <img
                    src="/images/providers/github/GitHub_Invertocat_Dark.svg"
                    alt="GitHub"
                    className={styles.providerLogo}
                  />
                )}
                {provider.provider === "gitlab" && (
                  <img
                    src="/images/providers/gitlab/gitlab-logo-500-rgb.svg"
                    alt="GitLab"
                    className={styles.providerLogoGitlab}
                  />
                )}
                {provider.provider === "bitbucket" && (
                  <img
                    src="/images/providers/bitbucket/Bitbucket_mark_brand_RGB.svg"
                    alt="Bitbucket"
                    className={styles.providerLogo}
                  />
                )}
              </div>
              <span className={styles.providerName}>{provider.name}</span>
              {provider.connected && (
                <span
                  className={styles.connectionStatusConnected}
                  style={{ color: getProviderColor(provider.provider) }}
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

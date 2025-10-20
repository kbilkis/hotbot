import { useGitProviders } from "@/hooks/useGitProviders";
import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import * as formStyles from "@/styles/schedules/forms.css";

interface ProviderSectionProps {
  selectedGitProviderId: string;
  selectedMessagingProviderId: string;
  onGitProviderChange: (providerId: string) => void;
  onMessagingProviderChange: (providerId: string) => void;
  errors: {
    gitProviderId?: string;
    messagingProviderId?: string;
  };
}

export default function ProviderSection({
  selectedGitProviderId,
  selectedMessagingProviderId,
  onGitProviderChange,
  onMessagingProviderChange,
  errors,
}: Readonly<ProviderSectionProps>) {
  const { providers: gitProviders, loading: loadingGitProviders } =
    useGitProviders();
  const { providers: messagingProviders, loading: loadingMessagingProviders } =
    useMessagingProviders();

  const loadingProviders = loadingGitProviders || loadingMessagingProviders;
  return (
    <div className={formStyles.formSection}>
      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="git-provider" className={formStyles.formLabel}>
            Git Provider
          </label>
          <select
            id="git-provider"
            className={`${formStyles.formSelect} ${
              errors.gitProviderId ? formStyles.fieldError : ""
            }`}
            value={selectedGitProviderId}
            onChange={(e) => onGitProviderChange(e.currentTarget.value)}
            disabled={loadingProviders}
          >
            <option value="">
              {loadingProviders ? "Loading..." : "Select Git Provider"}
            </option>
            {gitProviders
              .filter((provider) => provider.connected)
              .map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.provider})
                </option>
              ))}
            {!loadingProviders &&
              gitProviders.filter((p) => p.connected).length === 0 && (
                <option value="" disabled>
                  No git providers connected
                </option>
              )}
          </select>
          {errors.gitProviderId && (
            <div className={formStyles.fieldError}>{errors.gitProviderId}</div>
          )}
        </div>

        <div className={formStyles.formGroup}>
          <label htmlFor="messaging-provider" className={formStyles.formLabel}>
            Messaging Provider
          </label>
          <select
            id="messaging-provider"
            className={`${formStyles.formSelect} ${
              errors.messagingProviderId ? formStyles.fieldError : ""
            }`}
            value={selectedMessagingProviderId}
            onChange={(e) => onMessagingProviderChange(e.currentTarget.value)}
            disabled={loadingProviders}
          >
            <option value="">
              {loadingProviders ? "Loading..." : "Select Messaging Provider"}
            </option>
            {messagingProviders
              .filter((provider) => provider.connected)
              .map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            {!loadingProviders &&
              messagingProviders.filter((p) => p.connected).length === 0 && (
                <option value="" disabled>
                  No messaging providers connected
                </option>
              )}
          </select>
          {errors.messagingProviderId && (
            <div className={formStyles.fieldError}>
              {errors.messagingProviderId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

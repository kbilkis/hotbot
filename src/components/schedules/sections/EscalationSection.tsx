import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import type {
  EscalationSettings,
  EscalationErrors,
} from "@/lib/schedules/validation";
import * as formStyles from "@/styles/schedules/forms.css";

import ChannelSection from "./ChannelSection";

interface EscalationSectionProps {
  escalation: EscalationSettings;
  onEscalationChange: (escalation: Partial<EscalationSettings>) => void;
  errors?: EscalationErrors;
  initialChannelId?: string;
}

export default function EscalationSection({
  escalation,
  onEscalationChange,
  errors = {},
  initialChannelId,
}: Readonly<EscalationSectionProps>) {
  const { providers: messagingProviders, loading: loadingMessagingProviders } =
    useMessagingProviders();

  return (
    <div className={formStyles.formSection}>
      <h3>Escalation Settings</h3>
      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="escalation-provider">Escalation Provider</label>
          <select
            id="escalation-provider"
            className={formStyles.formSelect}
            value={escalation.providerId}
            onChange={(e) => {
              const providerId = e.currentTarget.value;
              onEscalationChange({
                providerId,
                channelId: "", // Clear channel when provider changes
              });
            }}
            disabled={loadingMessagingProviders}
          >
            <option value="">No escalation</option>
            {messagingProviders
              .filter((provider) => provider.connected)
              .map((provider) => (
                <option key={`escalation-${provider.id}`} value={provider.id}>
                  {provider.name}
                </option>
              ))}
          </select>
        </div>

        {escalation.providerId && (
          <ChannelSection
            selectedMessagingProvider={
              messagingProviders.find((p) => p.id === escalation.providerId) ||
              null
            }
            selectedChannelId={escalation.channelId}
            onChannelChange={(channelId) => onEscalationChange({ channelId })}
            errors={{ messagingChannelId: errors.channelId }}
            initialChannelId={initialChannelId}
            label="Escalation Channel"
          />
        )}

        <div className={formStyles.formGroup}>
          <label htmlFor="escalation-days">Escalation Days</label>
          <input
            id="escalation-days"
            type="number"
            className={`${formStyles.formInput} ${
              errors.days ? formStyles.fieldError : ""
            }`}
            min="1"
            max="30"
            value={escalation.days}
            onChange={(e) =>
              onEscalationChange({
                days: Number.parseInt(e.currentTarget.value) || 3,
              })
            }
          />
          {errors.days && (
            <div className={formStyles.fieldError}>{errors.days}</div>
          )}
        </div>
      </div>
      <small className={formStyles.formHelp}>
        Send escalation notifications for PRs older than the specified number of
        days to a different channel
      </small>
    </div>
  );
}

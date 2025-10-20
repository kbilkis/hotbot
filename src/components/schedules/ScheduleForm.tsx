import { MessagingProviderDTO } from "@/api/providers/messaging";
import type {
  CronJobFormData,
  ValidationErrors,
} from "@/lib/schedules/validation";
import * as formStyles from "@/styles/schedules/forms.css";

import CronBuilder from "./CronBuilder";
import FilterBuilder from "./FilterBuilder";
import ChannelSection from "./sections/ChannelSection";
import EscalationSection from "./sections/EscalationSection";
import ProviderSection from "./sections/ProviderSection";
import RepositorySection from "./sections/RepositorySection";

interface ScheduleFormProps {
  formData: CronJobFormData;
  errors: ValidationErrors;
  messagingProviders: MessagingProviderDTO[];

  onFieldUpdate: <K extends keyof CronJobFormData>(
    field: K,
    value: CronJobFormData[K]
  ) => void;
}

export default function ScheduleForm({
  formData,
  errors,
  messagingProviders,
  onFieldUpdate,
}: Readonly<ScheduleFormProps>) {
  return (
    <>
      {/* Schedule Name */}
      <div className={formStyles.formGroup}>
        <label htmlFor="schedule-name" className={formStyles.formLabel}>
          Schedule Name
        </label>
        <input
          id="schedule-name"
          type="text"
          className={
            errors.name ? formStyles.formInputError : formStyles.formInput
          }
          placeholder="e.g., Critical PRs"
          value={formData.name}
          onChange={(e) => onFieldUpdate("name", e.currentTarget.value)}
        />
        {errors.name && (
          <div className={formStyles.fieldError}>{errors.name}</div>
        )}
      </div>
      {/* Providers */}
      <ProviderSection
        selectedGitProviderId={formData.gitProviderId}
        selectedMessagingProviderId={formData.messagingProviderId}
        onGitProviderChange={(providerId) =>
          onFieldUpdate("gitProviderId", providerId)
        }
        onMessagingProviderChange={(providerId) =>
          onFieldUpdate("messagingProviderId", providerId)
        }
        errors={errors}
      />
      {/* Repositories and Channels */}
      <div className={formStyles.formSection}>
        <div className={formStyles.formRow}>
          <RepositorySection
            selectedGitProviderId={formData.gitProviderId}
            selectedRepositories={formData.repositories}
            onRepositoriesChange={(repositories) =>
              onFieldUpdate("repositories", repositories)
            }
            errors={errors}
          />
          <ChannelSection
            selectedMessagingProvider={
              messagingProviders.find(
                (p) => p.id === formData.messagingProviderId
              ) || null
            }
            selectedChannelId={formData.messagingChannelId}
            onChannelChange={(channelId) =>
              onFieldUpdate("messagingChannelId", channelId)
            }
            errors={errors}
            initialChannelId={formData.messagingChannelId || undefined}
          />
        </div>
      </div>
      {/* Schedule Timing */}
      <div className={formStyles.formSection}>
        <h3>Schedule</h3>
        <CronBuilder
          value={formData.cronExpression}
          onChange={(expression) => onFieldUpdate("cronExpression", expression)}
          error={errors.cronExpression}
          timezone={formData.timezone}
          onTimezoneChange={(timezone) => onFieldUpdate("timezone", timezone)}
        />
      </div>
      {/* PR Filters */}
      <div className={formStyles.formSection}>
        <h3>PR Filters</h3>
        <FilterBuilder
          value={formData.prFilters}
          onChange={(filters) => onFieldUpdate("prFilters", filters)}
        />
      </div>
      {/* Escalation Settings */}
      <EscalationSection
        escalation={formData.escalation}
        onEscalationChange={(escalation) =>
          onFieldUpdate("escalation", { ...formData.escalation, ...escalation })
        }
        errors={errors.escalation}
        initialChannelId={formData.escalation.channelId || undefined}
      />
      {/* Options */}
      <div className={formStyles.formGroup}>
        <label className={formStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.sendWhenEmpty}
            onChange={(e) =>
              onFieldUpdate("sendWhenEmpty", e.currentTarget.checked)
            }
          />
          {"Send notification even when no PRs are found"}
        </label>
      </div>
    </>
  );
}

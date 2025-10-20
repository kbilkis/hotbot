import { useState, useEffect } from "preact/hooks";

import { useGitProviders } from "@/hooks/useGitProviders";
import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { CronJob } from "@/lib/database/schema";
import { saveSchedule } from "@/lib/schedules/api";
import {
  type CronJobFormData,
  type ValidationErrors,
  validateScheduleForm,
  isScheduleFormValid,
  getValidationSummary,
} from "@/lib/schedules/validation";
import { getUserTimezoneOrFallback } from "@/lib/utils/timezone";
import { button } from "@/styles/theme/index.css";

import Modal from "../ui/Modal";

import ScheduleForm from "./ScheduleForm";

interface ScheduleModalProps {
  onClose: (shouldRefresh?: boolean) => void;
  scheduleToEdit?: CronJob;
}

const getDefaultFormData = (): CronJobFormData => ({
  name: "Daily reminder for open Pull Requests",
  cronExpression: "0 16 * * *",
  timezone: getUserTimezoneOrFallback(),
  gitProviderId: "",
  repositories: [],
  messagingProviderId: "",
  messagingChannelId: "",
  escalation: {
    providerId: "",
    channelId: "",
    days: 3,
  },
  prFilters: { labels: [], titleKeywords: [] },
  sendWhenEmpty: false,
});

export default function ScheduleModal({
  onClose,
  scheduleToEdit,
}: Readonly<ScheduleModalProps>) {
  const [formData, setFormData] = useState<CronJobFormData>(
    getDefaultFormData()
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { providers: gitProviders, loading: loadingGitProviders } =
    useGitProviders();
  const { providers: messagingProviders, loading: loadingMessagingProviders } =
    useMessagingProviders();
  const loadingProviders = loadingGitProviders || loadingMessagingProviders;

  // Initialize form data if editing
  useEffect(() => {
    if (scheduleToEdit) {
      setFormData({
        name: scheduleToEdit.name || "",
        cronExpression: scheduleToEdit.cronExpression || "",
        timezone: getUserTimezoneOrFallback(),
        gitProviderId: scheduleToEdit.gitProviderId || "",
        repositories: scheduleToEdit.repositories || [],
        messagingProviderId: scheduleToEdit.messagingProviderId || "",
        messagingChannelId: scheduleToEdit.messagingChannelId || "",
        escalation: {
          providerId: scheduleToEdit.escalationProviderId || "",
          channelId: scheduleToEdit.escalationChannelId || "",
          days: scheduleToEdit.escalationDays || 3,
        },
        prFilters: {
          labels: scheduleToEdit.prFilters?.labels || [],
          titleKeywords: scheduleToEdit.prFilters?.titleKeywords || [],
        },
        sendWhenEmpty: scheduleToEdit.sendWhenEmpty || false,
      });
    }
  }, [scheduleToEdit]);

  // Auto-select first providers when creating a new schedule
  useEffect(() => {
    if (!scheduleToEdit && !loadingProviders) {
      const connectedGitProvider = gitProviders.find((p) => p.connected);
      const connectedMessagingProvider = messagingProviders.find(
        (p) => p.connected
      );

      setFormData((prev) => ({
        ...prev,
        gitProviderId: prev.gitProviderId || connectedGitProvider?.id || "",
        messagingProviderId:
          prev.messagingProviderId || connectedMessagingProvider?.id || "",
      }));
    }
  }, [scheduleToEdit, loadingProviders, gitProviders, messagingProviders]);

  // Form update with side effects
  const updateField = <K extends keyof CronJobFormData>(
    field: K,
    value: CronJobFormData[K]
  ) => {
    setFormData((prev) => {
      const updates: Partial<CronJobFormData> = { [field]: value };

      // Handle side effects
      if (field === "gitProviderId") {
        updates.repositories = []; // Clear repositories when git provider changes
      }
      if (field === "messagingProviderId") {
        updates.messagingChannelId = ""; // Clear channel when messaging provider changes
      }

      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async () => {
    const validationErrors = validateScheduleForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await saveSchedule(formData, scheduleToEdit);

    if (result.success) {
      onClose(true);
    } else {
      setErrors({ submit: result.error });
    }
    setIsSubmitting(false);
  };

  const submitCtaTitle = () => {
    if (isSubmitting) return "Saving...";
    if (scheduleToEdit) return "Update Schedule";
    return "Create Schedule";
  };

  const modalError =
    errors.submit ||
    (!isScheduleFormValid(formData) && !isSubmitting
      ? `⚠️ Please complete: ${getValidationSummary(formData).join(", ")}`
      : null);

  return (
    <Modal
      title={`📅 ${scheduleToEdit ? "Edit Schedule" : "Create New Schedule"}`}
      onClose={() => onClose()}
      error={modalError}
      footerActions={
        <>
          <button
            className={button({ color: "outline" })}
            onClick={() => onClose()}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={button({ color: "primary" })}
            onClick={handleSubmit}
            disabled={isSubmitting || !isScheduleFormValid(formData)}
          >
            {submitCtaTitle()}
          </button>
        </>
      }
    >
      <ScheduleForm
        formData={formData}
        errors={errors}
        messagingProviders={messagingProviders}
        onFieldUpdate={updateField}
      />
    </Modal>
  );
}

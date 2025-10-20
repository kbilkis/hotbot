import CronExpressionParser from "cron-parser";

export interface EscalationSettings {
  providerId: string;
  channelId: string;
  days: number;
}

export interface PRFilters {
  labels: string[];
  titleKeywords: string[];
}

export interface CronJobFormData {
  name: string;
  cronExpression: string;
  timezone: string;
  gitProviderId: string;
  repositories: string[];
  messagingProviderId: string;
  messagingChannelId: string;
  escalation: EscalationSettings;
  prFilters: PRFilters;
  sendWhenEmpty: boolean;
}

export interface EscalationErrors {
  providerId?: string;
  channelId?: string;
  days?: string;
}

export interface ValidationErrors {
  name?: string;
  cronExpression?: string;
  gitProviderId?: string;
  repositories?: string;
  messagingProviderId?: string;
  messagingChannelId?: string;
  escalation?: EscalationErrors;
  submit?: string;
}

const validateCronExpression = (expression: string): boolean => {
  try {
    CronExpressionParser.parse(expression, { tz: "UTC" });
    return true;
  } catch {
    return false;
  }
};

export const validateScheduleForm = (
  formData: CronJobFormData
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData.name.trim()) {
    errors.name = "Schedule name is required";
  }

  if (!formData.cronExpression.trim()) {
    errors.cronExpression = "Cron expression is required";
  } else if (!validateCronExpression(formData.cronExpression)) {
    errors.cronExpression = "Invalid cron expression format";
  }

  if (!formData.gitProviderId) {
    errors.gitProviderId = "Git provider is required";
  }

  if (!formData.repositories || formData.repositories.length === 0) {
    errors.repositories = "At least one repository is required";
  }

  if (!formData.messagingProviderId) {
    errors.messagingProviderId = "Messaging provider is required";
  }

  if (!formData.messagingChannelId) {
    errors.messagingChannelId = "Messaging channel is required";
  }

  if (formData.escalation.providerId && formData.escalation.days < 1) {
    errors.escalation = {
      ...errors.escalation,
      days: "Escalation days must be at least 1",
    };
  }

  if (formData.escalation.providerId && !formData.escalation.channelId) {
    errors.escalation = {
      ...errors.escalation,
      channelId:
        "Escalation channel is required when escalation provider is selected",
    };
  }

  return errors;
};
export const isScheduleFormValid = (formData: CronJobFormData): boolean => {
  return (
    formData.name.trim() !== "" &&
    formData.cronExpression.trim() !== "" &&
    validateCronExpression(formData.cronExpression) &&
    formData.gitProviderId !== "" &&
    formData.repositories.length > 0 &&
    formData.messagingProviderId !== "" &&
    formData.messagingChannelId !== "" &&
    (!formData.escalation.providerId ||
      (formData.escalation.channelId !== "" && formData.escalation.days >= 1))
  );
};

export const getValidationSummary = (formData: CronJobFormData): string[] => {
  const missing: string[] = [];

  if (!formData.name.trim()) missing.push("Schedule name");
  if (!formData.cronExpression.trim()) missing.push("Schedule timing");
  if (!formData.gitProviderId) missing.push("Git provider");
  if (!formData.repositories || formData.repositories.length === 0)
    missing.push("Repository selection");
  if (!formData.messagingProviderId) missing.push("Messaging provider");
  if (!formData.messagingChannelId) missing.push("Notification channel");
  if (formData.escalation.providerId && !formData.escalation.channelId)
    missing.push("Escalation channel");

  return missing;
};

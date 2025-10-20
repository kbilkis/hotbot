import { schedulesApi } from "@/lib/api/client";
import { CronJob } from "@/lib/database/schema";

import type { CronJobFormData } from "./validation";

export const saveSchedule = async (
  formData: CronJobFormData,
  existingSchedule?: CronJob
): Promise<{ success: boolean; error?: string }> => {
  try {
    const apiData = {
      name: formData.name.trim(),
      cronExpression: formData.cronExpression.trim(),
      gitProviderId: formData.gitProviderId,
      repositories: formData.repositories,
      messagingProviderId: formData.messagingProviderId,
      messagingChannelId: formData.messagingChannelId,
      escalationProviderId: formData.escalation.providerId || undefined,
      escalationChannelId: formData.escalation.providerId
        ? formData.escalation.channelId
        : undefined,
      escalationDays: formData.escalation.providerId
        ? formData.escalation.days
        : undefined,
      prFilters: formData.prFilters,
      sendWhenEmpty: formData.sendWhenEmpty,
      isActive: existingSchedule?.isActive ?? true,
    };

    let response;

    if (existingSchedule) {
      response = await schedulesApi[":id"].$put({
        param: { id: existingSchedule.id },
        json: { id: existingSchedule.id, ...apiData },
      });
    } else {
      response = await schedulesApi.$post({ json: apiData });
    }

    const data = await response.json();
    if (!data.success) {
      const errorMessage =
        data.message ||
        data.error ||
        `Failed to ${existingSchedule ? "update" : "create"} schedule`;
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save schedule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save schedule",
    };
  }
};

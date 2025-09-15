import useSWR from "swr";

import { CronJob } from "../types/dashboard";

interface ApiCronJob {
  id: string;
  name: string;
  isActive: boolean;
  lastExecuted?: string;
  nextExecution?: string;
  cronExpression: string;
  gitProviderId: string;
  repositories?: string[];
  messagingChannelId: string;
  messagingProviderId: string;
  escalationProviderId?: string;
  escalationDays?: number;
  prFilters?: {
    labels?: string[];
    titleKeywords?: string[];
    excludeAuthors?: string[];
    minAge?: number;
    maxAge?: number;
  };
  sendWhenEmpty: boolean;
}

interface SchedulesResponseData {
  jobs: ApiCronJob[];
}

const fetcher = async (url: string): Promise<CronJob[]> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed: ${response.status}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const data: SchedulesResponseData = await response.json();

  // Transform API response to match our component interface
  const transformedSchedules: CronJob[] = data.jobs.map((job: ApiCronJob) => ({
    id: job.id,
    name: job.name,
    status: job.isActive ? "active" : "paused",
    lastRun: job.lastExecuted
      ? new Date(job.lastExecuted).toLocaleString()
      : undefined,
    nextRun: job.nextExecution
      ? new Date(job.nextExecution).toLocaleString()
      : undefined,
    cronExpression: job.cronExpression,
    gitProviderId: job.gitProviderId,
    repositories: job.repositories || [],
    messagingChannelId: job.messagingChannelId,
    messagingProviderId: job.messagingProviderId,
    escalationProviderId: job.escalationProviderId,
    escalationDays: job.escalationDays,
    prFilters: job.prFilters,
    sendWhenEmpty: job.sendWhenEmpty,
  }));

  return transformedSchedules;
};

export function useSchedules(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/schedules" : null,
    fetcher
  );

  return {
    schedules: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

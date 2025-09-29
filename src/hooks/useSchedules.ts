import useSWR from "swr";

import { CronJob } from "@/lib/database/schema";

interface SchedulesResponseData {
  jobs: CronJob[];
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

  return data.jobs;
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

import type { InferRequestType } from "hono/client";
import useSWR from "swr";

import { schedulesApi } from "../lib/api/client";

export function useSchedules(shouldFetch: boolean = true) {
  const $get = schedulesApi.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "schedules" : null,
    shouldFetch ? fetcher({ query: {} }) : null
  );

  if (data?.success) {
    return {
      schedules:
        data?.jobs.map((e) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
          lastExecuted: e.lastExecuted ? new Date(e.lastExecuted) : null,
        })) || [],
      loading: isLoading,
      error: null,
      refetch: () => mutate(),
    };
  } else {
    let dataError;
    if (!!data && !data.success) {
      dataError = data.error;
    }
    return {
      schedules: [],
      loading: isLoading,
      error: dataError || error?.message || null,
      refetch: () => mutate(),
    };
  }
}

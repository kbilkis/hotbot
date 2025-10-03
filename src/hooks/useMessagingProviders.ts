import type { InferRequestType } from "hono/client";
import useSWR from "swr";

import { messagingApi } from "../lib/api/client";

export function useMessagingProviders(shouldFetch: boolean = true) {
  const $get = messagingApi.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "messaging-providers" : null,
    shouldFetch ? fetcher({}) : null
  );

  if (data?.success) {
    return {
      providers: data?.data?.providers || [],
      loading: isLoading,
      error: null,
      refetch: () => mutate(),
    };
  } else {
    let dataError;
    if (!!data && !data.success) {
      dataError = data.message || data.error;
    }
    return {
      providers: [],
      loading: isLoading,
      error: dataError || error?.message || null,
      refetch: () => mutate(),
    };
  }
}

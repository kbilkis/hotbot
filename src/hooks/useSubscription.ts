import type { InferRequestType } from "hono/client";
import useSWR from "swr";

import { subscriptionsApi } from "@/lib/api/client";

export function useSubscription(shouldFetch: boolean = true) {
  const $get = subscriptionsApi.current.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "subscription-current" : null,
    shouldFetch ? fetcher({}) : null
  );

  if (data && "success" in data) {
    if (data.success) {
      return {
        subscription: data ?? null,
        loading: isLoading,
        error: null,
        refetch: () => mutate(),
      };
    } else {
      return {
        subscription: null,
        loading: isLoading,
        error: data.error ?? null,
        refetch: () => mutate(),
      };
    }
  } else {
    return {
      subscription: data ?? null,
      loading: isLoading,
      error: error?.message ?? null,
      refetch: () => mutate(),
    };
  }
}

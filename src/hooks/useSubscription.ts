import useSWR from "swr";

import { SubscriptionDataDto } from "@/api/subscriptions";

const fetcher = async (url: string): Promise<SubscriptionDataDto> => {
  const response = await fetch(url, {
    credentials: "include",
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

  const data: SubscriptionDataDto = await response.json();
  return data;
};

export function useSubscription(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/subscriptions/current" : null,
    fetcher
  );

  return {
    subscription: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

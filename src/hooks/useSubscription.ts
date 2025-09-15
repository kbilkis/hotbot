import useSWR from "swr";

export interface SubscriptionUsage {
  gitProvidersCount: number;
  messagingProvidersCount: number;
  cronJobsCount: number;
}

export interface SubscriptionLimits {
  gitProviders: number | null;
  messagingProviders: number | null;
  cronJobs: number | null;
  minCronInterval: number;
}

export interface SubscriptionBilling {
  subscriptionId: string;
  customerId: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionData {
  tier: "free" | "pro";
  status: string;
  usage: SubscriptionUsage;
  limits: SubscriptionLimits;
  billing: SubscriptionBilling | null;
  createdAt?: string;
  updatedAt?: string;
}

const fetcher = async (url: string): Promise<SubscriptionData> => {
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

  const data: SubscriptionData = await response.json();
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

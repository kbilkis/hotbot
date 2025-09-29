import useSWR from "swr";

import { MessagingProviderDTO } from "@/api/providers/messaging";

interface MessagingProviderResponseData {
  success: boolean;
  message: string;
  data: {
    providers: MessagingProviderDTO[];
  };
}

const fetcher = async (url: string): Promise<MessagingProviderDTO[]> => {
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

  const data: MessagingProviderResponseData = await response.json();

  if (data.success && data.data) {
    return data.data.providers;
  } else {
    throw new Error("Invalid response format");
  }
};

export function useMessagingProviders(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/providers/messaging" : null,
    fetcher
  );

  return {
    providers: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

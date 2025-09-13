import useSWR from "swr";

export interface MessagingProvider {
  id: string;
  type: string;
  name: string;
  connected: boolean;
  connectedAt?: string;
  providerId?: string;
}

interface MessagingProviderResponseData {
  success: boolean;
  message: string;
  data: {
    providers: MessagingProvider[];
  };
}

const fetcher = async (url: string): Promise<MessagingProvider[]> => {
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

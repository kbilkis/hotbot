import useSWR from "swr";
import {
  GitProviderData,
  GitProviderResponseData,
} from "../lib/validation/provider-schemas";

const fetcher = async (url: string): Promise<GitProviderData[]> => {
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

  const data: GitProviderResponseData = await response.json();

  if (data.success && data.data) {
    return data.data.providers;
  } else {
    throw new Error("Invalid response format");
  }
};

export function useGitProviders(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/providers/git" : null,
    fetcher
  );

  return {
    providers: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

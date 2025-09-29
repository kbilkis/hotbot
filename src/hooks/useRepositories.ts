import useSWR from "swr";

import { GitProviderData } from "@/lib/validation/provider-schemas";

const fetcher = async (url: string): Promise<string[]> => {
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

  const data = await response.json();

  if (data.success && data.data) {
    return data.data.repositories || [];
  } else {
    throw new Error("Invalid response format");
  }
};

// Hook to prefetch repositories for all connected git providers
export function usePrefetchRepositories(
  gitProviders: GitProviderData[],
  shouldFetch: boolean = true
) {
  const connectedGitProviders = gitProviders.filter((p) => p.connected);

  // Create SWR calls for each connected provider
  const repositoryData = connectedGitProviders.map((provider) => {
    // Build endpoint based on provider type
    const getEndpoint = () => {
      switch (provider.provider) {
        case "github":
          return "/api/providers/git/github/repositories";
        case "gitlab":
          return "/api/providers/git/gitlab/repositories";
        case "bitbucket":
          return "/api/providers/git/bitbucket/repositories";
        default:
          return null;
      }
    };

    const endpoint = getEndpoint();

    const { data, error, isLoading } = useSWR(
      shouldFetch && endpoint ? endpoint : null,
      fetcher
    );

    return {
      providerId: provider.id,
      providerType: provider.provider,
      repositories: data || [],
      loading: isLoading,
      error: error?.message || null,
    };
  });

  return {
    repositoriesByProvider: repositoryData.reduce((acc, item) => {
      acc[item.providerId] = item.repositories;
      return acc;
    }, {} as Record<string, string[]>),
    loading: repositoryData.some((item) => item.loading),
    errors: repositoryData
      .filter((item) => item.error)
      .map((item) => item.error),
  };
}

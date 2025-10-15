import type { InferRequestType } from "hono/client";
import useSWR from "swr";

import { githubApi, gitlabApi } from "@/lib/api/client";
import { GitProviderData } from "@/lib/validation/provider-schemas";

// GitHub repositories hook
function useGitHubRepositories(shouldFetch: boolean = true) {
  const $get = githubApi.repositories.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "github-repositories" : null,
    shouldFetch ? fetcher({}) : null
  );

  if (data?.success) {
    return {
      repositories: data.data?.repositories || [],
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
      repositories: [],
      loading: isLoading,
      error: dataError || error?.message || null,
      refetch: () => mutate(),
    };
  }
}

// GitLab repositories hook
function useGitLabRepositories(shouldFetch: boolean = true) {
  const $get = gitlabApi.repositories.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "gitlab-repositories" : null,
    shouldFetch ? fetcher({}) : null
  );

  if (data?.success) {
    return {
      repositories: data.data?.repositories || [],
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
      repositories: [],
      loading: isLoading,
      error: dataError || error?.message || null,
      refetch: () => mutate(),
    };
  }
}

// BitBucket repositories hook (placeholder for future implementation)
function useBitBucketRepositories(_shouldFetch: boolean = true) {
  // TODO: Implement when BitBucket API is available
  return {
    repositories: [],
    loading: false,
    error: "BitBucket provider not implemented yet",
    refetch: () => {},
  };
}

// Composition hook that orchestrates provider-specific hooks
export function useRepositories(
  gitProviders: GitProviderData[],
  shouldFetch: boolean = true
) {
  const connectedGitProviders = gitProviders.filter((p) => p.connected);

  // Use provider-specific hooks
  const githubRepos = useGitHubRepositories(
    shouldFetch && connectedGitProviders.some((p) => p.provider === "github")
  );
  const gitlabRepos = useGitLabRepositories(
    shouldFetch && connectedGitProviders.some((p) => p.provider === "gitlab")
  );
  const bitbucketRepos = useBitBucketRepositories(
    shouldFetch && connectedGitProviders.some((p) => p.provider === "bitbucket")
  );

  // Map provider data to results
  const repositoryData = connectedGitProviders.map((provider) => {
    let providerResult;
    switch (provider.provider) {
      case "github":
        providerResult = githubRepos;
        break;
      case "gitlab":
        providerResult = gitlabRepos;
        break;
      case "bitbucket":
        providerResult = bitbucketRepos;
        break;
      default:
        providerResult = {
          repositories: [],
          loading: false,
          error: `Unknown provider: ${provider.provider}`,
          refetch: () => {},
        };
    }

    return {
      providerId: provider.id,
      providerType: provider.provider,
      repositories: providerResult.repositories,
      loading: providerResult.loading,
      error: providerResult.error,
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
      .map((item) => item.error!),
  };
}

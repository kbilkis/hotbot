import useSWR from "swr";

import { gitApi } from "@/lib/api/client";

export function useRepositories(providerId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    providerId ? `repositories-${providerId}` : null,
    async () => {
      const response = await gitApi.repositories.$get({
        query: { providerId },
      });
      return response.json();
    }
  );

  return {
    repositories: data?.success ? data.data?.repositories || [] : [],
    loading: isLoading,
    error: data?.success === false ? data.message : error?.message || null,
    refetch: mutate,
  };
}

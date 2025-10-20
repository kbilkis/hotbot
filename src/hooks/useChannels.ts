import useSWR from "swr";

import { messagingApi, discordApi } from "@/lib/api/client";

// Unified hook for getting channels from any messaging provider
export function useChannels(providerId: string, guildId?: string) {
  const guildSuffix = guildId ? `-${guildId}` : "";
  const cacheKey = providerId ? `channels-${providerId}${guildSuffix}` : null;

  const { data, error, isLoading, mutate } = useSWR(cacheKey, async () => {
    const params: { providerId: string; guildId?: string } = { providerId };
    if (guildId) {
      params.guildId = guildId;
    }

    const response = await messagingApi.channels.$get({
      query: params,
    });
    return response.json();
  });

  return {
    channels: data?.success ? data.data?.channels || [] : [],
    loading: isLoading,
    error: data?.success === false ? data.message : error?.message || null,
    refetch: mutate,
  };
}

// Hook for Discord guilds (kept for backward compatibility)
export function useDiscordGuilds() {
  const { data, error, isLoading, mutate } = useSWR(
    "discord-guilds",
    async () => {
      const response = await discordApi.guilds.$get({});
      return response.json();
    }
  );

  return {
    guilds: data?.success ? data.data?.guilds || [] : [],
    loading: isLoading,
    error: data?.success === false ? data.message : error?.message || null,
    refetch: mutate,
  };
}

// Hook for Discord channels in a specific guild (kept for backward compatibility)
export function useDiscordChannels(guildId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    guildId ? `discord-channels-${guildId}` : null,
    async () => {
      const response = await discordApi.guilds[":guildId"].channels.$get({
        param: { guildId: guildId! },
      });
      return response.json();
    }
  );

  return {
    channels: data?.success ? data.data?.channels || [] : [],
    loading: isLoading,
    error: data?.success === false ? data.message : error?.message || null,
    refetch: mutate,
  };
}

import type { InferRequestType } from "hono/client";
import useSWR from "swr";

import { MessagingProviderType } from "@/lib/database/schema";

import { discordApi, slackApi } from "../lib/api/client";

// Hook for Discord guilds
export function useDiscordGuilds(shouldFetch: boolean = true) {
  const $get = discordApi.guilds.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "discord-guilds" : null,
    shouldFetch ? fetcher({}) : null
  );

  if (data?.success) {
    return {
      guilds: data.data?.guilds || [],
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
      guilds: [],
      loading: isLoading,
      error: dataError || error?.message || null,
      refetch: () => mutate(),
    };
  }
}

// Hook for Discord channels in a specific guild
export function useDiscordChannels(
  guildId?: string,
  shouldFetch: boolean = true
) {
  const $get = discordApi.guilds[":guildId"].channels.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const shouldFetchData = shouldFetch && !!guildId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetchData ? `discord-channels-${guildId}` : null,
    shouldFetchData ? fetcher({ param: { guildId: guildId! } }) : null
  );

  if (data?.success) {
    return {
      channels: data.data?.channels || [],
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
      channels: [],
      loading: isLoading,
      error: dataError || error?.message || null,
      refetch: () => mutate(),
    };
  }
}

// Hook for Slack channels
function useSlackChannels(shouldFetch: boolean = true) {
  const $get = slackApi.channels.$get;

  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
    const res = await $get(arg);
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "slack-channels" : null,
    shouldFetch ? fetcher({}) : null
  );

  if (data?.success) {
    return {
      channels: data.data?.channels || [],
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
      channels: [],
      loading: isLoading,
      error: dataError || error?.message || null,
      refetch: () => mutate(),
    };
  }
}

// Unified hook that delegates to provider-specific hooks
export function useChannels(
  messagingProviderId: string,
  providerType: MessagingProviderType,
  shouldFetch: boolean = true
) {
  const shouldFetchData =
    shouldFetch && !!messagingProviderId && !!providerType;

  // Use provider-specific hooks
  const slackChannels = useSlackChannels(
    shouldFetchData && providerType === "slack"
  );
  const discordGuilds = useDiscordGuilds(
    shouldFetchData && providerType === "discord"
  );

  // Return the appropriate data based on provider type
  switch (providerType) {
    case "slack":
      return slackChannels;
    case "discord":
      // Transform guilds to look like channels for backward compatibility
      return {
        channels: discordGuilds.guilds.map((guild) => ({
          id: guild.id,
          name: guild.name,
          type: "guild",
          isGuild: true,
        })),
        loading: discordGuilds.loading,
        error: discordGuilds.error,
        refetch: discordGuilds.refetch,
      };
    case "teams":
      // Teams not implemented yet
      return {
        channels: [],
        loading: false,
        error: "Teams provider not implemented yet",
        refetch: () => {},
      };
    default:
      return {
        channels: [],
        loading: false,
        error: `Unknown provider type: ${providerType}`,
        refetch: () => {},
      };
  }
}

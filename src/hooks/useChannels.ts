import useSWR from "swr";

import { MessagingProvider } from "./useMessagingProviders";

interface Channel {
  id: string;
  name: string;
  type?: "public" | "private" | "direct";
  memberCount?: number;
}

// Discord interfaces are inferred from API responses

const fetcher = async (url: string): Promise<unknown> => {
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
    return data.data;
  } else {
    throw new Error("Invalid response format");
  }
};

// Hook for Discord guilds
export function useDiscordGuilds(shouldFetch: boolean = true) {
  const endpoint = shouldFetch
    ? "/api/providers/messaging/discord/guilds"
    : null;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher);

  return {
    guilds: data?.guilds || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

// Hook for Discord channels in a specific guild
export function useDiscordChannels(
  guildId?: string,
  shouldFetch: boolean = true
) {
  const endpoint =
    shouldFetch && guildId
      ? `/api/providers/messaging/discord/guilds/${guildId}/channels`
      : null;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher);

  return {
    channels: data?.channels || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

export function useChannels(
  messagingProviderId?: string,
  providerType?: string,
  shouldFetch: boolean = true
) {
  // Only fetch if we have a messaging provider ID and should fetch
  const shouldFetchData =
    shouldFetch && !!messagingProviderId && !!providerType;

  // Build endpoint based on provider type
  let endpoint: string | null = null;
  if (shouldFetchData) {
    switch (providerType) {
      case "slack":
        endpoint = "/api/providers/messaging/slack/channels";
        break;
      case "teams":
        endpoint = "/api/providers/messaging/teams/channels";
        break;
      case "discord":
        // For Discord, we need guilds first, not direct channels
        endpoint = "/api/providers/messaging/discord/guilds";
        break;
      default:
        endpoint = null;
    }
  }

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher);

  // Extract the appropriate data based on provider type
  let extractedData = [];
  if (data) {
    if (providerType === "discord") {
      extractedData = data.guilds || [];
    } else {
      extractedData = data.channels || [];
    }
  }

  return {
    channels: extractedData,
    loading: isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}
// Hook to prefetch channels for all connected messaging providers
export function usePrefetchChannels(
  messagingProviders: MessagingProvider[],
  shouldFetch: boolean = true
) {
  const connectedMessagingProviders = messagingProviders.filter(
    (p) => p.connected
  );

  // Create SWR calls for each connected provider
  const channelData = connectedMessagingProviders.map((provider) => {
    // Build endpoint based on provider type
    let endpoint: string | null = null;
    switch (provider.type) {
      case "slack":
        endpoint = "/api/providers/messaging/slack/channels";
        break;
      case "teams":
        endpoint = "/api/providers/messaging/teams/channels";
        break;
      case "discord":
        endpoint = "/api/providers/messaging/discord/channels";
        break;
      default:
        endpoint = null;
    }

    const { data, error, isLoading } = useSWR(
      shouldFetch && endpoint ? endpoint : null,
      fetcher
    );

    return {
      providerId: provider.id,
      providerType: provider.type,
      channels: data || [],
      loading: isLoading,
      error: error?.message || null,
    };
  });

  return {
    channelsByProvider: channelData.reduce((acc, item) => {
      acc[item.providerId] = item.channels;
      return acc;
    }, {} as Record<string, Channel[]>),
    loading: channelData.some((item) => item.loading),
    errors: channelData.filter((item) => item.error).map((item) => item.error),
  };
}

import { useState, useEffect } from "preact/hooks";

import { MessagingProviderDTO } from "@/api/providers/messaging";
import { useChannels } from "@/hooks/useChannels";
import { discordApi } from "@/lib/api/client";
import { DiscordChannel } from "@/lib/discord";
import * as formStyles from "@/styles/schedules/forms.css";
import { SlackChannel } from "@/types/slack";

type ChannelType =
  | SlackChannel
  | DiscordChannel
  | { id: string; name: string; type?: string; isGuild?: boolean };

interface ChannelSectionProps {
  selectedMessagingProvider: MessagingProviderDTO | null;
  selectedChannelId: string;
  onChannelChange: (channelId: string) => void;
  errors: {
    messagingChannelId?: string;
  };
  // For editing existing schedules - helps find the right Discord guild
  initialChannelId?: string;
  // Custom label for the channel selection
  label?: string;
}

export default function ChannelSection({
  selectedMessagingProvider,
  selectedChannelId,
  onChannelChange,
  errors,
  initialChannelId,
  label = "Notification Channel",
}: Readonly<ChannelSectionProps>) {
  const [selectedDiscordGuild, setSelectedDiscordGuild] = useState("");

  const isDiscordProvider = selectedMessagingProvider?.type === "discord";

  // Get channels for the selected provider
  const { channels: providerChannels, loading: loadingProviderChannels } =
    useChannels(selectedMessagingProvider?.id || "");

  // For Discord, get channels for the selected guild
  const { channels: discordChannels, loading: loadingDiscordChannels } =
    useChannels(selectedMessagingProvider?.id || "", selectedDiscordGuild);

  // Determine available channels based on provider type
  const getAvailableChannels = (): ChannelType[] => {
    if (!selectedMessagingProvider) return [];

    if (isDiscordProvider) {
      return selectedDiscordGuild ? discordChannels : [];
    }

    return providerChannels;
  };

  const availableChannels = getAvailableChannels();
  const isLoading = isDiscordProvider
    ? loadingDiscordChannels
    : loadingProviderChannels;

  // Find the guild for the selected Discord channel when editing
  useEffect(() => {
    const findGuildForChannel = async () => {
      if (
        initialChannelId &&
        isDiscordProvider &&
        !selectedDiscordGuild &&
        !loadingProviderChannels &&
        providerChannels.length > 0
      ) {
        // Search through each guild to find the one containing our channel
        for (const guild of providerChannels) {
          try {
            const response = await discordApi.guilds[":guildId"].channels.$get({
              param: { guildId: guild.id },
            });

            const data = await response.json();
            if (data.success) {
              const channels = data.data?.channels || [];
              const channelExists = channels.some(
                (channel: DiscordChannel) => channel.id === initialChannelId
              );

              if (channelExists) {
                setSelectedDiscordGuild(guild.id);
                break;
              }
            }
          } catch (error) {
            console.warn(
              `Failed to fetch channels for guild ${guild.id}:`,
              error
            );
          }
        }
      }
    };

    findGuildForChannel();
  }, [
    initialChannelId,
    isDiscordProvider,
    selectedDiscordGuild,
    loadingProviderChannels,
    providerChannels,
  ]);

  const handleGuildChange = (guildId: string) => {
    setSelectedDiscordGuild(guildId);
    onChannelChange(""); // Clear selected channel when guild changes
  };

  const renderChannelSelector = () => {
    if (!selectedMessagingProvider) {
      return (
        <div className={formStyles.selectProviderFirst}>
          Select a messaging provider first
        </div>
      );
    }

    if (isDiscordProvider) {
      return (
        <div className={formStyles.discordSelection}>
          {/* Guild Selection */}
          <select
            className={formStyles.formSelect}
            value={selectedDiscordGuild}
            onChange={(e) => handleGuildChange(e.currentTarget.value)}
            style={{ marginBottom: "8px" }}
          >
            <option value="">Select Discord Server</option>
            {providerChannels.map((guild) => (
              <option key={guild.id} value={guild.id}>
                🏰 {guild.name}
              </option>
            ))}
          </select>

          {/* Channel Selection (only show if guild is selected) */}
          {selectedDiscordGuild && (
            <>
              {isLoading && (
                <div className={formStyles.loadingText}>
                  Loading channels...
                </div>
              )}

              {!isLoading && availableChannels.length > 0 && (
                <select
                  id="messaging-channel"
                  className={`${formStyles.formSelect} ${
                    errors.messagingChannelId ? formStyles.fieldError : ""
                  }`}
                  value={selectedChannelId}
                  onChange={(e) => onChannelChange(e.currentTarget.value)}
                >
                  <option value="">Select a channel</option>
                  {availableChannels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      # {channel.name}
                    </option>
                  ))}
                </select>
              )}

              {!isLoading && availableChannels.length === 0 && (
                <div className={formStyles.noChannels}>
                  No channels found in this server
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Non-Discord providers (Slack/Teams)
    if (isLoading) {
      return <div className={formStyles.loadingText}>Loading channels...</div>;
    }

    if (availableChannels.length === 0) {
      return (
        <div className={formStyles.noChannels}>
          No channels found for this provider
        </div>
      );
    }

    return (
      <select
        id="messaging-channel"
        className={`${formStyles.formSelect} ${
          errors.messagingChannelId ? formStyles.fieldError : ""
        }`}
        value={selectedChannelId}
        onChange={(e) => onChannelChange(e.currentTarget.value)}
      >
        <option value="">Select a channel</option>
        {availableChannels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.type === "private" ? "🔒" : "#"} {channel.name}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className={formStyles.formGroup}>
      <label htmlFor="messaging-channel" className={formStyles.formLabel}>
        {label}
      </label>
      <div className={formStyles.channelSelection}>
        {renderChannelSelector()}
      </div>
      {errors.messagingChannelId && (
        <div className={formStyles.fieldError}>{errors.messagingChannelId}</div>
      )}
    </div>
  );
}

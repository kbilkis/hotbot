import { useState } from "preact/hooks";

import { useDiscordGuilds } from "@/hooks/useChannels";
import * as channelStyles from "@/styles/providers/channels.css";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

import DiscordChannelList from "./DiscordChannelList";

export default function DiscordGuildList() {
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);

  const {
    guilds,
    loading: guildsLoading,
    error: guildsError,
    refetch: refetchGuilds,
  } = useDiscordGuilds();

  return (
    <div className={modalStyles.formGroup}>
      <div
        className={modalStyles.formLabel}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Available Servers</span>
        <button
          className={button({ color: "ghost", size: "xs" })}
          onClick={() => refetchGuilds()}
          disabled={guildsLoading}
          title="Refresh servers"
        >
          🔄 Refresh
        </button>
      </div>
      <div>
        {guildsLoading && (
          <div className={modalStyles.loadingState}>
            <span>Loading servers...</span>
          </div>
        )}

        {guildsError && (
          <div className={modalStyles.errorState}>
            <span>Error loading servers: {guildsError}</span>
            <button
              className={button({ color: "danger", size: "xs" })}
              onClick={() => refetchGuilds()}
              disabled={guildsLoading}
            >
              Retry
            </button>
          </div>
        )}

        {!guildsLoading && !guildsError && guilds.length > 0 && (
          <div>
            <div className={modalStyles.itemCount}>
              {guilds.length} server{guilds.length === 1 ? "" : "s"} available
            </div>
            <div className={channelStyles.channelsContainer}>
              {guilds.map((guild) => (
                <div key={guild.id} className={channelStyles.guildItem}>
                  <div className={channelStyles.guildHeader}>
                    <div className={channelStyles.guildIcon}>🏰</div>
                    <span className={channelStyles.guildName}>
                      {guild.name}
                    </span>
                    <button
                      className={
                        selectedGuild === guild.id
                          ? button({ color: "success", size: "xs" })
                          : button({ color: "info", size: "xs" })
                      }
                      onClick={() => setSelectedGuild(guild.id)}
                      disabled={selectedGuild === guild.id}
                    >
                      {selectedGuild === guild.id ? "Selected" : "Select"}
                    </button>
                  </div>

                  {selectedGuild === guild.id && (
                    <DiscordChannelList guildId={guild.id} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!guildsLoading && !guildsError && guilds.length === 0 && (
          <div className={modalStyles.emptyState}>
            <span>No servers found with webhook permissions</span>
          </div>
        )}
      </div>
    </div>
  );
}

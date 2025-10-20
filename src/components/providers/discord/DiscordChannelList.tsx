import { useState } from "preact/hooks";

import { useDiscordChannels } from "@/hooks/useChannels";
import { discordApi } from "@/lib/api/client";
import * as channelStyles from "@/styles/providers/channels.css";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

interface DiscordChannelListProps {
  guildId: string;
}

interface TestResult {
  success: boolean;
  message: string;
}

type TestResults = Record<string, TestResult>;

export default function DiscordChannelList({
  guildId,
}: Readonly<DiscordChannelListProps>) {
  const [testingChannels, setTestingChannels] = useState<Set<string>>(
    new Set()
  );
  const [testResults, setTestResults] = useState<TestResults>({});

  const { channels, loading: channelsLoading } = useDiscordChannels(guildId);

  const handleTestChannel = async (channelId: string, channelName: string) => {
    try {
      setTestingChannels((prev) => new Set(prev).add(channelId));

      const response = await discordApi["test-channel"].$post({
        json: {
          channelId,
          message: `🧪 Test message from HotBot - connection successful! (${new Date().toLocaleTimeString()})`,
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log("Successfully sent test message:", data);

      // Store test result
      setTestResults((prev) => ({
        ...prev,
        [channelId]: {
          success: true,
          message: `✅ Test message sent successfully to #${channelName}`,
        },
      }));
    } catch (err) {
      console.error("Failed to send test message:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send test message";

      setTestResults((prev) => ({
        ...prev,
        [channelId]: {
          success: false,
          message: `❌ Failed to send test message: ${errorMessage}`,
        },
      }));
    } finally {
      setTestingChannels((prev) => {
        const next = new Set(prev);
        next.delete(channelId);
        return next;
      });
    }
  };

  return (
    <div className={channelStyles.guildChannels}>
      <div className={channelStyles.guildChannelsTitle}>Channels</div>

      {channelsLoading && (
        <div className={modalStyles.loadingState}>
          <span>Loading channels...</span>
        </div>
      )}

      {!channelsLoading && channels.length > 0 && (
        <div>
          <div className={modalStyles.itemCount}>
            {channels.length} text channel{channels.length === 1 ? "" : "s"}
          </div>
          <div className={channelStyles.channelsContainer}>
            {channels.map((channel) => (
              <div key={channel.id} className={channelStyles.channelItem}>
                <div className={channelStyles.channelInfo}>
                  <span className={channelStyles.channelIcon}>#</span>
                  <span className={channelStyles.channelName}>
                    {channel.name}
                  </span>
                </div>
                <div className={channelStyles.channelActions}>
                  <button
                    className={
                      testingChannels.has(channel.id)
                        ? button({ color: "warning", size: "xs" })
                        : button({ color: "info", size: "xs" })
                    }
                    onClick={() =>
                      handleTestChannel(
                        channel.id,
                        channel.name || "Unknown Channel"
                      )
                    }
                    disabled={testingChannels.has(channel.id)}
                    title={`Send test message to #${channel.name}`}
                  >
                    {testingChannels.has(channel.id)
                      ? "Sending..."
                      : "Test message"}
                  </button>
                </div>
                {testResults[channel.id] && (
                  <div
                    className={
                      testResults[channel.id].success
                        ? channelStyles.testResultSuccess
                        : channelStyles.testResultError
                    }
                  >
                    {testResults[channel.id].message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!channelsLoading && channels.length === 0 && (
        <div className={modalStyles.emptyState}>
          <span>No text channels found</span>
        </div>
      )}
    </div>
  );
}

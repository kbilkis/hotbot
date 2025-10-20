import { useState, useEffect } from "preact/hooks";

import { slackApi } from "@/lib/api/client";
import * as channelStyles from "@/styles/providers/channels.css";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";
import type { SlackChannel } from "@/types/slack";

interface SlackChannelSectionProps {
  isConnected: boolean;
  teamName: string;
}

interface TestResult {
  success: boolean;
  message: string;
}

type TestResults = Record<string, TestResult>;

export default function SlackChannelSection({
  isConnected,
  teamName,
}: Readonly<SlackChannelSectionProps>) {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResults>({});

  // Fetch channels when connected
  useEffect(() => {
    if (isConnected) {
      fetchChannels();
    }
  }, [isConnected]);

  const fetchChannels = async () => {
    try {
      setChannelsLoading(true);
      setChannelsError(null);

      const response = await slackApi.channels.$get();
      const data = await response.json();

      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
      setChannels(data.data?.channels || []);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      setChannelsError(
        err instanceof Error ? err.message : "Failed to fetch channels"
      );
    } finally {
      setChannelsLoading(false);
    }
  };

  const handleTestChannel = async (channelId: string, channelName: string) => {
    try {
      setTestingChannel(channelId);

      const response = await slackApi["test-channel"].$post({
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
      setTestingChannel(null);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <>
      {teamName && (
        <div className={modalStyles.formGroup}>
          <div className={modalStyles.providerDisplay}>
            <span className={modalStyles.connectionStatusConnected}>
              ✓ Connected
            </span>
            <span className={modalStyles.teamName}>to {teamName}</span>
          </div>
        </div>
      )}

      <div className={modalStyles.formGroup}>
        <div className={modalStyles.formLabel}>Available Channels</div>
        <div>
          {channelsLoading && (
            <div className={modalStyles.loadingState}>
              <span>Loading channels...</span>
            </div>
          )}

          {channelsError && (
            <div className={modalStyles.errorState}>
              <span>Error loading channels: {channelsError}</span>
              <button
                className={button({ color: "danger", size: "xs" })}
                onClick={fetchChannels}
                disabled={channelsLoading}
              >
                Retry
              </button>
            </div>
          )}

          {!channelsLoading && !channelsError && channels.length > 0 && (
            <div>
              <div className={modalStyles.itemCount}>
                {channels.length} channels available
              </div>
              <div className={channelStyles.channelsContainerScrollable}>
                {channels.map((channel) => (
                  <div key={channel.id} className={channelStyles.channelItem}>
                    <div className={channelStyles.channelInfo}>
                      <span className={channelStyles.channelIcon}>
                        {channel.type === "private" ? "🔒" : "#"}
                      </span>
                      <div>
                        <span className={channelStyles.channelName}>
                          {channel.name}
                        </span>
                        {channel.memberCount && (
                          <div className={channelStyles.channelDescription}>
                            {channel.memberCount} members
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={channelStyles.channelActions}>
                      <button
                        className={
                          testingChannel === channel.id
                            ? button({ color: "warning", size: "xs" })
                            : button({ color: "info", size: "xs" })
                        }
                        onClick={() =>
                          handleTestChannel(channel.id, channel.name)
                        }
                        disabled={testingChannel === channel.id}
                        title={`Send test message to #${channel.name}`}
                      >
                        {testingChannel === channel.id
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

          {!channelsLoading && !channelsError && channels.length === 0 && (
            <div className={modalStyles.emptyState}>
              <span>No channels found</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

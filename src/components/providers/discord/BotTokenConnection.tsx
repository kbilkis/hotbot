import { useState } from "preact/hooks";

import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { discordApi } from "@/lib/api/client";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

interface BotTokenConnectionProps {
  onConnectionSuccess: (username: string) => void;
  onError: (error: string) => void;
}

export default function BotTokenConnection({
  onConnectionSuccess,
  onError,
}: Readonly<BotTokenConnectionProps>) {
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const { refetch } = useMessagingProviders();

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      onError("Access token is required");
      return;
    }

    try {
      setLoading(true);
      onError("");

      const response = await discordApi["connect-manual"].$post({
        json: {
          accessToken: accessToken.trim(),
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log("Successfully connected Discord:", data);

      refetch();
      setAccessToken("");
      onConnectionSuccess(data.userInfo?.username || "Discord User");
    } catch (err) {
      console.error("Failed to connect Discord:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect to Discord"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.manualConnectSection}>
      <div className={modalStyles.formGroup}>
        <label htmlFor="bot-token" className={modalStyles.formLabel}>
          Bot Token <span className={modalStyles.required}>*</span>
        </label>
        <div className={modalStyles.inputWithIcon}>
          <span className={modalStyles.inputIcon}>🤖</span>
          <input
            id="bot-token"
            type="password"
            className={modalStyles.formInput}
            placeholder="Bot token..."
            value={accessToken}
            onChange={(e) => setAccessToken(e.currentTarget.value)}
          />
        </div>
        <div className={modalStyles.helpSection}>
          <div className={modalStyles.helpContent}>
            <strong>How to get a bot token:</strong>
            <ol>
              <li>
                Go to{" "}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={modalStyles.helpLink}
                >
                  Discord Developer Portal
                </a>
              </li>
              <li>Create a new application or select existing</li>
              <li>Go to &quot;Bot&quot; section and create a bot</li>
              <li>Copy the bot token</li>
              <li>Invite bot to your server with appropriate permissions</li>
            </ol>
          </div>
        </div>
      </div>
      <button
        className={button({ color: "primary" })}
        onClick={handleConnect}
        disabled={!accessToken.trim() || loading}
      >
        {loading ? "Connecting..." : "Connect with Token"}
      </button>
    </div>
  );
}

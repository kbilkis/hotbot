import { useState } from "preact/hooks";

import { discordApi } from "@/lib/api/client";
import * as channelStyles from "@/styles/providers/channels.css";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

interface WebhookConnectionProps {
  onClose: () => void;
  onError: (error: string) => void;
}

export default function WebhookConnection({
  onClose,
  onError,
}: Readonly<WebhookConnectionProps>) {
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});

  const handleConnect = async () => {
    if (!webhookUrl.trim()) {
      onError("Webhook URL is required");
      return;
    }

    try {
      setLoading(true);
      onError("");

      console.log("Connecting Discord webhook:", { webhookUrl });
      // For webhook connections, we don't store in the database
      // This is handled differently in the scheduling logic
      onClose();
    } catch (err) {
      console.error("Failed to connect Discord:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect to Discord"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (webhookUrl: string, guildName: string) => {
    try {
      setTestingWebhook(webhookUrl);
      onError("");

      const response = await discordApi["test-webhook"].$post({
        json: {
          webhookUrl,
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
        [webhookUrl]: {
          success: true,
          message: `✅ Test message sent successfully to ${guildName}`,
        },
      }));
    } catch (err) {
      console.error("Failed to send test message:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send test message";

      setTestResults((prev) => ({
        ...prev,
        [webhookUrl]: {
          success: false,
          message: `❌ Failed to send test message: ${errorMessage}`,
        },
      }));
    } finally {
      setTestingWebhook(null);
    }
  };

  return (
    <div className={channelStyles.webhookConnectSection}>
      <div className={channelStyles.discordSetupInfo}>
        <h3>How to set up Discord webhook:</h3>
        <ol>
          <li>Go to your Discord server channel</li>
          <li>
            Click &quot;Edit Channel&quot; → &quot;Integrations&quot; →
            &quot;Webhooks&quot;
          </li>
          <li>Click &quot;New Webhook&quot; and configure it</li>
          <li>Copy the webhook URL and paste it below</li>
        </ol>
      </div>

      <div className={modalStyles.formGroup}>
        <label htmlFor="webhook-url" className={modalStyles.formLabel}>
          Webhook URL <span className={modalStyles.required}>*</span>
        </label>
        <div className={modalStyles.inputWithIcon}>
          <span className={modalStyles.inputIcon}>🔗</span>
          <input
            id="webhook-url"
            type="url"
            className={modalStyles.formInput}
            placeholder="https://discord.com/api/webhooks/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.currentTarget.value)}
          />
        </div>
        <small className={modalStyles.formHelp}>
          Create a webhook URL in your Discord server settings
        </small>
      </div>

      <button
        className={button({ color: "discord" })}
        onClick={handleConnect}
        disabled={!webhookUrl.trim() || loading}
      >
        {loading ? "Connecting..." : "Connect with Webhook"}
      </button>

      {webhookUrl.trim() && (
        <button
          className={button({ color: "info", size: "xs" })}
          onClick={() => handleTestWebhook(webhookUrl, "Discord Server")}
          disabled={testingWebhook === webhookUrl}
        >
          {testingWebhook === webhookUrl ? "Testing..." : "Test Webhook"}
        </button>
      )}

      {testResults[webhookUrl] && (
        <div
          className={
            testResults[webhookUrl].success
              ? channelStyles.testResultSuccess
              : channelStyles.testResultError
          }
        >
          {testResults[webhookUrl].message}
        </div>
      )}
    </div>
  );
}

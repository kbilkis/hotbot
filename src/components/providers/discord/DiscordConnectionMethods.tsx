import { useState } from "preact/hooks";

import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

import BotTokenConnection from "./BotTokenConnection";
import ConnectionMethodTabs from "./ConnectionMethodTabs";
import OAuthConnection from "./OAuthConnection";

interface DiscordConnectionMethodsProps {
  onConnectionSuccess: (username: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function DiscordConnectionMethods({
  onConnectionSuccess,
  onError,
}: // onClose,
Readonly<DiscordConnectionMethodsProps>) {
  const [connectionMethod, setConnectionMethod] = useState<
    "manual" | "webhook"
  >("manual");
  const [showManualOption, setShowManualOption] = useState(false);

  const handleBackToOAuth = () => {
    setShowManualOption(false);
    onError("");
  };

  return (
    <div className={modalStyles.formGroup}>
      {/* Primary OAuth connection - always visible */}
      <OAuthConnection onError={onError} />

      {/* Alternative connection options - hidden by default */}
      <div className={modalStyles.alternativeSection}>
        {showManualOption ? (
          <div className={modalStyles.manualConnectionWrapper}>
            <div className={modalStyles.alternativeHeader}>
              <span>Alternative Connection Methods</span>
              <button
                className={button({ color: "ghost", size: "xs" })}
                onClick={handleBackToOAuth}
              >
                ← Back to OAuth
              </button>
            </div>

            <ConnectionMethodTabs
              activeMethod={connectionMethod}
              onMethodChange={setConnectionMethod}
              onError={onError}
            />

            {connectionMethod === "manual" && (
              <BotTokenConnection
                onConnectionSuccess={onConnectionSuccess}
                onError={onError}
              />
            )}

            {/* {connectionMethod === "webhook" && (
              <WebhookConnection onClose={onClose} onError={onError} />
            )} */}
          </div>
        ) : (
          <button
            className={button({
              color: "ghost",
              size: "sm",
              alternative: true,
            })}
            onClick={() => {
              setShowManualOption(true);
              setConnectionMethod("manual");
            }}
          >
            Use bot token or webhook instead
          </button>
        )}
      </div>
    </div>
  );
}

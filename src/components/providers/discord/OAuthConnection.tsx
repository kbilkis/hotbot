import { useState } from "preact/hooks";

import { discordApi } from "@/lib/api/client";
import * as modalStyles from "@/styles/providers/modal.css";
import { button } from "@/styles/theme/index.css";

interface OAuthConnectionProps {
  onError: (error: string) => void;
}

export default function OAuthConnection({
  onError,
}: Readonly<OAuthConnectionProps>) {
  const [loading, setLoading] = useState(false);

  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      onError("");

      // Get the current URL for redirect
      const redirectUri = `${globalThis.window.location.origin}/auth/callback/discord`;

      // Get OAuth authorization URL
      const response = await discordApi["auth-url"].$post({
        json: {
          redirectUri,
          scopes: ["bot", "applications.commands"],
          permissions: "68608", // VIEW_CHANNEL + SEND_MESSAGES + READ_MESSAGE_HISTORY
        },
      });

      const data = await response.json();
      if (data.success) {
        // Redirect to Discord OAuth page
        globalThis.window.location.href = data.authUrl;
      } else {
        const errorMessage =
          data.message || data.error || `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Failed to initiate Discord OAuth:", err);
      onError(
        err instanceof Error ? err.message : "Failed to connect to Discord"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className={button({ color: "discord" })}
        onClick={handleOAuthConnect}
        disabled={loading}
      >
        {loading ? (
          <>
            Redirecting to{" "}
            <img
              src="/images/providers/discord/Discord-Logo-White.svg"
              alt="Discord"
              className={modalStyles.oauthButtonLogo}
            />
          </>
        ) : (
          <>
            Sign in with{" "}
            <img
              src="/images/providers/discord/Discord-Logo-White.svg"
              alt="Discord"
              className={modalStyles.oauthButtonLogo}
            />
          </>
        )}
      </button>
      <small className={modalStyles.formHelp}>
        {`🔒 Secure OAuth 2.0 authorization - you'll be redirected to
        Discord to grant server access permissions.`}
      </small>
    </div>
  );
}

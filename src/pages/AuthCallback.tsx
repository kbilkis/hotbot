import { useState, useEffect } from "preact/hooks";
import { useRoute, useLocation } from "preact-iso";

import { useGitProviders } from "@/hooks/useGitProviders";
import { useMessagingProviders } from "@/hooks/useMessagingProviders";

import * as authStyles from "../styles/auth/auth.css";
import { contentCard } from "../styles/layout/layout.css";
import { utils } from "../styles/theme/index.css";

export default function AuthCallback() {
  const { params, query } = useRoute();
  const location = useLocation();
  const provider = params.provider;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const { refetch: refetchMessagingProviders } = useMessagingProviders();
  const { refetch: refetchGitProviders } = useGitProviders();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = query.code;
        const state = query.state;
        const error = query.error;

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error("Missing authorization code or state");
        }

        if (!provider) {
          throw new Error("Missing provider parameter");
        }

        // Determine provider type and API endpoint
        const isMessagingProvider = ["slack", "teams", "discord"].includes(
          provider
        );
        const apiEndpoint = isMessagingProvider
          ? `/api/providers/messaging/${provider}/exchange-token`
          : `/api/providers/git/${provider}/exchange-token`;

        // Exchange code for token AND store in database (single API call)
        const redirectUri = `${globalThis.window.location.origin}/auth/callback/${provider}`;
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirectUri,
            state,
          }),
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

        const result = await response.json();

        // The exchange-token endpoint now handles both token exchange AND database storage
        console.log("Successfully connected provider:", result);

        // Invalidate SWR cache to refresh provider data
        if (isMessagingProvider) {
          refetchMessagingProviders();
        } else {
          refetchGitProviders();
        }

        setStatus("success");
        setMessage(`Successfully connected ${provider}!`);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          location.route("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("OAuth callback failed:", err);
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Failed to complete authorization"
        );

        // Redirect to dashboard after a delay even on error
        setTimeout(() => {
          location.route("/dashboard");
        }, 3000);
      }
    };

    handleCallback();
  }, [provider, query]);

  return (
    <div className={contentCard({ size: "fullPage" })}>
      {status === "loading" && (
        <>
          <div className={utils.spinnerLarge}></div>
          <h2>Connecting your account...</h2>
          <p className={authStyles.loadingText}>
            Please wait while we complete the authorization process.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className={authStyles.statusIcon}>✅</div>
          <h2>Successfully Connected!</h2>
          <p className={authStyles.successText}>{message}</p>
          <p>Redirecting you to the dashboard...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className={authStyles.statusIcon}>❌</div>
          <h2>Connection Failed</h2>
          <p className={authStyles.errorText}>{message}</p>
          <p>Redirecting you back to the dashboard...</p>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { mutate } from "swr";

export default function AuthCallback(): React.ReactElement {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

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
        const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
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
        const cacheKey = isMessagingProvider
          ? "/api/providers/messaging"
          : "/api/providers/git";
        await mutate(cacheKey);

        setStatus("success");
        setMessage(`Successfully connected ${provider}!`);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
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
          navigate("/dashboard");
        }, 3000);
      }
    };

    handleCallback();
  }, [provider, searchParams, navigate]);

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        {status === "loading" && (
          <>
            <div className="loading-spinner">⏳</div>
            <h2>Connecting your account...</h2>
            <p>Please wait while we complete the authorization process.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="success-icon">✅</div>
            <h2>Successfully Connected!</h2>
            <p>{message}</p>
            <p>Redirecting you to the dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="error-icon">❌</div>
            <h2>Connection Failed</h2>
            <p>{message}</p>
            <p>Redirecting you back to the dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}

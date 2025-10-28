import { useEffect, useState } from "preact/hooks";

import { githubApi } from "@/lib/api/client";
import { contentCard } from "@/styles/layout/layout.css";
import { button } from "@/styles/theme/components.css";
import { utils } from "@/styles/theme/index.css";

export default function GitHubAppCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters from GitHub App installation
        const urlParams = new URLSearchParams(globalThis.location.search);
        const installationId = urlParams.get("installation_id");
        const setupAction = urlParams.get("setup_action");

        if (!installationId) {
          throw new Error("No installation ID received from GitHub");
        }

        if (setupAction !== "install") {
          throw new Error("GitHub App installation was not completed");
        }

        // Connect via GitHub App installation using typed RPC client
        const response = await githubApi.app.connect.$post({
          json: {
            installationId,
          },
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || data.error || "Failed to connect GitHub App"
          );
        }

        setStatus("success");
        setMessage(
          "Successfully connected via GitHub App! Redirecting to dashboard..."
        );
      } catch (error) {
        console.error("GitHub App callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    };

    handleCallback();
  }, []);

  // Handle redirect on success with proper cleanup
  useEffect(() => {
    if (status === "success") {
      const timeoutId = setTimeout(() => {
        globalThis.location.href = "/dashboard";
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [status]);

  return (
    <div className={contentCard({ size: "fullPage" })}>
      {status === "loading" && (
        <>
          <div className={utils.spinnerLarge}></div>
          <h2>Connecting GitHub App...</h2>
          <p>Processing your GitHub App installation...</p>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
          <h2>GitHub App Connected!</h2>
          <p>{message}</p>
          <div>
            <p>You now have access to:</p>
            <ul style={{ textAlign: "left", marginTop: "16px" }}>
              <li>Real-time webhook notifications</li>
              <li>Higher API rate limits</li>
              <li>Organization-wide repository access</li>
            </ul>
          </div>
          <p>Redirecting you to the dashboard...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
          <h2>Connection Failed</h2>
          <p>{message}</p>
          <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
            <a href="/dashboard" className={button({ color: "primary" })}>
              Go to Dashboard
            </a>
            <a href="/dashboard" className={button({ color: "secondary" })}>
              Try Again
            </a>
          </div>
        </>
      )}
    </div>
  );
}

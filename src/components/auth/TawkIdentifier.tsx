import { useAuth, useUser } from "@clerk/clerk-react";
import * as Sentry from "@sentry/react";
import { useEffect } from "preact/hooks";

import { tawkApi } from "@/lib/api/client";

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      setAttributes?: (
        attributes: {
          name?: string;
          email?: string;
          userId?: string;
          hash?: string;
        },
        callback?: (error?: unknown) => void
      ) => void;
    };
  }
}

export default function TawkIdentifier() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // Skip if running on server (SSR)
    if (globalThis.window === undefined || !!import.meta.env?.DEV) return;

    const setTawkUser = async () => {
      // Simple polling to wait for Tawk.to to load
      let attempts = 0;
      const maxAttempts = 50; // 10 seconds max wait

      while (
        !globalThis.window.Tawk_API?.setAttributes &&
        attempts < maxAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }

      if (!globalThis.window.Tawk_API?.setAttributes) {
        Sentry.captureMessage(
          "Tawk.to failed to load after 10 seconds",
          "error"
        );
        console.warn("Tawk.to failed to load after 10 seconds");
        return;
      }

      if (isSignedIn && user) {
        const userName =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username || user.primaryEmailAddress?.emailAddress || "User";

        const userEmail = user.primaryEmailAddress?.emailAddress;

        if (userEmail) {
          // Try to get secure hash
          const response = await tawkApi.hash.$post();

          const data = await response.json();
          if (data.success) {
            // Secure mode with hash
            globalThis.window.Tawk_API.setAttributes({
              name: userName,
              email: userEmail,
              userId: data.userId,
              hash: data.hash,
            });
            return;
          }
        }
      }
    };

    setTawkUser();
  }, [isSignedIn, user]);

  return null;
}

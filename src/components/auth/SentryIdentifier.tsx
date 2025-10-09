import { useAuth, useUser } from "@clerk/clerk-react";
import * as Sentry from "@sentry/react";
import { useEffect } from "preact/hooks";

export default function SentryIdentifier() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Identify the user with Sentry
      Sentry.setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username || user.primaryEmailAddress?.emailAddress,
      });

      // Set additional context
      Sentry.setTag("user_mode", "authenticated");
      Sentry.setContext("user_details", {
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
      });
    } else {
      // Clear user context when signed out
      Sentry.setUser(null);
      Sentry.setTag("user_mode", "anonymous");
    }
  }, [isSignedIn, user]);

  // This component doesn't render anything
  return null;
}

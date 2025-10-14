import { useAuth, useClerk } from "@clerk/clerk-react";

import * as authStyles from "../../styles/auth/auth.css";

interface ProtectedRouteProps {
  children: preact.ComponentChildren;
  fallback?: preact.ComponentChildren;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();

  if (!isLoaded) {
    return (
      <div className={authStyles.authCallbackContainer}>
        <div className={authStyles.loadingSpinner}>⏳</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      fallback || (
        <div className={authStyles.authCallbackContainer}>
          <div
            className={`${authStyles.authCallbackContent} ${authStyles.mobileOptimized}`}
          >
            <h2>Authentication Required</h2>
            <p>Please sign in to access this page.</p>
            <button
              className={authStyles.authButtonSignIn}
              onClick={() => clerk.openSignIn()}
            >
              Sign In
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

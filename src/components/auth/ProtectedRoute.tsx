import { useAuth, useClerk } from "@clerk/clerk-react";

import { contentCard } from "@/styles/layout/layout.css";
import { button, utils } from "@/styles/theme/index.css";

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
      <div className={contentCard({ size: "fullPage" })}>
        <div className={utils.spinnerLarge}></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      fallback || (
        <div className={contentCard()}>
          <h2>Authentication Required</h2>
          <p>Please sign in to access this page.</p>
          <button
            className={button({ color: "primary", size: "md" })}
            onClick={() => clerk.openSignIn()}
          >
            Sign In
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
}

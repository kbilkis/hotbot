import { useAuth, useClerk } from "@clerk/clerk-react";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      fallback || (
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to access this page.</p>
          <button
            className="auth-button sign-in"
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

import { useAuth } from "@clerk/clerk-react";
import React from "react";
import { Link } from "react-router-dom";

import { useGitProviders } from "@/hooks/useGitProviders";
import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { useSchedules } from "@/hooks/useSchedules";
import { useSubscription } from "@/hooks/useSubscription";

import AuthButton from "../auth/AuthButton";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { isLoaded, isSignedIn } = useAuth();

  // Preload data if user is signed in for faster dashboard loads
  // Only fetch if user is loaded and signed in to avoid unnecessary API calls
  const shouldFetch = isLoaded && isSignedIn;
  useGitProviders(shouldFetch);
  useMessagingProviders(shouldFetch);
  useSchedules(shouldFetch);
  useSubscription(shouldFetch);

  return (
    <div className="app-layout">
      <header>
        <nav>
          <div className="logo">
            <Link to="/">
              <img
                src="/images/hotbot-l.svg"
                alt="HotBot"
                className="logo-image"
              />
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            {isSignedIn && <Link to="/subscription">Subscription</Link>}
            <AuthButton />
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer>
        <div className="container">
          <p>&copy; 2025 HotBot. Never wait for a code review again.</p>
        </div>
      </footer>
    </div>
  );
}

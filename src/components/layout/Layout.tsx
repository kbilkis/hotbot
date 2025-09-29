import { useAuth } from "@clerk/clerk-react";

import { useGitProviders } from "@/hooks/useGitProviders";
import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { useSchedules } from "@/hooks/useSchedules";
import { useSubscription } from "@/hooks/useSubscription";

import AuthButton from "../auth/AuthButton";

export default function Layout({
  children,
}: {
  children: preact.ComponentChildren;
}) {
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
            <a href="/">
              <img
                src="/images/hotbot-l.svg"
                alt="HotBot"
                className="logo-image"
              />
            </a>
          </div>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/dashboard">Dashboard</a>
            {isSignedIn && <a href="/subscription">Subscription</a>}
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

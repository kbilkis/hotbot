import { useAuth } from "@clerk/clerk-react";

import { useGitProviders } from "@/hooks/useGitProviders";
import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { useSchedules } from "@/hooks/useSchedules";
import { useSubscription } from "@/hooks/useSubscription";
import * as styles from "@/styles/layout/layout.css";

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
    <div className={styles.appLayout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <a href="/" className={styles.logoLink}>
              <img
                src="/images/hotbot-l.svg"
                width="191"
                height="40"
                alt="HotBot"
                className={styles.logoImage}
              />
            </a>
          </div>
          <div className={styles.navLinks}>
            <a href="/" className={styles.navLink}>
              Home
            </a>
            <a href="/dashboard" className={styles.navLink}>
              Dashboard
            </a>
            {isSignedIn && (
              <a href="/subscription" className={styles.navLink}>
                Subscription
              </a>
            )}
            <AuthButton />
          </div>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <p>&copy; 2025 HotBot. Never wait for a code review again.</p>
        </div>
      </footer>
    </div>
  );
}

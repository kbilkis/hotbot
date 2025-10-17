import { useAuth, useUser, useClerk } from "@clerk/clerk-react";

import * as authStyles from "@/styles/auth/auth.css";
import { button } from "@/styles/theme/index.css";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  if (!isLoaded) {
    return (
      <button className={button({ color: "primary", size: "sm" })} disabled>
        Loading...
      </button>
    );
  }

  if (isSignedIn) {
    return (
      <div className={authStyles.authSection}>
        <span className={authStyles.userEmail}>
          {user?.primaryEmailAddress?.emailAddress}
        </span>
        <button
          className={button({ color: "danger", size: "sm" })}
          onClick={() => clerk.signOut()}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      className={button({ color: "primary", size: "sm" })}
      onClick={() => clerk.openSignIn()}
    >
      Sign In
    </button>
  );
}

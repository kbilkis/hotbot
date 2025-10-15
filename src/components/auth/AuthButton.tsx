import { useAuth, useUser, useClerk } from "@clerk/clerk-react";

import * as authStyles from "@/styles/auth/auth.css";
import { buttonStyles } from "@/styles/theme/index.css";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  if (!isLoaded) {
    return (
      <button className={buttonStyles.secondary} disabled>
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
        <button className={buttonStyles.danger} onClick={() => clerk.signOut()}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button className={buttonStyles.primary} onClick={() => clerk.openSignIn()}>
      Sign In
    </button>
  );
}

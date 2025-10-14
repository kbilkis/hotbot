import { useAuth, useUser, useClerk } from "@clerk/clerk-react";

import * as authStyles from "../../styles/auth/auth.css";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  if (!isLoaded) {
    return (
      <button className={authStyles.authButtonLoading} disabled>
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
          className={authStyles.authButtonSignOut}
          onClick={() => clerk.signOut()}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      className={authStyles.authButtonSignIn}
      onClick={() => clerk.openSignIn()}
    >
      Sign In
    </button>
  );
}

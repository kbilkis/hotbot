import { useAuth, useUser, useClerk } from "@clerk/clerk-react";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  if (!isLoaded) {
    return (
      <button className="auth-button loading" disabled>
        Loading...
      </button>
    );
  }

  if (isSignedIn) {
    return (
      <div className="auth-section">
        <span className="user-email">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
        <button
          className="auth-button sign-out"
          onClick={() => clerk.signOut()}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button className="auth-button sign-in" onClick={() => clerk.openSignIn()}>
      Sign In
    </button>
  );
}

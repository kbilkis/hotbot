import { useClerk } from "../../lib/auth/ClerkProvider";

export default function AuthButton() {
  const { isLoaded, isSignedIn, user, signIn, signOut } = useClerk();

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
        <button className="auth-button sign-out" onClick={signOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button className="auth-button sign-in" onClick={signIn}>
      Sign In
    </button>
  );
}

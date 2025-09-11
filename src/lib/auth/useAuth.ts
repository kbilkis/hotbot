import { useEffect, useState } from "react";
import { useClerk } from "./ClerkProvider";

interface User {
  id: number;
  email: string;
  clerkId: string;
}

export function useAuth() {
  const { clerk, isLoaded, isSignedIn } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncSession = async () => {
      if (!isLoaded) return;

      setIsLoading(true);

      try {
        if (isSignedIn && clerk.session) {
          // Get session token
          const token = await clerk.session.getToken();

          if (token) {
            // Sync session with backend
            const response = await fetch("/api/auth/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sessionToken: token }),
            });

            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
            } else {
              console.error("Failed to sync session with backend");
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session sync error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    syncSession();
  }, [isLoaded, isSignedIn, clerk.session]);

  return {
    user,
    isLoading: isLoading || !isLoaded,
    isAuthenticated: !!user && isSignedIn,
  };
}

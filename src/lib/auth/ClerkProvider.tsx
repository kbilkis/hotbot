import React, { createContext, useContext, useEffect, useState } from "react";
import { Clerk } from "@clerk/clerk-js";

// Initialize Clerk
const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

interface ClerkContextType {
  clerk: Clerk;
  user: any;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const ClerkContext = createContext<ClerkContextType | null>(null);

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const initializeClerk = async () => {
      try {
        await clerk.load();
        setIsLoaded(true);
        setUser(clerk.user);
        setIsSignedIn(!!clerk.user);

        // Expose Clerk globally for API client
        (window as any).__clerk = clerk;

        // Sync session with backend if user is already logged in
        if (clerk.user && clerk.session) {
          syncSessionWithBackend();
        }

        // Listen for auth state changes
        clerk.addListener((event: any) => {
          if (
            event.type === "user:updated" ||
            event.type === "session:created" ||
            event.type === "session:removed"
          ) {
            setUser(clerk.user);
            setIsSignedIn(!!clerk.user);

            // Sync with backend when session is created
            if (event.type === "session:created" && clerk.session) {
              syncSessionWithBackend();
            }
          }
        });
      } catch (error) {
        console.error("Failed to initialize Clerk:", error);
        setIsLoaded(true);
      }
    };

    const syncSessionWithBackend = async () => {
      try {
        if (clerk.session) {
          const token = await clerk.session.getToken();
          if (token) {
            const response = await fetch("/api/auth/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sessionToken: token }),
            });

            if (response.ok) {
              const data = await response.json();
              console.log("User synced with backend:", data.user);
            } else {
              console.error("Failed to sync session with backend");
            }
          }
        }
      } catch (error) {
        console.error("Session sync error:", error);
      }
    };

    initializeClerk();
  }, []);

  const signIn = async () => {
    try {
      await clerk.openSignIn();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const signOut = async () => {
    try {
      await clerk.signOut();
      // Clear session cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value = {
    clerk,
    user,
    isLoaded,
    isSignedIn,
    signIn,
    signOut,
  };

  return (
    <ClerkContext.Provider value={value}>{children}</ClerkContext.Provider>
  );
}

export function useClerk() {
  const context = useContext(ClerkContext);
  if (!context) {
    throw new Error("useClerk must be used within a ClerkProvider");
  }
  return context;
}

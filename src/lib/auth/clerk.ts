import { getAuth } from "@hono/clerk-auth";
import type { ClerkAuthVariables } from "@hono/clerk-auth";
import { Context, Next } from "hono";

import { upsertUser, getUserByClerkId } from "../database/queries/users";
import type { User as UserInternal } from "../database/schema";

type ClerkClient = ClerkAuthVariables["clerk"];
type ClerkUser = Awaited<ReturnType<ClerkClient["users"]["getUser"]>>;

// Get user by ID from Clerk using the context clerkClient
async function getClerkUserById(
  userId: string,
  c: Context
): Promise<ClerkUser> {
  try {
    const clerkClient: ClerkClient = c.get("clerk");
    return await clerkClient.users.getUser(userId);
  } catch (error) {
    console.error("Clerk user fetch error:", error);
    throw error;
  }
}

// Create user in database (only called when user doesn't exist)
async function createUserInDatabase(clerkUser: ClerkUser) {
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not found in Clerk data");
  }

  console.log("🔄 Creating user in database:", {
    clerkId: clerkUser.id,
    email,
  });
  const result = await upsertUser({
    clerkId: clerkUser.id,
    email,
  });
  console.log("✅ User created successfully:", result);
  return result;
}

// Custom middleware to ensure user exists in our database
export function requireAuth() {
  return async (c: Context, next: Next) => {
    try {
      // Get auth from Clerk middleware (must be used after clerkMiddleware)
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: "Authentication required" }, 401);
      }

      // Try to get user from our database first
      let dbUser = await getUserByClerkId(auth.userId);

      if (!dbUser) {
        // User doesn't exist in our DB, create them
        console.log("User not found in DB, creating...", auth.userId);

        // Get user details from Clerk
        // Since we're behind clerkMiddleware, the user should exist in Clerk
        const clerkUser = await getClerkUserById(auth.userId, c);
        // This should rarely happen, but handle gracefully if it does
        if (!clerkUser) {
          console.error(
            "User authenticated by Clerk but not found in Clerk API:",
            auth.userId
          );
          return c.json({ error: "Authentication error" }, 500);
        }

        // Create user in our database
        dbUser = await createUserInDatabase(clerkUser);
      }

      // Add user information to context
      c.set("user", dbUser);
      c.set("userId", dbUser.id);
      c.set("clerkUserId", auth.userId);
      await next();
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return c.json({ error: "Authentication failed" }, 401);
    }
  };
}

// Helper to get current user from context
export function getCurrentUser(c: Context) {
  return c.get("user") as UserInternal;
}

// Helper to get current user ID from context
export function getCurrentUserId(c: Context) {
  return c.get("userId") as string;
}

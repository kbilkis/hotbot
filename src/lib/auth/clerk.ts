import { Context, Next } from "hono";
import { getAuth } from "@hono/clerk-auth";
import { upsertUser, getUserByClerkId } from "../database/queries/users";
import type { User } from "../database/schema";

// Get user by ID from Clerk
export async function getClerkUserById(userId: string): Promise<any> {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not configured");
  }

  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Clerk user: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Clerk user fetch error:", error);
    throw error;
  }
}

// Create user in database (only called when user doesn't exist)
async function createUserInDatabase(clerkUser: any) {
  const email = clerkUser.email_addresses?.[0]?.email_address;

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

// Define the context variables that our auth middleware adds
export type AuthVariables = {
  user: User;
  clerkUserId: string;
};

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
        const clerkUser = await getClerkUserById(auth.userId);

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
  return c.get("user") as User;
}

// Helper to get current user ID from context
export function getCurrentUserId(c: Context) {
  return c.get("userId") as number;
}

import { Context, Next } from "hono";
import { upsertUser } from "../database/queries/users.js";

// Clerk session token verification
export async function verifyClerkToken(token: string): Promise<any> {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not configured");
  }

  try {
    // Use the correct Clerk API endpoint for JWT verification
    const response = await fetch(
      `https://api.clerk.com/v1/sessions/${token}/verify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Clerk verification failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Clerk token verification error:", error);
    throw error;
  }
}

// Get user from Clerk session
export async function getClerkUser(sessionId: string): Promise<any> {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not configured");
  }

  try {
    const response = await fetch(
      `https://api.clerk.com/v1/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get Clerk session: ${response.status}`);
    }

    const session = await response.json();

    // Get user details
    const userResponse = await fetch(
      `https://api.clerk.com/v1/users/${session.user_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`Failed to get Clerk user: ${userResponse.status}`);
    }

    return await userResponse.json();
  } catch (error) {
    console.error("Clerk user fetch error:", error);
    throw error;
  }
}

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

// Create or update user in database
export async function createOrUpdateUser(clerkUser: any) {
  const email = clerkUser.email_addresses?.[0]?.email_address;

  if (!email) {
    throw new Error("User email not found in Clerk data");
  }

  try {
    console.log("🔄 Upserting user:", { clerkId: clerkUser.id, email });
    const result = await upsertUser({
      clerkId: clerkUser.id,
      email,
    });
    console.log("✅ User upserted successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Database user creation/update error:", error);
    throw error;
  }
}

// Authentication middleware for protected routes
export function clerkMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      // Get session token from Authorization header
      const authHeader = c.req.header("Authorization");
      const sessionToken = authHeader?.replace("Bearer ", "");

      if (!sessionToken) {
        return c.json({ error: "Authentication required" }, 401);
      }

      // Verify the session token with Clerk
      const sessionData = await verifyClerkToken(sessionToken);

      if (!sessionData || !sessionData.user_id) {
        return c.json({ error: "Invalid session" }, 401);
      }

      // Get user details from Clerk
      const clerkUser = await getClerkUserById(sessionData.user_id);

      if (!clerkUser) {
        return c.json({ error: "User not found" }, 401);
      }

      // Create or update user in our database
      const dbUser = await createOrUpdateUser(clerkUser);

      // Add user information to context
      c.set("user", dbUser);
      c.set("clerkUser", clerkUser);
      c.set("userId", dbUser.id);

      await next();
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return c.json({ error: "Authentication failed" }, 401);
    }
  };
}

// Helper to get current user from context
export function getCurrentUser(c: Context) {
  return c.get("user");
}

// Helper to get current user ID from context
export function getCurrentUserId(c: Context): number {
  return c.get("userId");
}

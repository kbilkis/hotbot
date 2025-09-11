import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createOrUpdateUser, getClerkUserById } from "../../lib/auth/clerk.js";

const app = new Hono();

// POST /api/auth/session - Verify and create session
app.post("/session", async (c) => {
  try {
    console.log("🔐 Session creation request received");
    const body = await c.req.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      console.log("❌ No session token provided");
      return c.json({ error: "Session token required" }, 400);
    }

    console.log("🔍 Decoding session token...");
    // Decode the JWT token to get user ID (basic decode, not verification)
    const tokenParts = sessionToken.split(".");
    if (tokenParts.length !== 3) {
      console.log("❌ Invalid JWT token format");
      return c.json({ error: "Invalid session token format" }, 401);
    }

    let payload;
    try {
      payload = JSON.parse(atob(tokenParts[1]));
    } catch (error) {
      console.log("❌ Failed to decode JWT payload");
      return c.json({ error: "Invalid session token" }, 401);
    }

    const userId = payload.sub;
    if (!userId) {
      console.log("❌ No user ID in token");
      return c.json({ error: "Invalid session token" }, 401);
    }

    console.log("🔍 Getting user details from Clerk...");
    // Get user details from Clerk
    const clerkUser = await getClerkUserById(userId);

    if (!clerkUser) {
      console.log("❌ Invalid session token");
      return c.json({ error: "Invalid session token" }, 401);
    }

    console.log(
      "👤 Clerk user found:",
      clerkUser.id,
      clerkUser.email_addresses?.[0]?.email_address
    );

    // Create or update user in our database
    console.log("💾 Creating/updating user in database...");
    const dbUser = await createOrUpdateUser(clerkUser);
    console.log("✅ Database user created/updated:", dbUser);

    // Set session cookie
    setCookie(c, "__session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return c.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        clerkId: dbUser.clerkId,
      },
      success: true,
    });
  } catch (error) {
    console.error("❌ Session creation error:", error);
    return c.json({ error: "Failed to create session" }, 500);
  }
});

// GET /api/auth/me - Get current user
app.get("/me", async (c) => {
  try {
    const sessionToken = getCookie(c, "__session");

    if (!sessionToken) {
      return c.json({ error: "No session found" }, 401);
    }

    // Decode the JWT token to get user ID
    const tokenParts = sessionToken.split(".");
    if (tokenParts.length !== 3) {
      return c.json({ error: "Invalid session token format" }, 401);
    }

    let payload;
    try {
      payload = JSON.parse(atob(tokenParts[1]));
    } catch (error) {
      return c.json({ error: "Invalid session token" }, 401);
    }

    const userId = payload.sub;
    if (!userId) {
      return c.json({ error: "Invalid session token" }, 401);
    }

    // Get user details from Clerk
    const clerkUser = await getClerkUserById(userId);

    if (!clerkUser) {
      return c.json({ error: "User not found" }, 401);
    }

    // Update user in our database
    const dbUser = await createOrUpdateUser(clerkUser);

    return c.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        clerkId: dbUser.clerkId,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// POST /api/auth/logout - Logout user
app.post("/logout", (c) => {
  try {
    // Clear session cookie
    deleteCookie(c, "__session");

    return c.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ error: "Failed to logout" }, 500);
  }
});

export default app;

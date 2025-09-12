import { Hono } from "hono";
import { getCurrentUser } from "../lib/auth/clerk";

const app = new Hono();

// GET /api/auth/me - Get current user (requires authentication)
app.get("/me", async (c) => {
  try {
    // This endpoint requires authentication, so user will be in context
    const user = getCurrentUser(c);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        clerkId: user.clerkId,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

export default app;

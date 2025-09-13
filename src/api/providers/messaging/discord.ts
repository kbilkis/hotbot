// Discord messaging provider API routes

import { Hono } from "hono";

import { ErrorResponseSchema } from "../../../lib/validation/provider-schemas";

const app = new Hono();

// Placeholder for future Discord OAuth implementation
app.post("/auth-url", async (c) => {
  return c.json(
    ErrorResponseSchema({
      error: "Not implemented",
      message: "Discord integration is not yet implemented",
    }),
    501
  );
});

export default app;

// Microsoft Teams messaging provider API routes

import { Hono } from "hono";

import {
  ErrorResponseSchema,
  SuccessResponseSchema,
} from "../../../lib/validation/provider-schemas";

const app = new Hono();

// POST /connect - Initiate Teams connection
app.post("/connect", async (c) => {
  try {
    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "Initiating connection to Microsoft Teams",
        data: {
          provider: "teams",
          authEndpoint: "/api/providers/messaging/teams/auth-url",
          implemented: false,
        },
      })
    );
  } catch (error) {
    console.error("Teams connection initiation failed:", error);
    return c.json(
      ErrorResponseSchema({
        error: "Connection failed",
        message: "Failed to initiate Teams connection",
      }),
      500
    );
  }
});

// Placeholder for future Teams OAuth implementation
app.post("/auth-url", async (c) => {
  return c.json(
    ErrorResponseSchema({
      error: "Not implemented",
      message: "Microsoft Teams integration is not yet implemented",
    }),
    501
  );
});

export default app;

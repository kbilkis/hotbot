import { clerkMiddleware } from "@hono/clerk-auth";
import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";

import { TierLimitError } from "@/lib/access-control/middleware";

import { requireAuth } from "../lib/auth/clerk";

import providersRoutes from "./providers";
import schedulesRoutes from "./schedules";
import subscriptionsRoutes from "./subscriptions";
import usageRoutes from "./usage";
import webhooksRoutes from "./webhooks";

const api = new Hono()
  .onError((err, c) => {
    if (err instanceof TierLimitError) {
      return c.json(
        {
          success: false,
          error: err.message,
          message: err.validationResult.reason,
          code: "TIER_LIMIT_EXCEEDED",
        },
        403
      );
    }

    console.error("API Error:", err);
    Sentry.captureException(err);

    // Return error response that matches our extended client types
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      },
      500
    );
  })
  // Apply Clerk middleware to all routes (makes auth context available everywhere)
  .use("/*", clerkMiddleware())
  .get("/health", (c) => {
    // Health check endpoint
    return c.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  })
  // Apply requireAuth middleware only to routes that need authentication
  .use("/providers/*", requireAuth())
  .use("/schedules/*", requireAuth())
  .use("/subscriptions/*", requireAuth())
  .use("/usage/*", requireAuth())
  // Protected API routes
  .route("/providers", providersRoutes)
  .route("/schedules", schedulesRoutes)
  .route("/subscriptions", subscriptionsRoutes)
  .route("/usage", usageRoutes)
  // Public webhook routes (no auth required for Stripe webhooks)
  .route("/webhooks", webhooksRoutes);

export default api;
export type ApiType = typeof api;

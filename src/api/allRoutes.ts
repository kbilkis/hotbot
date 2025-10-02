import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";

import { requireAuth } from "../lib/auth/clerk";

import providersRoutes from "./providers";
import schedulesRoutes from "./schedules";
import subscriptionsRoutes from "./subscriptions";
import usageRoutes from "./usage";
import webhooksRoutes from "./webhooks";

const api = new Hono()
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

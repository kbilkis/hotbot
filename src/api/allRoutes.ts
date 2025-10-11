import { clerkMiddleware } from "@hono/clerk-auth";
import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";

import { TierLimitError } from "@/lib/access-control/middleware";

import { dbUserMiddleware, requireAuth } from "../lib/auth/clerk";
import {
  webhookRateLimit,
  tunnelRateLimit,
  apiRateLimit,
} from "../lib/middleware/rate-limit";

import providersRoutes from "./providers";
import schedulesRoutes from "./schedules";
import subscriptionsRoutes from "./subscriptions";
import tunnelRoutes from "./tunnel";
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
  .use(clerkMiddleware())
  .use(dbUserMiddleware())

  // Public routes with specific rate limiting
  .use("/webhooks/*", webhookRateLimit())
  .route("/webhooks", webhooksRoutes)

  .use("/tunnel/*", tunnelRateLimit())
  .route("/tunnel", tunnelRoutes)

  // Apply middleware to ALL routes in this group
  .use(apiRateLimit())
  .use(requireAuth())
  .get("/health", (c) => {
    return c.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  })
  // Add the protected routes
  .route("/providers", providersRoutes)
  .route("/schedules", schedulesRoutes)
  .route("/subscriptions", subscriptionsRoutes)
  .route("/usage", usageRoutes);

export default api;
export type ApiType = typeof api;

// this is a trick to calculate the type when compiling
// export type Client = ReturnType<typeof hc<typeof api>>;
// export const hcWithType = (...args: Parameters<typeof hc>): Client =>
//   hc<typeof api>(...args);

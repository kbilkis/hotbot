import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";

import { TierLimitError } from "@/lib/access-control/middleware";
import { dbUserMiddleware, requireAuth } from "@/lib/auth/clerk";
import {
  webhookRateLimit,
  tunnelRateLimit,
  apiRateLimit,
  bodyLimits,
} from "@/lib/middleware/rate-limit";

import providersRoutes from "./providers";
import schedulesRoutes from "./schedules";
import subscriptionsRoutes from "./subscriptions";
import tawkRoutes from "./tawk";
import tunnelRoutes from "./tunnel";
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
  .use(dbUserMiddleware())

  // Public routes with specific rate limiting
  .use("/webhooks/*", webhookRateLimit(), bodyLimits.large) // Webhooks can be large
  .route("/webhooks", webhooksRoutes)

  .use("/tunnel/*", tunnelRateLimit(), bodyLimits.medium) // Tunnel requests are medium
  .route("/tunnel", tunnelRoutes)

  .use(apiRateLimit(), bodyLimits.medium) // Default medium limit for API routes

  // Public routes
  .get("/health", (c) => {
    return c.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  })
  // Protected routes
  .use(requireAuth())
  .route("/providers", providersRoutes)
  .route("/schedules", schedulesRoutes)
  .route("/subscriptions", subscriptionsRoutes)
  .route("/tawk", tawkRoutes);

export default api;

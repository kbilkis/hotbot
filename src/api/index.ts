import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";

import { requireAuth } from "../lib/auth/clerk";

import authRoutes from "./auth";
import providersRoutes from "./providers";
import schedulesRoutes from "./schedules";
import subscriptionsRoutes from "./subscriptions";
import usageRoutes from "./usage";
import webhooksRoutes from "./webhooks";

const api = new Hono();

// Apply Clerk middleware to all routes (makes auth context available everywhere)
api.use("/*", clerkMiddleware());

// Health check endpoint
api.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Apply requireAuth middleware only to routes that need authentication
api.use("/providers/*", requireAuth());
api.use("/schedules/*", requireAuth());
api.use("/subscriptions/*", requireAuth());
api.use("/usage/*", requireAuth());
api.use("/auth/me", requireAuth()); // Protect the /me endpoint

// Public and protected auth routes
api.route("/auth", authRoutes);

// Protected API routes
api.route("/providers", providersRoutes);
api.route("/schedules", schedulesRoutes);
api.route("/subscriptions", subscriptionsRoutes);
api.route("/usage", usageRoutes);

// Public webhook routes (no auth required for Stripe webhooks)
api.route("/webhooks", webhooksRoutes);

export default api;

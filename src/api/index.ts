import { Hono } from "hono";
import { requireAuth } from "../lib/auth/clerk";
import { clerkMiddleware } from "@hono/clerk-auth";
import authRoutes from "./auth";
import providersRoutes from "./providers";
import schedulesRoutes from "./schedules";

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
api.use("/auth/me", requireAuth()); // Protect the /me endpoint

// Public and protected auth routes
api.route("/auth", authRoutes);

// Protected API routes
api.route("/providers", providersRoutes);
api.route("/schedules", schedulesRoutes);

export default api;

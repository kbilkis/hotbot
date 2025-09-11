import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import providersRoutes from "./routes/api/providers.js";
import cronJobsRoutes from "./routes/api/cron-jobs.js";

const app = new Hono();

// CORS for development
app.use(
  "*",
  cors({
    origin:
      process.env.NODE_ENV === "development" ? "http://localhost:5173" : true,
    credentials: true,
  })
);

// API routes
app.route("/api/providers", providersRoutes);
app.route("/api/cron-jobs", cronJobsRoutes);

// Export the API routes type for RPC client
const apiRoutes = app.basePath("/api");
export type ApiRoutes = typeof apiRoutes;

// Only serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static assets
  app.use("/assets/*", serveStatic({ root: "./dist" }));

  // Serve index.html for SPA routes (catch-all)
  app.get("*", serveStatic({ path: "./dist/index.html" }));
} else {
  // In development, just return a simple message for non-API routes
  app.get("*", (c) => {
    return c.text(
      "API server running. Frontend is served by Vite on port 5173."
    );
  });
}

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Server running on http://localhost:${port}`);
if (process.env.NODE_ENV === "development") {
  console.log(`🎨 Frontend running on http://localhost:5173`);
}

serve({
  fetch: app.fetch,
  port,
});

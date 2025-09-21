import { serve } from "@hono/node-server";
import { Hono } from "hono";

import apiRoutes from "./src/api/allRoutes";

// Used for _fast_ development environment

const app = new Hono();

// Mount API routes first
app.route("/api", apiRoutes);

const port = 8787;

console.log(`🚀 Dev server running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});

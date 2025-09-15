import { Hono } from "hono";

import apiRoutes from "./api/allRoutes";

const app = new Hono();

// CORS for development
// app.use(
//   "*",
//   cors({
//     origin:
//       process.env.NODE_ENV === "development" ? "http://localhost:5173" : "*",
//     credentials: true,
//   })
// );
console.log("qwe2", process.env.VITE_STRIPE_PUBLISHABLE_KEY);
// Mount API routes
app.route("/api", apiRoutes);

// Only serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static assets
  // app.use("/assets/*", serveStatic({ root: "./dist" }));
  // Serve index.html for SPA routes (catch-all)
  // app.get("*", serveStatic({ path: "./dist/index.html" }));
} else {
  // In development, just return a simple message for non-API routes
  // app.get("*", (c) => {
  //   return c.text(
  //     "API server running. Frontend is served by Vite on port 5173."
  //   );
  // });
}
export default app;

// if (process.env.NODE_ENV === "development") {
//   const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
//   console.log(`🚀 Server running on http://localhost:${port}`);
//   serve({
//     fetch: app.fetch,
//     port,
//   });
// }

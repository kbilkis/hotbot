import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { SSRRender } from "@/entry-server";
import { getViteEnvKey } from "@/lib/getViteEnvKey";

import apiRoutes from "./src/api/allRoutes";

const app = new Hono()
  .use(
    "*",
    cors({
      origin: "https://hotbot.sh",
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "sentry-trace",
        "baggage",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  )
  .route("/api", apiRoutes);

// Handle all requests
app.get("*", async (c) => {
  const pathname = new URL(c.req.url).pathname;

  // SSR for HTML routes
  try {
    const stream = await SSRRender(pathname);
    return new Response(stream, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("SSR Error:", error);
    return c.text("Internal Server Error", 500);
  }
});

// Conditionally wrap with Sentry based on environment
const environment = getViteEnvKey("VITE_ENVIRONMENT");
const isDevelopment = environment === "development" || environment === "local";

export default isDevelopment
  ? app
  : Sentry.withSentry(() => {
      return {
        dsn: process.env.SENTRY_DSN,
        environment: environment,
        release: process.env.SENTRY_RELEASE,
        sendDefaultPii: true,
        enableLogs: true,
        tracesSampleRate: 1,
      };
    }, app);

// export default app;
export type AppType = typeof app;

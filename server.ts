import { withSentry } from "@sentry/cloudflare";
import { Env, Hono } from "hono";
import { cors } from "hono/cors";

import { SSRRender } from "@/entry-server";

import apiRoutes from "./src/api/allRoutes";

type Bindings = {
  __STATIC_CONTENT: KVNamespace;
  CF_VERSION_METADATA: {
    id: string;
    tag: string;
    timestamp: string;
  };
};

const app = new Hono<{
  Bindings: Bindings;
}>()
  .use(
    "*",
    cors({
      origin: "https://hotbot.sh",
      allowHeaders: ["Content-Type", "Authorization"],
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

export default withSentry((env: Env) => {
  const { id: versionId } = (env as any).CF_VERSION_METADATA;
  console.log("versionId=" + versionId);
  return {
    dsn: "https://5e32db286691535cd9e6fd8c04c9f498@o4510160209969152.ingest.us.sentry.io/4510160388489216",
    release: versionId,
    sendDefaultPii: true,
  };
}, app);

// export default app;
export type AppType = typeof app;

import { Hono } from "hono";

import { SSRRender } from "@/entry-server";

import apiRoutes from "./src/api/allRoutes";

type Bindings = {
  __STATIC_CONTENT: KVNamespace;
};

const app = new Hono<{
  Bindings: Bindings;
}>().route("/api", apiRoutes);

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

export default app;
export type AppType = typeof app;

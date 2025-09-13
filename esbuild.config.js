import { build } from "esbuild";

// Build server
await build({
  entryPoints: ["src/server.ts"],
  bundle: true,
  outdir: "dist_hono",
  platform: "node",
  target: "node22",
  format: "esm",
  external: ["postgres", "drizzle-orm"],
  minify: process.env.NODE_ENV === "production",
});

console.log("Server build complete!");

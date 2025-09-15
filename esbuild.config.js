import { build } from "esbuild";

// Build server
await build({
  entryPoints: ["src/api/server.ts"],
  bundle: true,
  outdir: "api",
  outfile: "index.js",
  platform: "node",
  target: "node22",
  format: "esm",
  minify: process.env.NODE_ENV === "production",
});

console.log("Server build complete!");

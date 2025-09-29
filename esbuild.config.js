import { build } from "esbuild";

// Build server
await build({
  entryPoints: ["./server.ts"],
  bundle: true,
  outfile: "dist/index.js",
  platform: "node",
  target: "es2022",
  format: "esm",
  minify: process.env.NODE_ENV === "production",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

console.log("Server build complete!");

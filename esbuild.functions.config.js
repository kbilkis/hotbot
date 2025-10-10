import fs from "fs";

import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import esbuild from "esbuild";

// Build plugins - only include Sentry if auth token is available
const plugins = [];
if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(
    sentryEsbuildPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "bilkis",
      project: "hotbot-functions",
    })
  );
  console.log("✅ Sentry plugin enabled for source maps upload");
} else {
  console.log("⚠️  Sentry auth token not found - skipping source maps upload");
}

// Simple build - just compile the existing index.ts
await esbuild.build({
  entryPoints: ["src/functions/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: "dist_functions/index.js",
  minify: false,
  sourcemap: true,
  plugins,
});

// Create minimal package.json for Cloud Functions
const packageJson = {
  name: "cloud-functions",
  version: "1.0.0",
  main: "index.js",
  engines: {
    node: "22",
  },
};

if (!fs.existsSync("dist_functions")) {
  fs.mkdirSync("dist_functions");
}

fs.writeFileSync(
  "dist_functions/package.json",
  JSON.stringify(packageJson, null, 2)
);

console.log("✅ Cloud Functions built successfully");

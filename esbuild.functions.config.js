import fs from "fs";

import esbuild from "esbuild";

// Simple build - just compile the existing  index.ts
await esbuild.build({
  entryPoints: ["src/functions/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: "dist_functions/index.js",
  minify: false,
  sourcemap: true,
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

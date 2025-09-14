const config = {
  entryPoints: ["src/lambda/cron-handler.ts"],
  bundle: true,
  outfile: "dist_lambda/cron-handler.js",
  platform: "node",
  target: "node18",
  format: "cjs",
  external: [
    // AWS SDK is provided by Lambda runtime
    "aws-sdk",
    "@aws-sdk/*",
  ],
  minify: true,
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

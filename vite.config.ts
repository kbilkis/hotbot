import { resolve } from "node:path";

import { cloudflare } from "@cloudflare/vite-plugin";
import { preact } from "@preact/preset-vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig, loadEnv, PluginOption } from "vite";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const plugins: PluginOption[] = [
    preact(),
    vanillaExtractPlugin({
      identifiers: mode === "production" ? "short" : "debug",
    }),
    cloudflare(),
  ];

  if (env.ANALYZE === "true") {
    plugins.push(
      analyzer({
        openAnalyzer: false,
      })
    );
  }
  if (mode !== "development") {
    plugins.push(
      sentryVitePlugin({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: env.SENTRY_ORG || "bilkis",
        project: env.SENTRY_PROJECT_REACT || "hotbot-fe",
      })
    );
  }

  return {
    plugins,
    server: {
      allowedHosts: env.PUBLIC_SHARE ? [env.PUBLIC_SHARE] : undefined,
    },
    build: {
      manifest: true,
      minify: true,
      ssrManifest: true,
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "./src/entry-client.tsx"),
        },
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
    resolve: {
      alias: {
        "@": "/src",
        react: "preact/compat",
        "react-dom": "preact/compat",
      },
    },
  };
});

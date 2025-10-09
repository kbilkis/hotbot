import { resolve } from "node:path";

import { preact } from "@preact/preset-vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, PluginOption } from "vite";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(() => {
  const plugins: PluginOption[] = [preact()];
  if (process.env.ANALYZE === "true") {
    plugins.push(
      analyzer({
        openAnalyzer: false,
      })
    );
  }
  if (process.env.VITE_ENVIRONMENT !== "development") {
    plugins.push(
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG || "bilkis",
        project: process.env.SENTRY_PROJECT_REACT || "hotbot-fe",
      })
    );
  }

  return {
    plugins,
    define: {
      global: "globalThis",
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://localhost:8787", // Wrangler dev default port
          changeOrigin: true,
        },
      },
      allowedHosts: ["dfsy77safd78.share.zrok.io"],
    },
    build: {
      assetsDir: "dist",
      manifest: true,
      minify: true,
      ssrManifest: true,
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "./src/entry-client.tsx"),
        },
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
          globals: {
            preact: "preact",
          },
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

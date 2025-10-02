import { resolve } from "node:path";

import { preact } from "@preact/preset-vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(() => {
  const plugins = preact();
  if (process.env.ANALYZE === "true") {
    plugins.push(
      analyzer({
        openAnalyzer: false,
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

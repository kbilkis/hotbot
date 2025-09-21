import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
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
          react: "React",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

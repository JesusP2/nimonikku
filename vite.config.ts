import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { livestoreDevtoolsPlugin } from "@livestore/devtools-vite";
import tailwindcss from "@tailwindcss/vite";
import tanStackRouterVite from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: "nimonikku",
        short_name: "nimonikku",
        description: "nimonikku - PWA Application",
        theme_color: "#0c0c0c",
      },
      pwaAssets: {
        disabled: false,
        config: true,
      },
    }),
    cloudflare(),
    tailwindcss(),
    tanStackRouterVite({
      autoCodeSplitting: true,
    }),
    livestoreDevtoolsPlugin({ schemaPath: "./src/server/livestore/schema.ts" }),
    react(),
    tsconfigPaths({
      root: "./",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

import path from "node:path";
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from "@tailwindcss/vite";
import tanStackRouterVite from '@tanstack/router-plugin/vite';
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { livestoreDevtoolsPlugin } from '@livestore/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    cloudflare(),
    tailwindcss(),
    tanStackRouterVite({
      autoCodeSplitting: true,
    }),
    livestoreDevtoolsPlugin({ schemaPath: './src/server/livestore/schema.ts' }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "pikaboard",
        short_name: "pikaboard",
        description: "pikaboard - PWA Application",
        theme_color: "#0c0c0c",
      },
      pwaAssets: {
        disabled: false,
        config: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
    tsconfigPaths({
      root: './',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

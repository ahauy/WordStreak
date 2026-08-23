import { defineConfig, build } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "bundle-extension-scripts",
      async closeBundle() {
        if (!existsSync("dist")) {
          mkdirSync("dist", { recursive: true });
        }
        if (existsSync("manifest.json")) {
          copyFileSync("manifest.json", "dist/manifest.json");
        }

        // 1. Build content script as IIFE (self-contained, no external imports)
        await build({
          configFile: false,
          build: {
            outDir: "dist",
            emptyOutDir: false,
            lib: {
              entry: resolve(import.meta.dirname, "src/content/index.ts"),
              name: "WordStreakContent",
              formats: ["iife"],
              fileName: () => "content.js",
            },
          },
        });

        // 2. Build background service worker as ESM
        await build({
          configFile: false,
          build: {
            outDir: "dist",
            emptyOutDir: false,
            lib: {
              entry: resolve(import.meta.dirname, "src/background/index.ts"),
              formats: ["es"],
              fileName: () => "background.js",
            },
          },
        });
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, "src/popup/index.html"),
        options: resolve(import.meta.dirname, "src/options/index.html"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Saathi AI",
        short_name: "Saathi",
        description: "Emotion + Action — your AI companion",
        theme_color: "#0E0B1A",
        background_color: "#0E0B1A",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "en",
        categories: ["productivity", "lifestyle"],
        shortcuts: [
          {
            name: "New Chat",
            short_name: "Chat",
            url: "/home",
            description: "Start talking to Saathi",
          },
          {
            name: "My Tasks",
            short_name: "Tasks",
            url: "/tasks",
            description: "View your tasks",
          },
        ],
        icons: [
          {
            src: "/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: "all",
    proxy: {
      "/chat": "http://localhost:8787",
      "/health": "http://localhost:8787",
      "/memory": "http://localhost:8787",
    },
  },
});

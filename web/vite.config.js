import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png", "icon-512-maskable.png", "screenshot-wide.png", "screenshot-narrow.png"],
      manifest: {
        id: "/",
        name: "Saathi AI",
        short_name: "Saathi",
        description: "Emotion + Action — your AI companion. Voice-first, private, smart tasks, reminders.",
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
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-narrow.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Saathi AI - Voice Chat Home",
          },
          {
            src: "/screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Saathi AI - Desktop View",
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
      "/push": "http://localhost:8787",
    },
  },
});

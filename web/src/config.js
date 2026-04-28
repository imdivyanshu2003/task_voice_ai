// API base. Empty = same-origin (works when backend serves the PWA via Express static).
// In dev, Vite proxies /chat, /health, /memory to the Node backend on :8787.
// On Vercel, API routes are at /api/*
export const API_BASE = import.meta.env.VITE_API_BASE || "";
export const IS_VERCEL = typeof window !== "undefined" && (window.location.hostname.includes("vercel.app") || import.meta.env.VITE_VERCEL === "1");

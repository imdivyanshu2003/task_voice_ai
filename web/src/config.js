// API base URL.
// - Empty = same-origin (Express serves PWA, or Vite proxy in dev)
// - Set VITE_API_BASE to Railway URL for production (e.g. https://saathi-api.up.railway.app)
// - On Vercel without VITE_API_BASE, falls back to /api serverless functions
export const API_BASE = import.meta.env.VITE_API_BASE || "";
export const USE_SERVERLESS = !API_BASE && typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

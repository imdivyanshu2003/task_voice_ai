// API base URL.
// - In dev: empty (Vite proxy handles it)
// - On Vercel: use /api/proxy which forwards to Railway (avoids DNS/CORS issues)
const isProduction = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");
export const API_BASE = import.meta.env.VITE_API_BASE || (isProduction ? "/api/proxy" : "");
export const USE_SERVERLESS = false;

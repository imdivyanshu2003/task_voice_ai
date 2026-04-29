// API base URL.
// - In dev: empty (Vite proxy handles it)
// - On Vercel: use /r/ prefix which Vercel rewrites to Railway (no DNS/CORS issues)
const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");
export const API_BASE = import.meta.env.VITE_API_BASE || (isVercel ? "/r" : "");
export const USE_SERVERLESS = false;

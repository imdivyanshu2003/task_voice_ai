// API base URL.
// - In dev: empty (Vite proxy handles it)
// - On Vercel: ALWAYS use /r/ prefix which Vercel rewrites to Railway (avoids DNS blocking)
const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");
export const API_BASE = isVercel ? "/r" : (import.meta.env.VITE_API_BASE || "");
export const USE_SERVERLESS = false;

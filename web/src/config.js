// API base URL.
// - In dev: empty (Vite proxy handles it)
// - On Vercel: use Railway backend
// - VITE_API_BASE env var overrides if set
const RAILWAY_URL = "https://taskvoiceai-production.up.railway.app";
const isProduction = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");
export const API_BASE = import.meta.env.VITE_API_BASE || (isProduction ? RAILWAY_URL : "");
export const USE_SERVERLESS = false; // We always use Railway now

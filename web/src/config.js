// API base. Empty = same-origin (works when backend serves the PWA via Express static).
// In dev, Vite proxies /chat, /health, /memory to the Node backend on :8787.
export const API_BASE = import.meta.env.VITE_API_BASE || "";

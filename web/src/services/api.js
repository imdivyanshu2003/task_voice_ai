import { API_BASE, IS_VERCEL } from "../config";

function apiUrl(path) {
  if (IS_VERCEL) return `${API_BASE}/api${path}`;
  return `${API_BASE}${path}`;
}

export async function chat({ transcript, personality, history = [], memory = "" }) {
  const resp = await fetch(apiUrl("/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: transcript, personality, history, memory_summary: memory }),
  });
  if (!resp.ok) throw new Error(`Backend ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

export async function healthCheck() {
  try {
    const r = await fetch(apiUrl("/health"), { signal: AbortSignal.timeout(4000) });
    return r.ok;
  } catch {
    return false;
  }
}

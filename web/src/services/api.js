import { API_BASE } from "../config";

export async function chat({ transcript, personality, history = [], memory = "" }) {
  const resp = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, personality, history, memory }),
  });
  if (!resp.ok) throw new Error(`Backend ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

export async function healthCheck() {
  try {
    const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    return r.ok;
  } catch {
    return false;
  }
}

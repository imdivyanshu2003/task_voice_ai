// Vercel serverless — save push subscription
// Note: Vercel serverless functions are stateless, so subscriptions won't persist between invocations.
// For production, use a database (e.g., Redis, Supabase, etc.)
// For now, this endpoint exists so the frontend doesn't error — actual push scheduling happens on the Express backend.

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: "subscription required" });
  const subId = Buffer.from(subscription.endpoint).toString("base64").slice(-20);
  // In serverless, we can't store this in-memory. Return subId for client reference.
  res.json({ ok: true, subId, note: "For reliable push on Vercel, use a persistent backend (Railway/Render)" });
}

// Vercel serverless — schedule reminder
// Serverless functions can't run timers. This is a stub.
// The local SW + IndexedDB fallback handles reminders on Vercel.
// For production push scheduling, deploy the Express backend to Railway/Render.

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { title, remindAt } = req.body;
  if (!title || !remindAt) return res.status(400).json({ error: "title and remindAt required" });
  res.json({ ok: true, id: `rem_${Date.now()}`, note: "Scheduled locally via SW. For server push, use persistent backend." });
}

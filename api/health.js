// Vercel serverless function for /api/health
export default function handler(req, res) {
  res.json({
    ok: true,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    personalities: ["friend", "mentor", "bhakti", "hustler"],
  });
}

// Vercel serverless function for /api/memory/summarize
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { facts = [] } = req.body;
    if (!facts.length) return res.json({ summary: "" });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Summarize these facts about a user into a concise paragraph (max 200 words) that another AI can use as context. Keep it factual and personal.",
        },
        { role: "user", content: facts.join("\n") },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    console.error("[/api/memory/summarize] error:", err?.message || err);
    res.status(500).json({ error: "summarize_failed" });
  }
}

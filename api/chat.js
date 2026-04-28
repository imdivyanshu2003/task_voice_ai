// Vercel serverless function for /api/chat
import OpenAI from "openai";
import { buildSystemPrompt } from "../backend/src/prompts.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, personality, history = [], memory_summary } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const systemPrompt = buildSystemPrompt(personality || "friend", memory_summary || "");
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.8,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch {
      return res.status(500).json({ error: "invalid_json", raw: completion.choices[0].message.content });
    }

    // Defensive normalization
    parsed.mode = ["companion", "action", "mixed"].includes(parsed.mode) ? parsed.mode : "companion";
    parsed.emotional_response = String(parsed.emotional_response || "").slice(0, 600);
    parsed.tasks = Array.isArray(parsed.tasks) ? parsed.tasks.slice(0, 8).map((t) => ({
      title: String(t?.title || "").slice(0, 140),
      detail: String(t?.detail || "").slice(0, 240),
      category: String(t?.category || "personal").slice(0, 20),
    })).filter((t) => t.title) : [];
    if (parsed.mode === "companion") parsed.tasks = [];
    parsed.action_output = String(parsed.action_output || "").slice(0, 4000);
    parsed.action_type = ["draft", "plan", "answer", "explain", "create", "suggest", "calculate", "none"]
      .includes(parsed.action_type) ? parsed.action_type : "none";
    if (parsed.mode === "companion") { parsed.action_output = ""; parsed.action_type = "none"; }
    parsed.next_suggestion = String(parsed.next_suggestion || "").slice(0, 240);
    parsed.mood = String(parsed.mood || "neutral").slice(0, 20);
    parsed.user_facts = Array.isArray(parsed.user_facts)
      ? parsed.user_facts.filter((f) => typeof f === "string" && f.length > 3).slice(0, 5)
      : [];
    parsed.follow_up_prompt = String(parsed.follow_up_prompt || "").slice(0, 300);
    parsed.reminders = Array.isArray(parsed.reminders)
      ? parsed.reminders.slice(0, 5).map((r) => ({
          title: String(r?.title || "").slice(0, 140),
          time: String(r?.time || "").slice(0, 60),
        })).filter((r) => r.title && r.time)
      : [];

    res.json(parsed);
  } catch (err) {
    console.error("[/api/chat] error:", err?.message || err);
    res.status(500).json({ error: "chat_failed", detail: String(err?.message || err) });
  }
}

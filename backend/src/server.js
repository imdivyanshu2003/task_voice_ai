import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import OpenAI from "openai";
import { buildSystemPrompt, PERSONALITIES } from "./prompts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Serve the built PWA (after `npm run build` in ../web)
const webDist = join(__dirname, "../../web/dist");
app.use(express.static(webDist));

const PORT = process.env.PORT || 8787;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!process.env.OPENAI_API_KEY) {
  console.warn("[saathi] WARNING: OPENAI_API_KEY not set. /chat will fail.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/health", (_req, res) => {
  res.json({ ok: true, model: MODEL, personalities: Object.keys(PERSONALITIES) });
});

/**
 * POST /chat
 * body: {
 *   transcript: string,           // what the user said
 *   personality: "friend"|"mentor"|"bhakti"|"hustler",
 *   history: [{role:"user"|"assistant", content:string}],   // last N turns
 *   memory:  string                // compact summary of what AI should remember
 * }
 * returns: { mode, emotional_response, tasks[], next_suggestion }
 */
app.post("/chat", async (req, res) => {
  try {
    const body = req.body || {};
    const transcript = body.transcript || body.message;
    const personality = body.personality || "friend";
    const history = body.history || [];
    const memory = body.memory || body.memory_summary || "";
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "transcript (string) required" });
    }

    const messages = [
      { role: "system", content: buildSystemPrompt(personality, memory) },
      ...history.slice(-8).map((m) => ({ role: m.role, content: String(m.content || "") })),
      { role: "user", content: transcript },
    ];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        mode: "companion",
        emotional_response: raw.slice(0, 280),
        tasks: [],
        next_suggestion: "",
      };
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
    console.error("[/chat] error:", err?.message || err);
    res.status(500).json({ error: "chat_failed", detail: String(err?.message || err) });
  }
});

/**
 * POST /memory/summarize
 * body: { facts: string[] }   -> compact summary string for next-turn memory.
 * Optional helper. Client can also build memory locally.
 */
app.post("/memory/summarize", async (req, res) => {
  try {
    const { facts = [] } = req.body || {};
    if (!Array.isArray(facts) || facts.length === 0) return res.json({ summary: "" });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Compress the following user facts into a short, bullet-free, third-person memory summary under 600 chars. Keep goals, emotional patterns, preferences. Drop trivia.",
        },
        { role: "user", content: facts.join("\n") },
      ],
    });
    res.json({ summary: completion.choices?.[0]?.message?.content?.slice(0, 800) || "" });
  } catch (err) {
    res.status(500).json({ error: "summarize_failed", detail: String(err?.message || err) });
  }
});

// SPA catch-all: serve index.html for any non-API route (PWA routing)
app.get("*", (_req, res) => {
  res.sendFile(join(webDist, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[saathi] backend running on http://localhost:${PORT}`);
});

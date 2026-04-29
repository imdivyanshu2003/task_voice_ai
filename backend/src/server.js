import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import OpenAI from "openai";
import webPush from "web-push";
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

// --- Web Push setup ---
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:saathi@app.com";
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  console.log("[saathi] Web Push configured");
} else {
  console.warn("[saathi] WARNING: VAPID keys not set. Push notifications disabled.");
}

// In-memory stores (fine for single-server MVP)
const pushSubscriptions = new Map(); // subId -> subscription
const scheduledReminders = [];       // { id, title, note, remindAt, subId, fired }


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

// --- Push Notification Endpoints ---

// Return VAPID public key so frontend can subscribe
app.get("/push/vapid-key", (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// Save push subscription from frontend
app.post("/push/subscribe", (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: "subscription required" });
  const subId = Buffer.from(subscription.endpoint).toString("base64").slice(-20);
  pushSubscriptions.set(subId, subscription);
  console.log(`[push] subscription saved: ${subId} (total: ${pushSubscriptions.size})`);
  res.json({ ok: true, subId });
});

// Schedule a reminder to be sent via push
app.post("/push/reminder", (req, res) => {
  const { title, note, remindAt, subId } = req.body;
  if (!title || !remindAt) return res.status(400).json({ error: "title and remindAt required" });
  const id = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  scheduledReminders.push({
    id, title, note: note || "",
    remindAt: new Date(remindAt).getTime(),
    subId: subId || null,
    fired: false,
  });
  console.log(`[push] reminder scheduled: "${title}" at ${new Date(remindAt).toLocaleString()}`);
  res.json({ ok: true, id });
});

// Get active reminders
app.get("/push/reminders", (_req, res) => {
  res.json(scheduledReminders.filter((r) => !r.fired));
});

// --- Push Scheduler (checks every 15 seconds) ---
setInterval(async () => {
  const now = Date.now();
  for (const rem of scheduledReminders) {
    if (rem.fired || rem.remindAt > now) continue;
    rem.fired = true;

    const payload = JSON.stringify({
      title: "⏰ Reminder",
      body: `You have to: ${rem.title}${rem.note ? `\nScheduled for: ${rem.note}` : ""}\n— Saathi`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `saathi-${rem.id}`,
      data: { url: "/home", reminderId: rem.id },
    });

    // Send to specific subscriber or all subscribers
    const targets = rem.subId && pushSubscriptions.has(rem.subId)
      ? [pushSubscriptions.get(rem.subId)]
      : [...pushSubscriptions.values()];

    for (const sub of targets) {
      try {
        await webPush.sendNotification(sub, payload);
        console.log(`[push] sent: "${rem.title}"`);
      } catch (err) {
        console.error(`[push] send failed:`, err?.statusCode || err?.message);
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          // Subscription expired, remove it
          for (const [key, val] of pushSubscriptions) {
            if (val.endpoint === sub.endpoint) pushSubscriptions.delete(key);
          }
        }
      }
    }
  }
}, 15000);

// SPA catch-all: serve index.html for any non-API route (PWA routing)
app.get("*", (_req, res) => {
  res.sendFile(join(webDist, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[saathi] backend running on http://localhost:${PORT}`);
});

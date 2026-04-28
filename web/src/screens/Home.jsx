import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Send, CheckSquare, Settings, Keyboard, Loader2, Heart, Zap, Sparkles, ArrowRight, Shield, Copy, Share2, FileText, Map, Lightbulb, Calculator, PenTool, HelpCircle, Check, Bell } from "lucide-react";
import { useApp } from "../state/AppContext";
import { isSttSupported } from "../services/voice";
import { PERSONALITIES } from "../constants/personalities";

const MOOD_COLORS = {
  happy: "#7BD389", excited: "#FFD479", motivated: "#7BD389",
  sad: "#7A9CFF", anxious: "#FF8E53", confused: "#FFB48A",
  frustrated: "#FF6B6B", reflective: "#B39DFF", neutral: "#9C95B8",
};

function ModeIcon({ mode }) {
  if (mode === "companion") return <Heart className="w-3.5 h-3.5 text-accent" />;
  if (mode === "action") return <Zap className="w-3.5 h-3.5 text-success" />;
  return <Sparkles className="w-3.5 h-3.5 text-primary" />;
}

function modeBgClass(mode) {
  if (mode === "companion") return "bg-accent/10 border-accent/20";
  if (mode === "action") return "bg-success/10 border-success/20";
  return "bg-primary/10 border-primary/20";
}

const ACTION_TYPE_META = {
  draft: { icon: PenTool, label: "Draft", color: "#B39DFF" },
  plan: { icon: Map, label: "Plan", color: "#7BD389" },
  answer: { icon: HelpCircle, label: "Answer", color: "#7A9CFF" },
  explain: { icon: Lightbulb, label: "Explanation", color: "#FFD479" },
  create: { icon: FileText, label: "Created", color: "#FFB48A" },
  suggest: { icon: Sparkles, label: "Suggestions", color: "#B39DFF" },
  calculate: { icon: Calculator, label: "Calculation", color: "#7A9CFF" },
};

function ActionOutputCard({ output, actionType }) {
  const [copied, setCopied] = useState(false);
  if (!output) return null;
  const meta = ACTION_TYPE_META[actionType] || ACTION_TYPE_META.answer;
  const Icon = meta.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback: do nothing */ }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: output }); } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="rounded-2xl border border-primary/15 bg-bg mb-3 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border-b border-primary/10">
        <Icon className="w-4 h-4" style={{ color: meta.color }} />
        <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
        <div className="flex-1" />
        <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-surface transition">
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
        </button>
        <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-surface transition">
          <Share2 className="w-3.5 h-3.5 text-muted" />
        </button>
      </div>
      {/* Content */}
      <div className="px-4 py-3 max-h-[50vh] overflow-y-auto">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{output}</p>
      </div>
    </div>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`${isUser ? "flex justify-end" : ""} mb-3 animate-slide-up`}>
      {isUser ? (
        <div className="max-w-[82%] px-4 py-3 border bg-primary/15 border-primary/20 rounded-2xl rounded-br-md">
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Emotional response bubble */}
          {msg.content && (
            <div className={`max-w-[82%] px-4 py-3 border ${modeBgClass(msg.mode)} rounded-2xl rounded-bl-md`}>
              {msg.mode !== "user" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ModeIcon mode={msg.mode} />
                  <span className="text-[10px] text-muted font-medium uppercase tracking-wider">{msg.mode}</span>
                  {msg.mood && msg.mood !== "neutral" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-1"
                      style={{ background: `${MOOD_COLORS[msg.mood] || "#9C95B8"}22`, color: MOOD_COLORS[msg.mood] || "#9C95B8" }}>
                      {msg.mood}
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          )}
          {/* Action output (persisted) */}
          {msg.action_output && (
            <ActionOutputCard output={msg.action_output} actionType={msg.action_type} />
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const {
    messages, isListening, partial, isProcessing,
    lastResponse, error, currentMood, followUp,
    personality, tasks, reminders,
    startListening, stopListening, sendMessage, getGreeting,
  } = useApp();

  const bottomRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState("");
  const sttOk = isSttSupported();
  const greeting = getGreeting();
  const currentP = PERSONALITIES.find((p) => p.key === personality) || PERSONALITIES[0];
  const pendingTasks = tasks.filter((t) => !t.done).length;
  const moodColor = MOOD_COLORS[currentMood] || MOOD_COLORS.neutral;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partial, isProcessing]);

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(t);
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header with mood indicator */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: moodColor }} />
          <h1 className="text-xl font-bold">Saathi</h1>
          <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">{currentP.emoji} {currentP.name}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => navigate("/tasks")} className="p-2 rounded-xl hover:bg-surface transition relative">
            <CheckSquare className="w-5 h-5 text-muted" />
            {pendingTasks > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[10px] font-bold text-black flex items-center justify-center">
                {pendingTasks}
              </span>
            )}
          </button>
          <button onClick={() => navigate("/memory")} className="p-2 rounded-xl hover:bg-surface transition">
            <Settings className="w-5 h-5 text-muted" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && !isListening && !isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            {/* Greeting */}
            <p className="text-3xl mb-2">{greeting.emoji}</p>
            <p className="text-lg font-semibold text-muted mb-1">{greeting.text}</p>

            {/* Animated mic prompt */}
            <div className="relative mt-6 mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-[-8px] rounded-full bg-primary/5 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                <Mic className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-bold">Bol ke dekho…</p>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              Tap the mic and start talking.<br/>Saathi will understand.
            </p>

            {/* Trust badge */}
            <div className="flex items-center gap-1.5 mt-8 text-muted/50 text-xs">
              <Shield className="w-3 h-3" />
              <span>Private & secure. Your data stays on your device.</span>
            </div>
          </div>
        ) : (
          <>
            {/* Session context banner — shows when returning with previous messages */}
            {messages.length > 0 && messages.length <= 50 && (
              <div className="text-center py-3 mb-2 animate-fade-in">
                <p className="text-xs text-muted/50">
                  {greeting.emoji} {greeting.text} — {messages.length} messages from your last session
                </p>
              </div>
            )}

            {messages.map((m) => (
              <ChatBubble key={m.id} msg={m} />
            ))}

            {isListening && partial && (
              <div className="px-4 py-3 bg-accent/10 border border-accent/20 rounded-2xl mb-2 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
                    <span className="w-1.5 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                    <span className="w-1.5 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-5 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                  </div>
                  <span className="text-[10px] text-accent font-medium">Listening…</span>
                </div>
                <p className="text-accent text-sm">{partial}</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center gap-2 px-4 py-3 bg-surfaceAlt rounded-2xl mb-2 w-fit animate-fade-in">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
                <span className="text-xs text-muted">Saathi is thinking…</span>
              </div>
            )}

            {/* Action output + Tasks + follow-up after AI response */}
            {lastResponse && !isProcessing && (
              <div className="space-y-2 mb-3 animate-slide-up">
                {/* The main deliverable — AI's actual work */}
                {lastResponse.action_output && (
                  <ActionOutputCard output={lastResponse.action_output} actionType={lastResponse.action_type} />
                )}

                {/* Reminders set by AI */}
                {lastResponse.reminders?.length > 0 && (
                  <div className="px-4 py-3 bg-accent/8 border border-accent/15 rounded-2xl">
                    <p className="text-accent text-xs font-semibold mb-1.5"><Bell className="w-3 h-3 inline mr-1" />Reminders set</p>
                    {lastResponse.reminders.map((r, i) => (
                      <p key={i} className="text-muted text-xs">⏰ {r.title} — {r.time}</p>
                    ))}
                  </div>
                )}

                {lastResponse.tasks?.length > 0 && (
                  <div className="px-4 py-3 bg-success/8 border border-success/15 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-success text-xs font-semibold">📋 To track</p>
                      <button onClick={() => navigate("/tasks")} className="text-[10px] text-success flex items-center gap-0.5">
                        View all <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    {lastResponse.tasks.slice(0, 4).map((t, i) => (
                      <p key={i} className="text-muted text-xs leading-relaxed">• {t.title}</p>
                    ))}
                  </div>
                )}

                {lastResponse.next_suggestion && (
                  <p className="text-primary/80 text-xs px-2">{lastResponse.next_suggestion}</p>
                )}

                {followUp && (
                  <button
                    onClick={() => sendMessage(followUp)}
                    className="w-full text-left px-4 py-3 bg-primary/8 border border-primary/15 rounded-2xl text-sm text-primary hover:bg-primary/12 transition"
                  >
                    💬 {followUp}
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs text-center mb-2 bg-red-400/10 rounded-xl px-4 py-2">{error}</p>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pt-2 pb-4 safe-bottom border-t border-surfaceAlt bg-bg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowText(!showText)}
            className="p-3 rounded-xl bg-surface flex-shrink-0"
          >
            {showText ? <Mic className="w-5 h-5 text-muted" /> : <Keyboard className="w-5 h-5 text-muted" />}
          </button>

          {showText ? (
            <>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type something…"
                className="flex-1 h-12 px-5 rounded-full bg-surface text-text text-sm outline-none placeholder:text-muted"
                autoFocus
              />
              <button onClick={handleSend} className="p-3 rounded-xl bg-primary/20 flex-shrink-0">
                <Send className="w-5 h-5 text-primary" />
              </button>
            </>
          ) : (
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => {
                  if (isProcessing) return;
                  if (isListening) { stopListening(); return; }
                  if (sttOk) startListening();
                  else setShowText(true);
                }}
                disabled={isProcessing}
                className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-[0.92] transition-all"
                style={{
                  background: isListening
                    ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
                    : `linear-gradient(135deg, #B39DFF, #FFB48A)`,
                  boxShadow: isListening
                    ? "0 0 40px rgba(255,107,107,0.45)"
                    : `0 0 24px ${moodColor}33`,
                }}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : isListening ? (
                  <Square className="w-7 h-7 text-white" fill="white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" strokeWidth={2} />
                )}
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
                    <span className="absolute inset-[-6px] rounded-full border border-red-400/15 animate-ping" style={{ animationDuration: "1.5s" }} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

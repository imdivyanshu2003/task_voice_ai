import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, BarChart3, Brain, Trash2, Shield, Check } from "lucide-react";
import { useApp } from "../state/AppContext";
import { PERSONALITIES } from "../constants/personalities";

function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={onCancel}>
      <div className="bg-surface rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-muted text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-11 rounded-xl bg-surfaceAlt text-sm font-medium">Cancel</button>
          <button onClick={onConfirm} className="flex-1 h-11 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium">Yes</button>
        </div>
      </div>
    </div>
  );
}

export default function Memory() {
  const navigate = useNavigate();
  const {
    personality, setPersonality, messages, tasks, facts,
    clearChat, clearAllTasks, clearFacts, clearAll,
  } = useApp();

  const [confirm, setConfirm] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const currentP = PERSONALITIES.find((p) => p.key === personality) || PERSONALITIES[0];

  const doConfirm = (title, message, action) => {
    setConfirm({ title, message, action });
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 safe-top">
        <button onClick={() => navigate("/home")} className="p-2 rounded-xl hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Memory & Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
        {/* Personality */}
        <div className="bg-surface rounded-2xl p-5 flex items-center gap-4">
          <User className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Personality</p>
            <p className="text-xs text-muted">{currentP.emoji} {currentP.name}</p>
          </div>
          <button onClick={() => setShowPicker(true)} className="text-xs text-primary font-medium px-3 py-1.5 rounded-lg bg-primary/10">
            Change
          </button>
        </div>

        {/* Stats */}
        <div className="bg-surface rounded-2xl p-5 flex items-center gap-4">
          <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Stats</p>
            <p className="text-xs text-muted">{messages.length} messages • {tasks.length} tasks</p>
          </div>
        </div>

        {/* Memory facts — auto-learned from conversations */}
        <div className="bg-surface rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">What Saathi remembers</p>
              <p className="text-[10px] text-muted">Auto-learned from your conversations</p>
            </div>
            <span className="text-[10px] text-muted bg-surfaceAlt px-2 py-0.5 rounded-full">{facts.length}</span>
          </div>
          {facts.length === 0 ? (
            <p className="text-xs text-muted/60 pl-8">Start talking — Saathi will remember what matters.</p>
          ) : (
            <div className="space-y-1.5 pl-8">
              {facts.slice(0, 10).map((f, i) => (
                <p key={i} className="text-xs text-muted leading-relaxed flex items-start gap-2">
                  <span className="text-primary/40 mt-0.5">•</span>
                  <span>{f}</span>
                </p>
              ))}
              {facts.length > 10 && (
                <p className="text-[10px] text-muted/40">+{facts.length - 10} more</p>
              )}
            </div>
          )}
        </div>

        {/* Privacy controls */}
        <div className="pt-3">
          <p className="text-accent text-sm font-bold mb-3">Privacy Controls</p>

          <button
            onClick={() => doConfirm("Clear Chat", "Clear all chat messages?", clearChat)}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-surfaceAlt text-muted text-sm mb-2.5"
          >
            Clear chat history
          </button>
          <button
            onClick={() => doConfirm("Clear Tasks", "Delete all tasks?", clearAllTasks)}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-surfaceAlt text-muted text-sm mb-2.5"
          >
            Clear all tasks
          </button>
          <button
            onClick={() => doConfirm("Clear Memory", "Saathi will forget everything about you. Continue?", clearFacts)}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-surfaceAlt text-muted text-sm mb-2.5"
          >
            Clear memory (what Saathi knows)
          </button>
          <button
            onClick={() => doConfirm("Delete ALL Data", "This erases everything — chats, tasks, memory. Cannot undo.", clearAll)}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-red-500/40 text-red-400 text-sm mb-2.5"
          >
            Delete ALL data
          </button>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 py-6">
          <Shield className="w-4 h-4 text-muted" />
          <p className="text-muted text-xs text-center">
            Your data stays on this device. No tracking.
          </p>
        </div>
      </div>

      {/* Personality picker bottom sheet */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowPicker(false)}>
          <div className="bg-surface rounded-t-3xl w-full p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 text-center">Choose Personality</h3>
            {PERSONALITIES.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPersonality(p.key); setShowPicker(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surfaceAlt transition mb-1"
              >
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted">{p.tagline}</p>
                </div>
                {p.key === personality && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title || ""}
        message={confirm?.message || ""}
        onCancel={() => setConfirm(null)}
        onConfirm={() => { confirm?.action?.(); setConfirm(null); }}
      />
    </div>
  );
}

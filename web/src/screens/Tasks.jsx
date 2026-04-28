import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Check, Sparkles, Briefcase, Heart, Dumbbell, BookOpen, Star, PartyPopper } from "lucide-react";
import { useApp } from "../state/AppContext";

const CATEGORY_META = {
  work: { icon: Briefcase, color: "#B39DFF", label: "Work" },
  personal: { icon: Heart, color: "#FFB48A", label: "Personal" },
  health: { icon: Dumbbell, color: "#7BD389", label: "Health" },
  spiritual: { icon: Star, color: "#FFD479", label: "Spiritual" },
  learning: { icon: BookOpen, color: "#7A9CFF", label: "Learning" },
};

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.personal;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
      style={{ background: `${meta.color}18`, color: meta.color }}>
      <Icon className="w-2.5 h-2.5" /> {meta.label}
    </span>
  );
}

function TaskTile({ task, onToggle, onDelete }) {
  const [justDone, setJustDone] = useState(false);

  const handleToggle = () => {
    if (!task.done) {
      setJustDone(true);
      setTimeout(() => setJustDone(false), 1200);
    }
    onToggle();
  };

  return (
    <div className={`flex items-start gap-3 p-4 bg-surface rounded-2xl mb-2.5 transition-all ${justDone ? "ring-2 ring-success/40 bg-success/5" : ""}`}>
      <button onClick={handleToggle} className="mt-0.5 flex-shrink-0">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            task.done
              ? "bg-success border-success scale-110"
              : "border-muted bg-transparent hover:border-primary"
          }`}
        >
          {task.done && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-sm font-medium ${task.done ? "line-through text-muted" : "text-text"}`}>
            {task.title}
          </p>
          {justDone && <span className="text-sm animate-bounce">🎉</span>}
        </div>
        {task.detail && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed line-clamp-2">{task.detail}</p>
        )}
        {task.category && <div className="mt-1.5"><CategoryBadge category={task.category} /></div>}
      </div>
      <button onClick={onDelete} className="p-1 text-muted hover:text-red-400 transition">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, toggleTask, deleteTask, askWhatNext, isProcessing } = useApp();

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const total = tasks.length;
  const doneCount = done.length;
  const progress = total > 0 ? doneCount / total : 0;
  const allDone = total > 0 && doneCount === total;

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 safe-top">
        <button onClick={() => navigate("/home")} className="p-2 rounded-xl hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Tasks</h1>
        {done.length > 0 && (
          <button
            onClick={() => done.forEach((t) => deleteTask(t.id))}
            className="text-xs text-muted px-3 py-1.5 rounded-lg bg-surface"
          >
            Clear done
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-10 h-10 text-primary/30 mb-4" />
            <p className="text-muted text-base">No tasks yet.</p>
            <p className="text-muted/60 text-sm mt-1">Talk to Saathi to get started.</p>
            <button
              onClick={() => { askWhatNext(); navigate("/home"); }}
              className="mt-6 px-6 py-3 rounded-2xl bg-primary/15 text-primary text-sm font-medium"
            >
              ✨ What should I do today?
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className={`rounded-2xl p-5 mb-5 transition-all ${allDone ? "bg-success/10 border border-success/20" : "bg-surface"}`}>
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {allDone ? "🎉 All done!" : "Progress"}
                  </span>
                </div>
                <span className="text-xs text-muted">{doneCount}/{total}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surfaceAlt overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${allDone ? "bg-success" : "bg-gradient-to-r from-primary to-accent"}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              {allDone && (
                <p className="text-success text-xs mt-3">Great work! You've completed everything. 💪</p>
              )}
            </div>

            {/* "What next?" CTA */}
            <button
              onClick={() => { askWhatNext(); navigate("/home"); }}
              disabled={isProcessing}
              className="w-full mb-5 px-4 py-3.5 rounded-2xl bg-primary/10 border border-primary/15 text-sm text-primary font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <Sparkles className="w-4 h-4" /> What should I do next?
            </button>

            {/* Pending */}
            {pending.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted mb-2">To Do ({pending.length})</p>
                {pending.map((t) => (
                  <TaskTile key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} />
                ))}
              </>
            )}

            {/* Done */}
            {done.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted mb-2 mt-4">Done ({done.length})</p>
                {done.map((t) => (
                  <TaskTile key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} />
                ))}
              </>
            )}
            <div className="h-8" />
          </>
        )}
      </div>
    </div>
  );
}

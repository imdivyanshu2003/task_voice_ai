import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { PERSONALITIES } from "../constants/personalities";
import { useApp } from "../state/AppContext";

export default function Personality() {
  const navigate = useNavigate();
  const { personality, setPersonality } = useApp();
  const [selected, setSelected] = useState(personality);

  const onContinue = () => {
    setPersonality(selected);
    navigate("/permissions");
  };

  return (
    <div className="flex-1 flex flex-col px-6 safe-top safe-bottom">
      <div className="pt-6 animate-slide-up">
        <p className="text-xs text-primary font-medium tracking-wider uppercase mb-2">Step 1 of 2</p>
        <h1 className="text-3xl font-extrabold leading-tight">Choose your<br/>Saathi's voice</h1>
        <p className="mt-2 text-muted text-sm">This shapes personality, tone, and how your AI talks to you. You can change it anytime.</p>
      </div>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
        {PERSONALITIES.map((p, i) => {
          const chosen = p.key === selected;
          return (
            <button
              key={p.key}
              onClick={() => setSelected(p.key)}
              className="w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-all animate-slide-up active:scale-[0.98]"
              style={{
                background: chosen ? `${p.tint}20` : "#1A1530",
                border: `2px solid ${chosen ? p.tint : "#1A153066"}`,
                animationDelay: `${i * 0.08}s`,
                boxShadow: chosen ? `0 0 20px ${p.tint}15` : "none",
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ background: `${p.tint}18` }}>
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold text-base">{p.name}</div>
                <div className="text-xs text-muted mt-0.5">{p.tagline}</div>
              </div>
              {chosen && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: p.tint }}>
                  <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="mt-4 w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-black font-semibold active:scale-[0.98] transition-transform animate-slide-up"
        style={{ animationDelay: "0.35s" }}
      >
        Continue
      </button>
      <div className="h-4" />
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Heart, Zap, Shield } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col px-8 safe-top safe-bottom">
      <div className="flex-1" />
      <h1 className="text-4xl font-extrabold leading-tight animate-slide-up">
        Not just another<br/>AI assistant.
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed animate-slide-up" style={{ animationDelay: "0.15s" }}>
        Saathi <span className="text-text font-medium">feels</span> what you feel.<br/>
        And <span className="text-text font-medium">does</span> what you need.
      </p>

      {/* Feature pills */}
      <div className="mt-8 space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-accent/8 border border-accent/15">
          <Heart className="w-5 h-5 text-accent flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Emotional intelligence</p>
            <p className="text-xs text-muted">Understands your mood, not just your words</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-success/8 border border-success/15">
          <Zap className="w-5 h-5 text-success flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Action engine</p>
            <p className="text-xs text-muted">Turns your voice into real tasks & next steps</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/8 border border-primary/15">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Privacy-first</p>
            <p className="text-xs text-muted">Your data stays on your device. Always.</p>
          </div>
        </div>
      </div>

      <div className="flex-[1.5]" />
      <button
        onClick={() => navigate("/personality")}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-black font-semibold text-base active:scale-[0.98] transition-transform animate-slide-up"
        style={{ animationDelay: "0.5s" }}
      >
        Let's go
      </button>
      <div className="h-8" />
    </div>
  );
}

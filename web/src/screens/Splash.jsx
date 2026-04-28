import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useApp } from "../state/AppContext";

export default function Splash() {
  const navigate = useNavigate();
  const { onboarded } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(onboarded ? "/home" : "/welcome", { replace: true });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate, onboarded]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />

      <div className="relative animate-scale-in">
        <div className="absolute inset-[-12px] rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/40">
          <Sparkles className="w-14 h-14 text-white animate-float" strokeWidth={2.2} />
        </div>
      </div>
      <h1 className="mt-8 text-5xl font-extrabold tracking-wide animate-slide-up" style={{ animationDelay: "0.3s" }}>
        Saathi
      </h1>
      <p className="mt-3 text-muted tracking-widest text-sm animate-slide-up" style={{ animationDelay: "0.5s" }}>
        Feel. Think. Act.
      </p>
    </div>
  );
}

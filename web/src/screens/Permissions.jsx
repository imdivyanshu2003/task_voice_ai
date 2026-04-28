import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { useApp } from "../state/AppContext";
import { isSttSupported } from "../services/voice";
import { requestNotificationPermission } from "../services/reminders";

export default function Permissions() {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const [granted, setGranted] = useState(false);
  const [err, setErr] = useState("");

  const requestMic = async () => {
    setErr("");
    if (!isSttSupported()) {
      setErr("Voice not supported on this browser. Use Chrome on Android. You can still type.");
      // Allow proceeding without mic
      completeOnboarding();
      navigate("/home");
      return;
    }
    try {
      // Request mic permission via getUserMedia (more reliable than SpeechRecognition prompt)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setGranted(true);
      // Also request notification permission for reminders
      requestNotificationPermission();
      completeOnboarding();
      navigate("/home");
    } catch (e) {
      setErr("Microphone permission denied. You can still type to chat.");
    }
  };

  const skip = () => {
    completeOnboarding();
    navigate("/home");
  };

  return (
    <div className="flex-1 flex flex-col px-8 safe-top safe-bottom">
      <div className="flex-1" />
      <p className="text-xs text-primary font-medium tracking-wider uppercase mb-6 animate-fade-in">Step 2 of 2</p>

      <div className="relative self-start animate-scale-in">
        <div className="absolute inset-[-6px] rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2.5s" }} />
        <div className="p-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/15">
          <Mic className="w-12 h-12 text-primary" strokeWidth={1.8} />
        </div>
      </div>

      <h1 className="mt-7 text-3xl font-extrabold leading-tight animate-slide-up" style={{ animationDelay: "0.1s" }}>
        One permission.<br/>Full magic.
      </h1>
      <p className="mt-3 text-muted leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
        Saathi needs your microphone to listen to you.
      </p>

      {/* Trust details */}
      <div className="mt-5 space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-2 text-xs text-muted/70">
          <span className="w-1 h-1 rounded-full bg-success" /> Voice is processed in your browser — never stored
        </div>
        <div className="flex items-center gap-2 text-xs text-muted/70">
          <span className="w-1 h-1 rounded-full bg-success" /> Only text is sent to AI — no audio uploaded
        </div>
        <div className="flex items-center gap-2 text-xs text-muted/70">
          <span className="w-1 h-1 rounded-full bg-success" /> You can always type instead
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-red-400 bg-red-400/10 rounded-xl px-3 py-2">{err}</p>}
      <div className="flex-[2]" />
      <button
        onClick={requestMic}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-black font-semibold active:scale-[0.98] transition-transform animate-slide-up"
        style={{ animationDelay: "0.4s" }}
      >
        {granted ? "Let's go!" : "Allow Microphone"}
      </button>
      <button onClick={skip} className="w-full h-12 mt-2 text-muted text-sm animate-fade-in" style={{ animationDelay: "0.5s" }}>
        Skip for now (type only)
      </button>
      <div className="h-4" />
    </div>
  );
}

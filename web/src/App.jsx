import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./state/AppContext";
import Splash from "./screens/Splash";
import Welcome from "./screens/Welcome";
import Personality from "./screens/Personality";
import Permissions from "./screens/Permissions";
import Home from "./screens/Home";
import Tasks from "./screens/Tasks";
import Memory from "./screens/Memory";

function ReminderToast() {
  const { activeToast, dismissToast } = useApp();
  if (!activeToast) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={dismissToast} />
      {/* Toast card */}
      <div className="relative pointer-events-auto w-full max-w-sm bg-surface border border-accent/30 rounded-3xl p-6 shadow-2xl animate-scale-in text-center">
        <div className="text-5xl mb-3 animate-bounce">⏰</div>
        <p className="text-lg font-bold mb-1">{activeToast.taskTitle}</p>
        {activeToast.note && (
          <p className="text-sm text-muted mb-3">{activeToast.note}</p>
        )}
        <p className="text-xs text-muted/60 mb-5">Saathi Reminder</p>
        <button
          onClick={dismissToast}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-black font-semibold active:scale-[0.97] transition-transform"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { onboarded } = useApp();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <ReminderToast />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/personality" element={<Personality />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/home" element={onboarded ? <Home /> : <Navigate to="/welcome" replace />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

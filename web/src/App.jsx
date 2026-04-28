import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./state/AppContext";
import Splash from "./screens/Splash";
import Welcome from "./screens/Welcome";
import Personality from "./screens/Personality";
import Permissions from "./screens/Permissions";
import Home from "./screens/Home";
import Tasks from "./screens/Tasks";
import Memory from "./screens/Memory";

export default function App() {
  const { onboarded } = useApp();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
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

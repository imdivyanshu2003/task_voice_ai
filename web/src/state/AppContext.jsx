import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { Storage, newId } from "../services/storage";
import { chat as apiChat } from "../services/api";
import { VoiceController, speak, stopSpeaking } from "../services/voice";
import {
  addReminder, getActiveReminders, removeReminder, clearAllReminders,
  requestNotificationPermission, startReminderChecker, parseReminderTime,
  onInAppReminder, subscribeToPush,
} from "../services/reminders";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [personality, setPersonalityState] = useState(Storage.getPersonality());
  const [onboarded, setOnboarded] = useState(Storage.isOnboarded());
  const [messages, setMessages] = useState(Storage.getMessages());
  const [tasks, setTasks] = useState(Storage.getTasks());
  const [isListening, setIsListening] = useState(false);
  const [partial, setPartial] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState(null);
  const [currentMood, setCurrentMood] = useState("neutral");
  const [followUp, setFollowUp] = useState("");
  const [reminders, setReminders] = useState([]);
  const [activeToast, setActiveToast] = useState(null);

  const voiceRef = useRef(new VoiceController());

  const setPersonality = (key) => {
    Storage.setPersonality(key);
    setPersonalityState(key);
  };

  const completeOnboarding = () => {
    Storage.setOnboarded(true);
    setOnboarded(true);
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim()) return;
    const userMsg = {
      id: newId(),
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
      mode: "user",
    };
    Storage.addMessage(userMsg);
    setMessages((m) => [...m, userMsg]);
    setIsProcessing(true);
    setError(null);

    try {
      const history = Storage.getMessages()
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const resp = await apiChat({
        transcript: text.trim(),
        personality,
        history,
        memory: Storage.getMemorySummary(),
      });

      setLastResponse(resp);
      if (resp.mood) setCurrentMood(resp.mood);
      if (resp.follow_up_prompt) setFollowUp(resp.follow_up_prompt);

      const aiMsg = {
        id: newId(),
        role: "assistant",
        content: resp.emotional_response || "",
        action_output: resp.action_output || "",
        action_type: resp.action_type || "none",
        mode: resp.mode || "companion",
        mood: resp.mood || "neutral",
        createdAt: new Date().toISOString(),
      };
      Storage.addMessage(aiMsg);
      setMessages((m) => [...m, aiMsg]);

      if (Array.isArray(resp.tasks) && resp.tasks.length > 0) {
        const newTasks = resp.tasks.map((t) => ({
          id: newId(),
          title: t.title || "",
          detail: t.detail || "",
          category: t.category || "personal",
          done: false,
          createdAt: new Date().toISOString(),
        }));
        Storage.addTasks(newTasks);
        setTasks(Storage.getTasks());
      }

      // Auto-save user facts into memory
      if (Array.isArray(resp.user_facts) && resp.user_facts.length > 0) {
        resp.user_facts.forEach((f) => Storage.addFact(f));
      }

      // Process reminders from AI
      if (Array.isArray(resp.reminders) && resp.reminders.length > 0) {
        for (const rem of resp.reminders) {
          const remindAt = parseReminderTime(rem.time);
          if (remindAt) {
            await addReminder({ taskId: "", taskTitle: rem.title, remindAt, note: rem.time });
          }
        }
        setReminders(await getActiveReminders());
        // Ensure notification permission
        requestNotificationPermission();
      }

      // Speak the emotional response
      if (resp.emotional_response) speak(resp.emotional_response);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to reach Saathi.");
      const errMsg = {
        id: newId(),
        role: "assistant",
        content: `Couldn't connect. ${e.message}`,
        mode: "companion",
        createdAt: new Date().toISOString(),
      };
      Storage.addMessage(errMsg);
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, [personality]);

  const startListening = useCallback(() => {
    setPartial("");
    setIsListening(true);
    stopSpeaking();
    voiceRef.current.start({
      onPartial: (t) => setPartial(t),
      onFinal: (t) => {
        setIsListening(false);
        setPartial("");
        sendMessage(t);
      },
      onError: (err) => {
        setIsListening(false);
        setError(err.message);
      },
      lang: "hi-IN",
    });
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    voiceRef.current.stop();
    setIsListening(false);
  }, []);

  const toggleTask = (id) => {
    Storage.toggleTask(id);
    setTasks(Storage.getTasks());
  };

  const deleteTask = (id) => {
    Storage.deleteTask(id);
    setTasks(Storage.getTasks());
  };

  const clearAll = () => {
    Storage.clearAll();
    setMessages([]);
    setTasks([]);
    setLastResponse(null);
  };

  const clearChat = () => {
    Storage.clearMessages();
    setMessages([]);
  };

  const clearAllTasks = () => {
    Storage.clearTasks();
    setTasks([]);
  };

  const clearFacts = () => Storage.clearFacts();

  // Load reminders on mount
  useEffect(() => {
    getActiveReminders().then(setReminders);
  }, []);

  // Start reminder checker, push subscription, in-app toasts + stop TTS on unmount
  useEffect(() => {
    startReminderChecker();
    // Subscribe to server push for reliable background notifications
    requestNotificationPermission().then((perm) => {
      if (perm === "granted") subscribeToPush();
    });
    onInAppReminder((reminder) => {
      setActiveToast(reminder);
      // Auto-dismiss after 8 seconds
      setTimeout(() => setActiveToast(null), 8000);
      // Vibrate
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    });
    return () => stopSpeaking();
  }, []);

  // "What next?" — ask AI for follow-up guidance based on current tasks
  const askWhatNext = useCallback(() => {
    const pending = Storage.getTasks().filter((t) => !t.done);
    if (pending.length === 0) {
      sendMessage("Mera koi task nahi hai abhi — kya karun?");
    } else {
      const taskSummary = pending.slice(0, 5).map((t) => t.title).join(", ");
      sendMessage(`Mere pending tasks: ${taskSummary}. Kya karna chahiye pehle?`);
    }
  }, [sendMessage]);

  // Daily greeting helper
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5) return { text: "Late night hustle?", emoji: "🌙" };
    if (h < 12) return { text: "Good morning!", emoji: "🌅" };
    if (h < 17) return { text: "Good afternoon!", emoji: "☀️" };
    if (h < 21) return { text: "Good evening!", emoji: "🌆" };
    return { text: "Winding down?", emoji: "🌙" };
  };

  const value = {
    personality, setPersonality,
    onboarded, completeOnboarding,
    messages, tasks,
    isListening, partial,
    isProcessing, lastResponse,
    error, setError,
    currentMood, followUp,
    sendMessage, startListening, stopListening,
    toggleTask, deleteTask, askWhatNext, getGreeting,
    reminders, activeToast, dismissToast: () => setActiveToast(null),
    removeReminder: async (id) => { await removeReminder(id); setReminders(await getActiveReminders()); },
    clearReminders: async () => { await clearAllReminders(); setReminders([]); },
    clearAll, clearChat, clearAllTasks, clearFacts,
    facts: Storage.getFacts(),
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

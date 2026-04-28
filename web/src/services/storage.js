// Local-first storage using localStorage. Keeps things simple, no backend deps.

const K = {
  messages: "saathi_messages",
  tasks: "saathi_tasks",
  facts: "saathi_facts",
  personality: "saathi_personality",
  onboarded: "saathi_onboarded",
};

function get(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("storage set failed", e);
  }
}

export const Storage = {
  // Onboarding
  isOnboarded: () => get(K.onboarded, false),
  setOnboarded: (v) => set(K.onboarded, v),

  // Personality
  getPersonality: () => get(K.personality, "friend"),
  setPersonality: (key) => set(K.personality, key),

  // Messages
  getMessages: () => get(K.messages, []),
  saveMessages: (msgs) => set(K.messages, msgs.slice(-100)),
  addMessage: (msg) => {
    const msgs = [...get(K.messages, []), msg];
    set(K.messages, msgs.slice(-100));
  },
  clearMessages: () => localStorage.removeItem(K.messages),

  // Tasks
  getTasks: () => get(K.tasks, []),
  saveTasks: (tasks) => set(K.tasks, tasks),
  addTasks: (newTasks) => {
    const all = [...get(K.tasks, []), ...newTasks];
    set(K.tasks, all);
  },
  toggleTask: (id) => {
    const tasks = get(K.tasks, []).map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    set(K.tasks, tasks);
  },
  deleteTask: (id) => {
    set(
      K.tasks,
      get(K.tasks, []).filter((t) => t.id !== id)
    );
  },
  clearTasks: () => localStorage.removeItem(K.tasks),

  // Facts / memory
  getFacts: () => get(K.facts, []),
  addFact: (fact) => {
    const existing = get(K.facts, []);
    const lower = fact.toLowerCase().trim();
    if (existing.some((f) => f.toLowerCase().trim() === lower)) return;
    set(K.facts, [...existing, fact].slice(-50));
  },
  getMemorySummary: () => get(K.facts, []).join(". "),
  clearFacts: () => localStorage.removeItem(K.facts),

  // Nuke
  clearAll: () => {
    localStorage.removeItem(K.messages);
    localStorage.removeItem(K.tasks);
    localStorage.removeItem(K.facts);
  },
};

export function newId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

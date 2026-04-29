// Reminder system — uses IndexedDB + Service Worker for background notifications
// Works even when app is swiped away from recents

const DB_NAME = "saathi_reminders_db";
const DB_VERSION = 1;
const STORE_NAME = "reminders";

// --- IndexedDB helpers ---
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function getReminders() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch { return []; }
}

async function putReminder(reminder) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(reminder);
    tx.oncomplete = () => resolve();
  });
}

async function deleteReminderFromDB(id) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
  });
}

// --- Public API ---

export async function addReminder({ taskId, taskTitle, remindAt, note }) {
  const reminder = {
    id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    taskId: taskId || "",
    taskTitle,
    note: note || "",
    remindAt: new Date(remindAt).getTime(),
    fired: false,
    createdAt: Date.now(),
  };
  await putReminder(reminder);

  // Tell the service worker about the new reminder
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "SYNC_REMINDER", reminder });
  }
}

export async function removeReminder(id) {
  await deleteReminderFromDB(id);
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "DELETE_REMINDER", id });
  }
}

export async function getActiveReminders() {
  const all = await getReminders();
  return all.filter((r) => !r.fired);
}

export async function getAllReminders() {
  return getReminders();
}

export async function clearAllReminders() {
  const all = await getReminders();
  for (const r of all) await deleteReminderFromDB(r.id);
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_ALL_REMINDERS" });
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

// In-app toast listener — callback fired when reminder triggers while app is open
let _inAppCallback = null;
export function onInAppReminder(cb) {
  _inAppCallback = cb;
}

// Listen for messages from service worker
if (typeof navigator !== "undefined" && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "REMINDER_FIRED" && _inAppCallback) {
      _inAppCallback(event.data.reminder);
    }
  });
}

// Start the SW checker (tell SW to check now)
export function startReminderChecker() {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CHECK_NOW" });
  }
}

export function stopReminderChecker() {
  // no-op — SW handles its own lifecycle
}

// Parse time from user input like "5pm", "17:30", "in 30 minutes", "tomorrow 9am"
export function parseReminderTime(input) {
  const now = new Date();
  const lower = input.toLowerCase().trim();

  // "in X minutes/hours"
  const inMatch = lower.match(/in\s+(\d+)\s*(min|minute|minutes|hour|hours|hr|hrs)/);
  if (inMatch) {
    const val = parseInt(inMatch[1]);
    const unit = inMatch[2].startsWith("h") ? 60 : 1;
    return new Date(now.getTime() + val * unit * 60 * 1000);
  }

  // "tomorrow" prefix
  let dayOffset = 0;
  let timeStr = lower;
  if (lower.startsWith("tomorrow")) {
    dayOffset = 1;
    timeStr = lower.replace("tomorrow", "").trim();
  }

  // "5pm", "5:30pm", "17:00", "5:30 pm"
  const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2] || "0");
    const ampm = timeMatch[3]?.toLowerCase();

    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    const target = new Date(now);
    target.setDate(target.getDate() + dayOffset);
    target.setHours(hours, minutes, 0, 0);

    // If time already passed today and no dayOffset, push to tomorrow
    if (target <= now && dayOffset === 0) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  return null; // couldn't parse
}

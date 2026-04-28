// Reminder system using Web Notifications API
// Checks every 30 seconds for due reminders and fires notifications

const REMINDER_KEY = "saathi_reminders";

function getReminders() {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY) || "[]");
  } catch { return []; }
}

function saveReminders(reminders) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}

export function addReminder({ taskId, taskTitle, remindAt, note }) {
  const reminders = getReminders();
  reminders.push({
    id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    taskId,
    taskTitle,
    note: note || "",
    remindAt: new Date(remindAt).getTime(),
    fired: false,
    createdAt: Date.now(),
  });
  saveReminders(reminders);
}

export function removeReminder(id) {
  saveReminders(getReminders().filter((r) => r.id !== id));
}

export function getActiveReminders() {
  return getReminders().filter((r) => !r.fired);
}

export function getAllReminders() {
  return getReminders();
}

export function clearAllReminders() {
  localStorage.removeItem(REMINDER_KEY);
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

// Fire a notification
function fireNotification(title, body) {
  if (Notification.permission !== "granted") return;

  // Try vibration for mobile
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 200]); // ting-tong pattern
  }

  const notif = new Notification(title, {
    body,
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: `saathi-reminder-${Date.now()}`,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
  });

  // Play sound
  try {
    const audio = new Audio("data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAABkAGkAbwBzAHYAdwB3AHUAcQBrAGQAXABTAEkAPwA1ACsAIQAYAA8ABwAAAPoA9ADvAOoA5gDjAOEA4ADgAOEA4wDmAOoA7wD0APoAAAEHAQ8BGAEhASsBNQE/AUkBUwFcAWQBawFxAXUBdwF3AXYBcwFvAGkAYwBcAFMASwBBADcALQAjABkAEAAIAAEA+wD1APAA6wDnAOQA4gDhAOEA4gDkAOcA6wDwAPUA+wABAAgAEAAZACIAKwA1AD8ASQBTAFwAZABrAHEAdQB3AHcAdgBzAG8AaQBjAFwAUwBLAEEANwAtACMAGQAQAAgAAQA=");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {}

  notif.onclick = () => {
    window.focus();
    notif.close();
  };
}

// The checker — runs every 30 seconds
let checkerInterval = null;

function checkReminders() {
  const now = Date.now();
  const reminders = getReminders();
  let changed = false;

  reminders.forEach((r) => {
    if (!r.fired && r.remindAt <= now) {
      fireNotification(
        `⏰ Reminder: ${r.taskTitle}`,
        r.note || "Time to do this task!"
      );
      r.fired = true;
      changed = true;
    }
  });

  if (changed) {
    saveReminders(reminders);
  }
}

export function startReminderChecker() {
  if (checkerInterval) return;
  checkReminders(); // check immediately
  checkerInterval = setInterval(checkReminders, 30000); // every 30s
}

export function stopReminderChecker() {
  if (checkerInterval) {
    clearInterval(checkerInterval);
    checkerInterval = null;
  }
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

import { precacheAndRoute } from "workbox-precaching";

// Precache all build assets
precacheAndRoute(self.__WB_MANIFEST);

// ===== REMINDER SYSTEM IN SERVICE WORKER =====
// This runs even when the app is swiped away from recents

const REMINDER_KEY = "saathi_reminders";
const CHECK_INTERVAL = 20000; // check every 20 seconds

function getReminders() {
  // Service workers can't use localStorage, so we use a message channel
  // Instead, we'll store reminders in IndexedDB via a simple wrapper
  return new Promise((resolve) => {
    const request = indexedDB.open("saathi_reminders_db", 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("reminders", { keyPath: "id" });
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("reminders", "readonly");
      const store = tx.objectStore("reminders");
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => resolve([]);
    };
    request.onerror = () => resolve([]);
  });
}

function saveReminder(reminder) {
  return new Promise((resolve) => {
    const request = indexedDB.open("saathi_reminders_db", 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("reminders", { keyPath: "id" });
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("reminders", "readwrite");
      tx.objectStore("reminders").put(reminder);
      tx.oncomplete = () => resolve();
    };
    request.onerror = () => resolve();
  });
}

function deleteReminder(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open("saathi_reminders_db", 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("reminders", "readwrite");
      tx.objectStore("reminders").delete(id);
      tx.oncomplete = () => resolve();
    };
    request.onerror = () => resolve();
  });
}

async function checkAndFireReminders() {
  const now = Date.now();
  const reminders = await getReminders();

  for (const r of reminders) {
    if (!r.fired && r.remindAt <= now) {
      // Fire the notification
      const timeStr = r.note || "";
      const bodyText = timeStr
        ? `You have to: ${r.taskTitle}\nScheduled for: ${timeStr}\n— Saathi`
        : `You have to: ${r.taskTitle}\n— Saathi`;
      await self.registration.showNotification(`⏰ Reminder`, {
        body: bodyText,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `saathi-rem-${r.id}`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        actions: [
          { action: "open", title: "Open Saathi" },
          { action: "dismiss", title: "Dismiss" },
        ],
        data: { reminderId: r.id, url: "/home" },
      });

      // Mark as fired
      r.fired = true;
      await saveReminder(r);

      // Notify the app (if open) to show in-app toast
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.postMessage({
          type: "REMINDER_FIRED",
          reminder: r,
        });
      }
    }
  }
}

// Run checker on a loop using setTimeout (setInterval doesn't work in SW)
function startChecker() {
  checkAndFireReminders().then(() => {
    setTimeout(startChecker, CHECK_INTERVAL);
  });
}

// Start checking when SW activates
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  startChecker();
});

// Also check when SW wakes up
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      return self.clients.openWindow(event.notification.data?.url || "/home");
    })
  );
});

// Listen for messages from the app to sync reminders
self.addEventListener("message", (event) => {
  if (event.data?.type === "SYNC_REMINDER") {
    const r = event.data.reminder;
    saveReminder(r).then(() => checkAndFireReminders());
  }
  if (event.data?.type === "DELETE_REMINDER") {
    deleteReminder(event.data.id);
  }
  if (event.data?.type === "CLEAR_ALL_REMINDERS") {
    getReminders().then((all) => {
      Promise.all(all.map((r) => deleteReminder(r.id)));
    });
  }
  if (event.data?.type === "CHECK_NOW") {
    checkAndFireReminders();
  }
});

import api from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export async function enablePushNotifications() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Push notifications are not supported by this browser.");
    }

    const permission = await Notification.requestPermission();

if (permission === "denied") {
  throw new Error(
    "Notifications are blocked. Please allow them in your browser settings."
  );
}

if (permission !== "granted") {
  throw new Error("Notification permission was not granted.");
}

    const { data } = await api.get("/api/notifications/vapid-public-key");

    const registration = await navigator.serviceWorker.register(
      "/service-worker.js"
    );

    await navigator.serviceWorker.ready;

 let subscription = await registration.pushManager.getSubscription();

// Remove the old subscription if one exists
if (subscription) {
  await subscription.unsubscribe();
}

// Create a fresh subscription
subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(data.publicKey),
});

    await api.post("/api/notifications/subscribe", {
      subscription,
    });

    return true;
  } catch (error) {
    console.error("ENABLE PUSH NOTIFICATIONS ERROR:", error);
    throw error;
  }
}
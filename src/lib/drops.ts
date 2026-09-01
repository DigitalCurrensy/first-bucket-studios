/** Tuesday Tape at 09:00 local. Lives while the desk is open. */

function nextTuesdayNine() {
  const now = new Date();
  const next = new Date(now);
  const day = now.getDay();
  const add = (9 - day) % 7 || (now.getHours() < 9 && day === 2 ? 0 : 7);
  next.setDate(now.getDate() + add);
  next.setHours(9, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 7);
  return next;
}

export function armTuesdayTape() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  const fire = () => {
    try {
      if (Notification.permission === "granted") {
        new Notification("First Bucket Studio", { body: "The Tape is on the desk." });
      }
    } catch {
      /* silent */
    }
  };
  const wait = nextTuesdayNine().getTime() - Date.now();
  window.setTimeout(fire, Math.min(wait, 2_147_000_000));
}

export async function enableTuesdayTape() {
  if (typeof Notification === "undefined") return false;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;
    armTuesdayTape();
    return true;
  } catch {
    return false;
  }
}

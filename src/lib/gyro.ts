/** iOS requires requestPermission inside the same user gesture as the tear. Denied or missing → static foil. */

type GyroFn = (x: number, y: number) => void;

const listeners = new Set<GyroFn>();
let asked = false;
let granted = false;
let listening = false;

function onOrient(event: DeviceOrientationEvent) {
  const x = 50 + Math.max(-18, Math.min(18, event.gamma ?? 0));
  const y = 40 + Math.max(-12, Math.min(12, (event.beta ?? 0) - 45));
  for (const fn of listeners) fn(x, y);
}

function attach() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("deviceorientation", onOrient);
}

function motionOk() {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  } catch {
    /* keep going */
  }
  return typeof DeviceOrientationEvent !== "undefined";
}

/** Call from the pack-tear click. Never throws. */
export function requestGyro(): boolean {
  if (!motionOk()) return false;
  if (asked) {
    if (granted) attach();
    return granted;
  }
  asked = true;
  const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof DOE.requestPermission === "function") {
    try {
      const pending = DOE.requestPermission();
      void pending
        .then((perm) => {
          granted = perm === "granted";
          if (granted) attach();
        })
        .catch(() => {
          granted = false;
        });
    } catch {
      granted = false;
    }
    return false;
  }
  granted = true;
  attach();
  return true;
}

export function subscribeGyro(fn: GyroFn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function gyroLive() {
  return granted && listening;
}

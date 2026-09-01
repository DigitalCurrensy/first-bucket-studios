let audio: AudioContext | null = null;
let gestured = false;

if (typeof window !== "undefined") {
  const mark = () => {
    gestured = true;
  };
  window.addEventListener("pointerdown", mark, { once: true, capture: true });
  window.addEventListener("keydown", mark, { once: true, capture: true });
}

function context() {
  if (typeof window === "undefined") return null;
  try {
    audio ??= new AudioContext();
    return audio;
  } catch {
    return null;
  }
}

function reduceMotion() {
  if (typeof window === "undefined") return true;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function canVibrate() {
  return (
    typeof navigator !== "undefined" &&
    "vibrate" in navigator &&
    typeof navigator.vibrate === "function"
  );
}

function tapVibrate(ms: number | number[]) {
  if (!gestured) return;
  if (!canVibrate()) return;
  try {
    navigator.vibrate(ms);
  } catch {
    /* iOS Safari: vibrate is missing or throws */
  }
}

export function lockHaptic() {
  tapVibrate(10);
}

export function ripHaptic() {
  tapVibrate([15, 30, 45]);
}

function chirp(freq: number, seconds: number, type: OscillatorType, startGain: number) {
  try {
    const ctx = context();
    if (ctx) {
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(startGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + seconds + 0.01);
    }
    tapVibrate(14);
  } catch {
    tapVibrate(14);
  }
}

export function tick() {
  chirp(196, 0.05, "square", 0.05);
}

/** Pack flip. Longer, quieter. Reduced-motion is vibrate only. */
export function ripTick() {
  if (reduceMotion()) {
    tapVibrate(18);
    return;
  }
  chirp(110, 0.1, "sawtooth", 0.03);
  ripHaptic();
}

/** Foil tear. Lower, longer. */
export function packTear() {
  if (reduceMotion()) {
    tapVibrate(28);
    return;
  }
  chirp(90, 0.16, "sawtooth", 0.045);
  window.setTimeout(() => chirp(140, 0.08, "square", 0.02), 90);
  tapVibrate(28);
}

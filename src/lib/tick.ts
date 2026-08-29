let audio: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  audio ??= new AudioContext();
  return audio;
}

export function tick() {
  try {
    const ctx = context();
    if (ctx) {
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 196;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.055);
    }
    navigator.vibrate?.(14);
  } catch {
    try {
      navigator.vibrate?.(14);
    } catch {
      /* silent */
    }
  }
}

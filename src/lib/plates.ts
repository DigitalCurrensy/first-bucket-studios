import { hashSeed } from "./nba.ts";

/** First six stay put. Hash of existing ids must not shuffle. Append only. */
export const PLATES = [
  "/plates/center.jpg",
  "/plates/forward.jpg",
  "/plates/guard.jpg",
  "/plates/hardwood.jpg",
  "/plates/locker.jpg",
  "/plates/night.jpg",
  "/plates/lane.jpg",
  "/plates/rafters.jpg",
  "/plates/baseline.jpg",
  "/plates/paint.jpg",
  "/plates/glass.jpg",
  "/plates/pine.jpg",
  "/plates/visor.jpg",
  "/plates/empty.jpg",
  "/plates/door.jpg",
  "/plates/clock.jpg",
  "/plates/grain.jpg",
  "/plates/sideline.jpg",
  "/plates/lights.jpg",
  "/plates/bench.jpg",
  "/plates/score.jpg",
  "/plates/tunnel-plate.jpg",
  "/plates/rim-close.jpg",
  "/plates/chair.jpg",
  "/plates/apron.jpg",
  "/plates/corner.jpg",
  "/plates/fold.jpg",
  "/plates/hash.jpg",
  "/plates/key.jpg",
  "/plates/scorer.jpg",
  "/plates/bleacher.jpg",
  "/plates/jumper.jpg",
  "/plates/stanchion.jpg",
  "/plates/tape-floor.jpg",
  "/plates/tunnel-exit.jpg",
  "/plates/overhead.jpg",
] as const;

export function plateForPlayer(id: string) {
  return PLATES[hashSeed(id) % PLATES.length]!;
}

/** Nine crops on each still. 36 stills × 9 = 324 prints. First six paths stay first. */
export function plateCrop(id: string): string {
  const n = hashSeed(`crop:${id}`) % 9;
  const x = (n % 3) * 50;
  const y = Math.floor(n / 3) * 50;
  return `${x}% ${y}%`;
}

export function plateFor(pos: string, era: string) {
  if (era === "60s Celtic" || era === "Twin Towers") return "/plates/hardwood.jpg";
  if (era === "Showtime") return "/plates/night.jpg";
  if (era === "90s East") return pos === "G" ? "/plates/guard.jpg" : "/plates/locker.jpg";
  if (pos === "C") return "/plates/center.jpg";
  if (pos === "G") return "/plates/guard.jpg";
  return "/plates/forward.jpg";
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FB";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

const SUFFIX = /^(Jr\.?|Sr\.?|II|III|IV|V)$/i;

/** Caption split for the tobacco nameplate. Jr. stays with the last name. */
export function nameParts(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "Bucket" };
  if (parts.length === 1) return { first: "", last: parts[0]! };
  if (parts.length >= 3 && SUFFIX.test(parts[parts.length - 1]!)) {
    return { first: parts.slice(0, -2).join(" "), last: parts.slice(-2).join(" ") };
  }
  return { first: parts[0]!, last: parts.slice(1).join(" ") };
}

/** Crockford-ish. No I, O, 0, 1. Same id, same plate, forever. */
const PLATE_ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function cardSerial(id: string) {
  let n = hashSeed(`fb:${id}`);
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += PLATE_ALPH[n % 32]!;
    n = Math.floor(n / 32);
  }
  return `FB-${out}`;
}

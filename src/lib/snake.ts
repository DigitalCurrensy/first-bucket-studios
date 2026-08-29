import type { Player, Pos } from "@/lib/nba";

export const SEAT_COUNT = 4;
export const ROUNDS = 5;
export const TOTAL_PICKS = SEAT_COUNT * ROUNDS;

export const NRULES = [
  { n: "N1", text: "Snake, not linear. Odd rounds run left. Even rounds reverse." },
  { n: "N2", text: "Sit 1.01 through 1.04. Seat locks when the first name is in." },
  { n: "N3", text: "Four rooms, five rounds, twenty locks. The board closes after the last name." },
  { n: "N4", text: "The room drafts need-first. A missing G, F, or C beats raw peak." },
  { n: "N5", text: "Peak breaks ties. A third copy of a position is taxed." },
  { n: "N6", text: "No trades. No commissioner. No pause. No queue steal." },
  { n: "N7", text: "Click is the lock. Input is ignored off your clock." },
  { n: "N8", text: "Reset clears names. The rules do not move." },
] as const;

export type PickMeta = {
  overall0: number;
  overall: number;
  round: number;
  orderInRound: number;
  seat: number;
  label: string;
  reversing: boolean;
};

export function snakeSeat(overall0: number, seats = SEAT_COUNT) {
  const round = Math.floor(overall0 / seats);
  const slot = overall0 % seats;
  return round % 2 === 0 ? slot : seats - 1 - slot;
}

export function pickLabel(overall0: number, seats = SEAT_COUNT) {
  const round = Math.floor(overall0 / seats) + 1;
  const order = (overall0 % seats) + 1;
  return `${round}.${String(order).padStart(2, "0")}`;
}

export function pickMeta(overall0: number, seats = SEAT_COUNT): PickMeta {
  const round0 = Math.floor(overall0 / seats);
  return {
    overall0,
    overall: overall0 + 1,
    round: round0 + 1,
    orderInRound: (overall0 % seats) + 1,
    seat: snakeSeat(overall0, seats),
    label: pickLabel(overall0, seats),
    reversing: round0 % 2 === 1,
  };
}

export function overallFor(round0: number, seat: number, seats = SEAT_COUNT) {
  const orderInRound = round0 % 2 === 0 ? seat : seats - 1 - seat;
  return round0 * seats + orderInRound;
}

export function seatNames(youSlot: number) {
  const rooms = ["Room A", "Room B", "Room C"];
  let r = 0;
  return Array.from({ length: SEAT_COUNT }, (_, i) => (i === youSlot ? "You" : rooms[r++]!));
}

export function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

export function posCounts(roster: Player[]) {
  const counts: Record<Pos, number> = { G: 0, F: 0, C: 0 };
  for (const p of roster) counts[p.pos] += 1;
  return counts;
}

export function scoreNeed(player: Player, roster: Player[]) {
  const counts = posCounts(roster);
  const missing = (["G", "F", "C"] as const).filter((pos) => counts[pos] === 0);
  const copies = counts[player.pos];
  let score = player.peak;
  if (missing.includes(player.pos)) score += 10;
  if (missing.length > 0 && !missing.includes(player.pos)) score -= 3;
  if (copies >= 2) score -= 8;
  if (copies >= 3) score -= 12;
  return score;
}

export function roomSelect(available: Player[], roster: Player[]) {
  if (available.length === 0) return undefined;
  let best = available[0]!;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const player of available) {
    const score = scoreNeed(player, roster);
    if (score > bestScore) {
      bestScore = score;
      best = player;
    }
  }
  return best;
}

export function peakSum(roster: Player[]) {
  return roster.reduce((n, p) => n + p.peak, 0);
}

export const NEED_MATH = [
  { n: "base", text: "Start at peak. Pick one is BPA — every hole is open." },
  { n: "+10", text: "That G, F, or C is still missing." },
  { n: "−3", text: "A hole remains and this name does not fill it." },
  { n: "−8", text: "Third copy of a position." },
  { n: "−12", text: "Fourth copy. The room will not stack a fourth guard." },
] as const;

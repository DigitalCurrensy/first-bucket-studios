import { ALLTIME } from "./book-alltime.ts";
import { CURRENT } from "./book-current.ts";
import { VINTAGE } from "./book-vintage.ts";
import { WNBA } from "./book-wnba.ts";
import { goatTelemetry, playoffTelemetry, seasonTelemetry } from "./telemetry.ts";

export type Pos = "G" | "F" | "C";
export type Shelf = "alltime" | "current" | "wnba";

export type Player = {
  id: string;
  name: string;
  pos: Pos;
  era: string;
  peak: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  threes: number;
  club: string;
  shelf: Shelf;
};

export const FRANCHISES = [
  "Lakers",
  "Celtics",
  "Spurs",
  "Bulls",
  "Warriors",
  "Heat",
  "Pistons",
  "Knicks",
  "Suns",
  "Nuggets",
  "Thunder",
  "Bucks",
  "Mavericks",
  "76ers",
  "Cavaliers",
  "Timberwolves",
  "Rockets",
  "Clippers",
  "Hawks",
  "Pacers",
  "Kings",
  "Magic",
  "Nets",
  "Pelicans",
  "Raptors",
  "Grizzlies",
  "Jazz",
  "Trail Blazers",
  "Hornets",
  "Wizards",
] as const;

export type Franchise = (typeof FRANCHISES)[number];

export const ABBR: Record<Franchise, string> = {
  Lakers: "LAL",
  Celtics: "BOS",
  Spurs: "SAS",
  Bulls: "CHI",
  Warriors: "GSW",
  Heat: "MIA",
  Pistons: "DET",
  Knicks: "NYK",
  Suns: "PHX",
  Nuggets: "DEN",
  Thunder: "OKC",
  Bucks: "MIL",
  Mavericks: "DAL",
  "76ers": "PHI",
  Cavaliers: "CLE",
  Timberwolves: "MIN",
  Rockets: "HOU",
  Clippers: "LAC",
  Hawks: "ATL",
  Pacers: "IND",
  Kings: "SAC",
  Magic: "ORL",
  Nets: "BKN",
  Pelicans: "NOP",
  Raptors: "TOR",
  Grizzlies: "MEM",
  Jazz: "UTA",
  "Trail Blazers": "POR",
  Hornets: "CHA",
  Wizards: "WAS",
};

export const WNBA_FRANCHISES = [
  "Aces",
  "Liberty",
  "Lynx",
  "Fever",
  "Sun",
  "Storm",
  "Mercury",
  "Wings",
  "Sky",
  "Mystics",
  "Dream",
  "Sparks",
  "Valkyries",
] as const;

export type WnbaClub = (typeof WNBA_FRANCHISES)[number];

export const WNBA_ABBR: Record<WnbaClub, string> = {
  Aces: "LVA",
  Liberty: "NYL",
  Lynx: "MIN",
  Fever: "IND",
  Sun: "CON",
  Storm: "SEA",
  Mercury: "PHX",
  Wings: "DAL",
  Sky: "CHI",
  Mystics: "WAS",
  Dream: "ATL",
  Sparks: "LAS",
  Valkyries: "GSV",
};

const WNBA_NAME_BY_ABBR = Object.fromEntries(
  Object.entries(WNBA_ABBR).map(([name, code]) => [code, name]),
) as Record<string, WnbaClub>;

export function clubAbbr(name: string) {
  return ABBR[name as Franchise] ?? WNBA_ABBR[name as WnbaClub] ?? name.slice(0, 3).toUpperCase();
}

export function wnbaClubOf(code: string): WnbaClub | undefined {
  if (WNBA_NAME_BY_ABBR[code]) return WNBA_NAME_BY_ABBR[code];
  if ((WNBA_FRANCHISES as readonly string[]).includes(code)) return code as WnbaClub;
  return undefined;
}

export const ERAS = [
  "60s Celtic",
  "Showtime",
  "90s East",
  "Twin Towers",
  "2000s",
  "04 Defense",
  "Positionless",
] as const;

export type Era = (typeof ERAS)[number];

export function eraLabel(era: string) {
  return era.replaceAll("Positionless", "Now");
}

export const PLAYERS: Player[] = [...ALLTIME, ...CURRENT, ...WNBA, ...VINTAGE];
export const PLAYERS_BY_ID = Object.fromEntries(PLAYERS.map((p) => [p.id, p])) as Record<string, Player>;

export function currentBook(pool: Player[] = PLAYERS) {
  return pool.filter((p) => p.shelf === "current" || p.shelf === "wnba");
}

export function nbaBook(pool: Player[] = PLAYERS) {
  return pool.filter((p) => p.shelf === "current");
}

export function wnbaBook(pool: Player[] = PLAYERS) {
  return pool.filter((p) => p.shelf === "wnba");
}

export function mulberry32(seed: number) {
  let t = (Number.isFinite(seed) ? seed : 0) >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Custom pull field only. Walk ids and daily rooms keep the raw string. */
export function sanitizeSeed(raw: string) {
  return String(raw ?? "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 32);
}

/** FNV-1a. Identity hash for plates, serials, telemetry. Not a PRNG seed. */
export function hashSeed(input: string) {
  const s = typeof input === "string" ? input : String(input ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * xmur3 fold. Turns a string into a well-mixed 32-bit seed for mulberry32.
 * Similar keys avalanche; empty and non-strings stay finite.
 */
export function deriveSeed(input: string) {
  const s = typeof input === "string" ? input : String(input ?? "");
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Canonical walk / deal stream. Same string, same nights. */
export function rngFrom(input: string) {
  return mulberry32(deriveSeed(input));
}

/** Independent lane off one key. `pull:` and `five:` never share a sequence. */
export function streamRng(lane: string, seed: string) {
  return rngFrom(`${lane}:${seed}`);
}

export function pickIndex<T>(rng: () => number, list: readonly T[]) {
  const n = list.length;
  if (n === 0) return undefined as T;
  const u = rng();
  const i = Math.floor((Number.isFinite(u) ? Math.min(Math.max(u, 0), 0.9999999) : 0) * n);
  return list[i]!;
}

/** CSPRNG entropy for a live pull. 64 bits, padded, then folded to 32 by deriveSeed. Daily rooms stay date-seeded. */
export function freshEntropy() {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(2);
    crypto.getRandomValues(buf);
    return `${buf[0]!.toString(16).padStart(8, "0")}${buf[1]!.toString(16).padStart(8, "0")}`;
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Partial Fisher–Yates. Live packs only.
 * The demo room is a pin-table in house-pack.ts — do not shuffle it.
 * Do not retune this draw; walk URLs recompute nights from ids.
 */
export function dealFrom(pool: Player[], rng: () => number, count: number) {
  const copy = [...pool];
  const out: Player[] = [];
  while (out.length < count && copy.length) {
    const i = Math.floor(rng() * copy.length);
    out.push(copy.splice(i, 1)[0]!);
  }
  return out;
}

/** Two guards, two wings, one center in the ten. Never bricks Four corners. */
export function dealCornersPack(pool: Player[], rng: () => number, count = 10) {
  const g = pool.filter((p) => p.pos === "G");
  const f = pool.filter((p) => p.pos === "F");
  const c = pool.filter((p) => p.pos === "C");
  const locked = [...dealFrom(g, rng, 2), ...dealFrom(f, rng, 2), ...dealFrom(c, rng, 1)];
  const rest = pool.filter((p) => !locked.some((row) => row.id === p.id));
  const fill = dealFrom(rest, rng, Math.max(0, count - locked.length));
  const out = [...locked, ...fill];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

export function projectWins(roster: Player[], era: string, of = 82) {
  return seasonTelemetry(roster, era, of).projected;
}

export function goatScore(roster: Player[]) {
  return goatTelemetry(roster).projected;
}

export function playoffWins(roster: Player[], era = "2000s") {
  return playoffTelemetry(roster, era).projected;
}

export function winLabel(wins: number, of = 82) {
  const p = of === 0 ? 0 : wins / of;
  if (of === 0) {
    if (wins >= 97) return "Mythic";
    if (wins >= 94) return "Inner circle";
    if (wins >= 90) return "All-time";
    if (wins >= 85) return "Hall";
    return "Debate";
  }
  if (p >= 1) return "Undefeated";
  if (p >= 0.85) return "Historic";
  if (p >= 0.73) return "Title favorite";
  if (p >= 0.61) return "Playoff lock";
  if (p >= 0.51) return "Play-in";
  return "Lottery";
}

export function recordLine(wins: number, of = 82) {
  return `${wins}–${of - wins}`;
}

export function goatLabel(score: number) {
  if (score >= 97) return "Mythic";
  if (score >= 94) return "Inner circle";
  if (score >= 90) return "All-time";
  if (score >= 85) return "Hall";
  return "Debate";
}

export function playoffLine(wins: number) {
  return `${wins}–${16 - wins}`;
}

export function playoffLabel(wins: number) {
  if (wins >= 16) return "Banner";
  if (wins >= 12) return "Finals";
  if (wins >= 8) return "Conference finals";
  if (wins >= 4) return "Second round";
  if (wins >= 1) return "First round";
  return "Out";
}

export function cornersOk(roster: Player[]) {
  const g = roster.filter((p) => p.pos === "G").length;
  const f = roster.filter((p) => p.pos === "F").length;
  const c = roster.filter((p) => p.pos === "C").length;
  return roster.length === 5 && g === 2 && f === 2 && c === 1;
}

import { ALLTIME } from "./book-alltime.ts";
import { CURRENT } from "./book-current.ts";
import { WNBA } from "./book-wnba.ts";

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

export function clubAbbr(name: string) {
  return ABBR[name as Franchise] ?? name.slice(0, 3).toUpperCase();
}

export const ERAS = [
  "60s Celtic",
  "Showtime",
  "90s East",
  "Twin Towers",
  "2000s",
  "Positionless",
] as const;

export type Era = (typeof ERAS)[number];

export const PLAYERS: Player[] = [...ALLTIME, ...CURRENT, ...WNBA];
export const PLAYERS_BY_ID = Object.fromEntries(PLAYERS.map((p) => [p.id, p])) as Record<string, Player>;

export function currentBook(pool: Player[] = PLAYERS) {
  return pool.filter((p) => p.shelf === "current" || p.shelf === "wnba");
}

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickIndex<T>(rng: () => number, list: readonly T[]) {
  return list[Math.floor(rng() * list.length)]!;
}

export function dealFrom(pool: Player[], rng: () => number, count: number) {
  const copy = [...pool];
  const out: Player[] = [];
  while (out.length < count && copy.length) {
    const i = Math.floor(rng() * copy.length);
    out.push(copy.splice(i, 1)[0]!);
  }
  return out;
}

export function projectWins(roster: Player[], era: string) {
  if (roster.length === 0) return 0;
  const avg = roster.reduce((n, p) => n + p.peak, 0) / roster.length;
  const balance = new Set(roster.map((p) => p.pos)).size;
  const eraFit = roster.filter((p) => p.era === era).length;
  const raw = (avg - 78) * 3.2 + balance * 5 + eraFit * 2.4;
  return Math.max(18, Math.min(82, Math.round(raw)));
}

export function winLabel(wins: number) {
  if (wins >= 82) return "Undefeated";
  if (wins >= 70) return "Historic";
  if (wins >= 60) return "Title favorite";
  if (wins >= 50) return "Playoff lock";
  if (wins >= 42) return "Play-in";
  return "Lottery";
}

export function recordLine(wins: number) {
  return `${wins}–${82 - wins}`;
}

export function goatScore(roster: Player[]) {
  if (roster.length === 0) return 0;
  const avg = roster.reduce((n, p) => n + p.peak, 0) / roster.length;
  const balance = new Set(roster.map((p) => p.pos)).size;
  const eras = new Set(roster.map((p) => p.era)).size;
  const copies = Math.max(...(["G", "F", "C"] as const).map((pos) => roster.filter((p) => p.pos === pos).length), 0);
  const raw = avg + (balance - 1) * 2.4 + (eras - 1) * 0.8 - Math.max(0, copies - 2) * 6;
  return Math.max(72, Math.min(99, Math.round(raw)));
}

export function goatLabel(score: number) {
  if (score >= 97) return "Mythic";
  if (score >= 94) return "Inner circle";
  if (score >= 90) return "All-time";
  if (score >= 85) return "Hall";
  return "Debate";
}

export function playoffWins(roster: Player[]) {
  if (roster.length === 0) return 0;
  const avg = roster.reduce((n, p) => n + p.peak, 0) / roster.length;
  const balance = new Set(roster.map((p) => p.pos)).size;
  const twoWay = roster.reduce((n, p) => n + p.stl + p.blk, 0) / roster.length;
  const copies = Math.max(...(["G", "F", "C"] as const).map((pos) => roster.filter((p) => p.pos === pos).length), 0);
  const raw = (avg - 91) * 1.2 + balance * 1.8 + twoWay * 1.5 - Math.max(0, copies - 2) * 3.5;
  return Math.max(0, Math.min(16, Math.round(raw)));
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

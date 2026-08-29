export type Pos = "G" | "F" | "C";

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
] as const;

export type Franchise = (typeof FRANCHISES)[number];

export const ERAS = [
  "60s Celtic",
  "Showtime",
  "90s East",
  "Twin Towers",
  "2000s",
  "Positionless",
] as const;

export type Era = (typeof ERAS)[number];

export const PLAYERS: Player[] = [
  { id: "mj", name: "Michael Jordan", pos: "G", era: "90s East", peak: 99, pts: 33, reb: 6, ast: 5, stl: 2.3, blk: 0.8, threes: 1.1 },
  { id: "lebron", name: "LeBron James", pos: "F", era: "Positionless", peak: 98, pts: 27, reb: 8, ast: 8, stl: 1.5, blk: 0.8, threes: 2.0 },
  { id: "jokic", name: "Nikola Jokic", pos: "C", era: "Positionless", peak: 97, pts: 26, reb: 12, ast: 9, stl: 1.3, blk: 0.7, threes: 1.5 },
  { id: "kobe", name: "Kobe Bryant", pos: "G", era: "2000s", peak: 96, pts: 28, reb: 5, ast: 5, stl: 1.5, blk: 0.5, threes: 1.5 },
  { id: "magic", name: "Magic Johnson", pos: "G", era: "Showtime", peak: 96, pts: 20, reb: 7, ast: 11, stl: 1.7, blk: 0.4, threes: 0.4 },
  { id: "curry", name: "Stephen Curry", pos: "G", era: "Positionless", peak: 96, pts: 30, reb: 5, ast: 6, stl: 1.3, blk: 0.3, threes: 5.1 },
  { id: "bird", name: "Larry Bird", pos: "F", era: "Showtime", peak: 95, pts: 25, reb: 10, ast: 6, stl: 1.7, blk: 0.8, threes: 1.3 },
  { id: "shaq", name: "Shaquille O'Neal", pos: "C", era: "2000s", peak: 95, pts: 27, reb: 12, ast: 3, stl: 0.6, blk: 2.4, threes: 0 },
  { id: "giannis", name: "Giannis Antetokounmpo", pos: "F", era: "Positionless", peak: 95, pts: 29, reb: 11, ast: 6, stl: 1.1, blk: 1.2, threes: 0.8 },
  { id: "hakeem", name: "Hakeem Olajuwon", pos: "C", era: "Twin Towers", peak: 94, pts: 26, reb: 11, ast: 3, stl: 1.8, blk: 3.3, threes: 0.1 },
  { id: "duncan", name: "Tim Duncan", pos: "F", era: "2000s", peak: 94, pts: 22, reb: 12, ast: 3, stl: 0.7, blk: 2.4, threes: 0 },
  { id: "russell", name: "Bill Russell", pos: "C", era: "60s Celtic", peak: 94, pts: 15, reb: 23, ast: 4, stl: 1.5, blk: 4.0, threes: 0 },
  { id: "kd", name: "Kevin Durant", pos: "F", era: "Positionless", peak: 94, pts: 28, reb: 7, ast: 5, stl: 0.9, blk: 1.1, threes: 2.2 },
  { id: "wilt", name: "Wilt Chamberlain", pos: "C", era: "60s Celtic", peak: 93, pts: 30, reb: 23, ast: 4, stl: 1.2, blk: 3.5, threes: 0 },
  { id: "kareem", name: "Kareem Abdul-Jabbar", pos: "C", era: "Showtime", peak: 93, pts: 25, reb: 11, ast: 4, stl: 0.9, blk: 2.6, threes: 0 },
  { id: "sga", name: "Shai Gilgeous-Alexander", pos: "G", era: "Positionless", peak: 93, pts: 32, reb: 5, ast: 6, stl: 1.7, blk: 0.9, threes: 2.2 },
  { id: "luka", name: "Luka Doncic", pos: "G", era: "Positionless", peak: 93, pts: 32, reb: 9, ast: 9, stl: 1.3, blk: 0.5, threes: 3.2 },
  { id: "wemby", name: "Victor Wembanyama", pos: "C", era: "Positionless", peak: 92, pts: 24, reb: 11, ast: 4, stl: 1.2, blk: 3.6, threes: 2.2 },
  { id: "kawhi", name: "Kawhi Leonard", pos: "F", era: "Positionless", peak: 92, pts: 25, reb: 7, ast: 4, stl: 1.8, blk: 0.6, threes: 2.0 },
  { id: "pippen", name: "Scottie Pippen", pos: "F", era: "90s East", peak: 90, pts: 20, reb: 8, ast: 6, stl: 2.0, blk: 0.9, threes: 1.0 },
  { id: "dirk", name: "Dirk Nowitzki", pos: "F", era: "2000s", peak: 90, pts: 25, reb: 9, ast: 3, stl: 0.9, blk: 0.9, threes: 1.6 },
  { id: "stockton", name: "John Stockton", pos: "G", era: "90s East", peak: 89, pts: 14, reb: 3, ast: 12, stl: 2.5, blk: 0.2, threes: 0.8 },
  { id: "malone", name: "Karl Malone", pos: "F", era: "90s East", peak: 89, pts: 26, reb: 10, ast: 4, stl: 1.4, blk: 0.8, threes: 0.1 },
  { id: "nash", name: "Steve Nash", pos: "G", era: "2000s", peak: 88, pts: 17, reb: 3, ast: 11, stl: 0.8, blk: 0.1, threes: 1.5 },
  { id: "garnett", name: "Kevin Garnett", pos: "F", era: "2000s", peak: 91, pts: 21, reb: 12, ast: 5, stl: 1.4, blk: 1.6, threes: 0.3 },
  { id: "ivey", name: "Allen Iverson", pos: "G", era: "2000s", peak: 90, pts: 28, reb: 4, ast: 6, stl: 2.2, blk: 0.2, threes: 1.1 },
  { id: "wade", name: "Dwyane Wade", pos: "G", era: "2000s", peak: 90, pts: 26, reb: 5, ast: 7, stl: 1.7, blk: 1.0, threes: 0.7 },
  { id: "aja", name: "A'ja Wilson", pos: "F", era: "Positionless", peak: 93, pts: 27, reb: 12, ast: 3, stl: 1.5, blk: 2.4, threes: 0.8 },
  { id: "sabrina", name: "Sabrina Ionescu", pos: "G", era: "Positionless", peak: 88, pts: 19, reb: 5, ast: 6, stl: 1.1, blk: 0.3, threes: 2.8 },
  { id: "cade", name: "Cade Cunningham", pos: "G", era: "Positionless", peak: 90, pts: 26, reb: 6, ast: 9, stl: 1.0, blk: 0.6, threes: 2.1 },
  { id: "tatum", name: "Jayson Tatum", pos: "F", era: "Positionless", peak: 91, pts: 27, reb: 8, ast: 5, stl: 1.0, blk: 0.6, threes: 3.0 },
  { id: "ant", name: "Anthony Edwards", pos: "G", era: "Positionless", peak: 90, pts: 27, reb: 6, ast: 5, stl: 1.3, blk: 0.6, threes: 3.1 },
];

export const PLAYERS_BY_ID = Object.fromEntries(PLAYERS.map((p) => [p.id, p])) as Record<string, Player>;

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

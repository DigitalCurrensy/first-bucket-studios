import { PLAYERS, type Player } from "@/lib/nba";

export const CATS = ["PTS", "3s", "REB", "AST", "STL", "BLK"] as const;
export type Cat = (typeof CATS)[number];

export const TOOLS = [
  { id: "week", label: "This Week" },
  { id: "tiers", label: "Tiers" },
  { id: "stream", label: "Stream" },
  { id: "cut", label: "The Cut" },
  { id: "pace", label: "Pace" },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

/** Six counting cats. We do not invent FT% or TO on this desk. */
export function sixScore(player: Player) {
  return Math.round(
    player.pts + player.reb * 1.2 + player.ast * 1.4 + player.stl * 3 + player.blk * 3 + player.threes * 2,
  );
}

export type TierRow = { player: Player; score: number; rank: number };

export function rankPlayers(players: Player[] = PLAYERS): TierRow[] {
  return [...players]
    .map((player) => ({ player, score: sixScore(player) }))
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function buildTiers(players: Player[] = PLAYERS) {
  const current = players.filter((p) => p.era === "Positionless");
  const ranked = rankPlayers(current);
  return [
    { id: 1, label: "T1", blurb: "Week-winning floor.", rows: ranked.slice(0, 4) },
    { id: 2, label: "T2", blurb: "Every week, no debate.", rows: ranked.slice(4, 9) },
    { id: 3, label: "T3", blurb: "The cut line lives here.", rows: ranked.slice(9) },
  ];
}

export type StreamRow = {
  name: string;
  team: string;
  pos: string;
  games: number;
  b2b: boolean;
  cats: Cat[];
  why: string;
};

export const STREAMS: StreamRow[] = [
  { name: "Jalen Williams", team: "OKC", pos: "F", games: 4, b2b: false, cats: ["PTS", "STL", "REB"], why: "Four games, secondary creation, soft interiors." },
  { name: "Naz Reid", team: "MIN", pos: "C", games: 4, b2b: false, cats: ["REB", "BLK", "3s"], why: "Frontcourt run if the starter sits a half." },
  { name: "Payton Pritchard", team: "BOS", pos: "G", games: 4, b2b: false, cats: ["3s", "PTS"], why: "Threes and minutes if the offense stalls." },
  { name: "Bench big vs pace-up", team: "ATL", pos: "C", games: 4, b2b: false, cats: ["REB", "BLK"], why: "Four games, live-ball pace, cheap boards." },
  { name: "Cade Cunningham", team: "DET", pos: "G", games: 4, b2b: true, cats: ["PTS", "AST", "STL"], why: "Volume holds. Stream only if you are thin at guard." },
  { name: "Sabrina Ionescu", team: "NYL", pos: "G", games: 3, b2b: false, cats: ["3s", "AST"], why: "Threes travel. Three games is still a stream in 3s." },
];

export const CUTS = [
  { name: "Star wing on a B2B", team: "LAL", pos: "F", games: 2, why: "Two games plus rest risk. The cut is the back half." },
  { name: "Empty-stat big", team: "CHI", pos: "C", games: 3, why: "Boards without blocks or a counting cat you are losing." },
  { name: "Road-only guard", team: "UTA", pos: "G", games: 2, why: "Thin slate, no threes, no steals. Dead roster spot." },
  { name: "Jayson Tatum", team: "BOS", pos: "F", games: 3, why: "Not a cut in most rooms — sit the B2B, do not drop." },
];

export const LEAN = [
  { cat: "3s" as Cat, tilt: "Up", note: "Four-game wings. Live-ball nights." },
  { cat: "BLK" as Cat, tilt: "Up", note: "A three-game block spike still wins the week." },
  { cat: "PTS" as Cat, tilt: "Mid", note: "Stars on two games do not carry the column." },
  { cat: "AST" as Cat, tilt: "Down", note: "Thin at the point. Do not stream empty assists." },
];

export function streamsFor(cat: Cat | "ALL") {
  if (cat === "ALL") return STREAMS;
  return STREAMS.filter((row) => row.cats.includes(cat));
}

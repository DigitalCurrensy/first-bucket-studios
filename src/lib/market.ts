import { currentBook, PLAYERS_BY_ID, type Player } from "./nba.ts";
import { weekDensity } from "./schedule.ts";
import { weekKey } from "./studio-save.ts";
import { weekRows } from "./week.ts";

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

export function catValue(player: Player, cat: Cat) {
  switch (cat) {
    case "PTS":
      return player.pts;
    case "3s":
      return player.threes;
    case "REB":
      return player.reb;
    case "AST":
      return player.ast;
    case "STL":
      return player.stl;
    case "BLK":
      return player.blk;
  }
}

export type TierRow = { player: Player; score: number; rank: number };

export function rankPlayers(players: Player[] = currentBook()): TierRow[] {
  return [...players]
    .map((player) => ({ player, score: sixScore(player) }))
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function buildTiers(players: Player[] = currentBook()) {
  const ranked = rankPlayers(players);
  return [
    { id: 1, label: "T1", blurb: "Week-winning floor.", rows: ranked.slice(0, 4) },
    { id: 2, label: "T2", blurb: "Every week, no debate.", rows: ranked.slice(4, 9) },
    { id: 3, label: "T3", blurb: "The cut line lives here.", rows: ranked.slice(9, 24) },
  ];
}

export type StreamRow = {
  id: string;
  name: string;
  team: string;
  pos: string;
  games: number;
  b2b: boolean;
  cats: Cat[];
  why: string;
};

function catsOf(player: Player): Cat[] {
  const scored = CATS.map((cat) => ({ cat, n: catValue(player, cat) })).sort((a, b) => b.n - a.n);
  return scored.slice(0, 3).map((row) => row.cat);
}

export function streamRows(week = weekKey()): StreamRow[] {
  return weekRows(week)
    .filter((row) => row.call === "STREAM")
    .map((row) => {
      const player = PLAYERS_BY_ID[row.id];
      return {
        id: row.id,
        name: row.name,
        team: row.team,
        pos: row.pos,
        games: row.games,
        b2b: row.b2b,
        cats: player ? catsOf(player) : ["PTS"],
        why: row.why,
      };
    });
}

export const STREAMS = streamRows("2026-W35");

export type CutRow = {
  id: string;
  name: string;
  team: string;
  pos: string;
  games: number;
  why: string;
};

export function cutRows(week = weekKey()): CutRow[] {
  const fromWeek = weekRows(week)
    .filter((row) => row.call === "SIT" || ["vuc", "claxton", "keyonte", "tatum"].includes(row.id))
    .map((row) => ({
      id: row.id,
      name: row.name,
      team: row.team,
      pos: row.pos,
      games: row.games,
      why:
        row.id === "tatum"
          ? "Not a cut in most rooms — sit the B2B, do not drop."
          : row.why,
    }));
  return fromWeek.slice(0, 6);
}

export const CUTS = cutRows("2026-W35");

export const LEAN = [
  { cat: "3s" as Cat, tilt: "Up", note: "Four-game wings. Live-ball nights." },
  { cat: "BLK" as Cat, tilt: "Up", note: "A three-game block spike still wins the week." },
  { cat: "PTS" as Cat, tilt: "Mid", note: "Stars on two games do not carry the column." },
  { cat: "AST" as Cat, tilt: "Down", note: "Thin at the point. Do not stream empty assists." },
];

export function streamsFor(cat: Cat | "ALL", week = weekKey()) {
  const rows = streamRows(week);
  if (cat === "ALL") return rows;
  return rows.filter((row) => row.cats.includes(cat));
}

export function paceBoard(week = weekKey()) {
  return weekDensity(week);
}

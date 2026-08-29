import { currentBook, dealFrom, hashSeed, mulberry32, PLAYERS_BY_ID, type Player } from "./nba.ts";
import { weekDensity } from "./schedule.ts";
import { weekKey } from "./studio-save.ts";

export type Call = "START" | "SIT" | "STREAM";

export type WeekRow = {
  id: string;
  name: string;
  team: string;
  pos: string;
  games: number;
  b2b: boolean;
  call: Call;
  why: string;
};

const LOCK_SIT = ["lebron", "tatum", "ant"];
const LOCK_STREAM = ["okongwu", "pritchard", "naz", "jalenw"];
const LOCK_CUT = ["vuc", "claxton", "keyonte"];
const LOCK_START = ["sga", "jokic", "wemby", "cade", "aja"];

function densityFor(week: string) {
  const rows = weekDensity(week);
  return Object.fromEntries(rows.map((row) => [row.team, row]));
}

function callFor(player: Player, games: number, b2b: boolean): Call {
  if (LOCK_SIT.includes(player.id)) return "SIT";
  if (LOCK_START.includes(player.id)) return "START";
  if (LOCK_STREAM.includes(player.id)) return "STREAM";
  if (LOCK_CUT.includes(player.id)) return "SIT";
  if (b2b && player.peak < 93) return "SIT";
  if (games >= 4 && player.peak < 90) return "STREAM";
  if (player.peak >= 90) return "START";
  return games <= 2 ? "SIT" : "STREAM";
}

function whyFor(player: Player, call: Call, games: number, b2b: boolean, home: number) {
  if (player.id === "lebron") return "Load-management week. Sit the back half. Do not cut him.";
  if (player.id === "okongwu") return "Four games, live-ball pace, cheap boards. Stream the column.";
  if (player.id === "vuc" || player.id === "claxton") return "Boards without a counting cat you are losing. Dead roster spot.";
  if (player.id === "keyonte") return "Thin slate. No threes, no steals. Sit or drop.";
  if (call === "SIT" && b2b) return "Road B2B. The second night is where minutes vanish.";
  if (call === "START") return games >= 4 ? "Four games. Usage intact. Don't get cute." : "The floor still wins a short week.";
  if (call === "STREAM") return home >= 2 ? "Home-heavy stream. Play the cat you are losing." : "If you need the cat, play him. Not a lock.";
  return "Thin games. Counting cats go quiet.";
}

export function weekRows(week = weekKey()): WeekRow[] {
  const dens = densityFor(week);
  const rng = mulberry32(hashSeed(`weekrows:${week}`));
  const locked = [...LOCK_START, ...LOCK_SIT, ...LOCK_STREAM, ...LOCK_CUT]
    .map((id) => PLAYERS_BY_ID[id])
    .filter((p): p is Player => Boolean(p));
  const rest = dealFrom(
    currentBook().filter((p) => !locked.some((row) => row.id === p.id)),
    rng,
    8,
  );
  const pool = [...locked, ...rest];
  const seen = new Set<string>();
  const rows: WeekRow[] = [];
  for (const player of pool) {
    if (seen.has(player.id)) continue;
    seen.add(player.id);
    const d = dens[player.club] ?? { games: 3, b2b: 0, home: 1, pace: "Mid" as const };
    const call = callFor(player, d.games, d.b2b > 0);
    rows.push({
      id: player.id,
      name: player.name,
      team: player.club,
      pos: player.pos,
      games: d.games,
      b2b: d.b2b > 0,
      call,
      why: whyFor(player, call, d.games, d.b2b > 0, d.home),
    });
  }
  return rows;
}

export const WEEK_ROWS = weekRows("2026-W35");

export function loveOf(week = weekKey()) {
  const rows = weekRows(week);
  const start = rows.filter((r) => r.call === "START")[0];
  return [
    { name: start?.name ?? "The axis", note: "The week is built around him. Don't get cute." },
    { name: "Four-game wings", note: "Secondary usage. Streamable. Four games is a week." },
    { name: "Blocks travel", note: "A three-game block spike still wins the column." },
  ];
}

export function hateOf(week = weekKey()) {
  const rows = weekRows(week);
  const sit = rows.find((r) => r.call === "SIT");
  return [
    { name: "Thin-game stars", note: "Two games plus rest risk is how you lose counting cats." },
    { name: sit?.name ?? "Road B2B heroes", note: "The second night is where minutes vanish." },
    { name: "Empty-stat streams", note: "If they don't help a category you are losing, skip." },
  ];
}

export const LOVE = loveOf("2026-W35");
export const HATE = hateOf("2026-W35");

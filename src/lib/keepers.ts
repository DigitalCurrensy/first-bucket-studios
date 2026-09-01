import { clubAbbr, currentBook, FRANCHISES, rngFrom, type Player, type Pos, WNBA_FRANCHISES } from "./nba.ts";
import { weekDensity } from "./schedule.ts";
import { buildTape } from "./tape.ts";

export type KeepCall = "KEEP" | "TRADE" | "CUT";

export type KeeperRow = {
  id: string;
  name: string;
  team: string;
  pos: string;
  note: string;
  peak: number;
};

export const KEEP_CALLS: KeepCall[] = ["KEEP", "TRADE", "CUT"];

export function keeperNote(player: Player) {
  if (player.peak >= 94) return "Title player. KEEP unless the return is a farm.";
  if (player.peak >= 90) return "First-round usage. KEEP is the default.";
  if (player.shelf === "wnba" && player.peak >= 84) return "Counts in both rooms. KEEP the minutes.";
  if (player.pos === "C" && player.peak >= 86) return "Paint cats. Hard to replace.";
  if (player.pos === "G" && player.peak >= 86) return "Volume. KEEP in a six-cat.";
  if (player.peak >= 84) return "Hold. One sit night is not a TRADE.";
  if (player.peak >= 80) return "TRADE if a contender overpays. Not a CUT.";
  return "Stream or move. Peak is not a decade.";
}

export function keeperRows(pool: Player[] = currentBook()): KeeperRow[] {
  return [...pool]
    .sort((a, b) => b.peak - a.peak || a.name.localeCompare(b.name))
    .map((player) => ({
      id: player.id,
      name: player.name,
      team: player.club,
      pos: player.pos,
      note: keeperNote(player),
      peak: player.peak,
    }));
}

/** KEEP first, need-first 2G/2F/1C. Holes prefer this week’s Tape UPs. Seeded to the week. */
export function keepFive(
  marks: Record<string, KeepCall | string>,
  week: string,
  pool: Player[] = currentBook(),
): Player[] {
  const kept = pool.filter((p) => marks[p.id] === "KEEP");
  if (kept.length === 0) return [];
  const rng = rngFrom(`keep-five:${week}`);
  const up = new Set(buildTape(week, pool).filter((row) => row.mark === "UP").map((row) => row.player.id));
  const jitter = new Map(pool.map((p) => [p.id, rng()] as const));
  const five: Player[] = [];
  const used = new Set<string>();
  const rank = (player: Player) => (up.has(player.id) ? 20 : 0) + player.peak + (jitter.get(player.id) ?? 0);
  const take = (want: Pos, from: Player[]) => {
    const next = from
      .filter((p) => p.pos === want && !used.has(p.id))
      .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name))[0];
    if (!next) return false;
    used.add(next.id);
    five.push(next);
    return true;
  };
  take("G", kept);
  take("G", kept);
  take("F", kept);
  take("F", kept);
  take("C", kept);
  for (const player of [...kept].sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name))) {
    if (five.length >= 5) break;
    if (used.has(player.id)) continue;
    used.add(player.id);
    five.push(player);
  }
  const open = pool.filter((p) => !used.has(p.id) && marks[p.id] !== "CUT");
  while (five.length < 5) {
    const counts: Record<Pos, number> = { G: 0, F: 0, C: 0 };
    for (const p of five) counts[p.pos] += 1;
    const want: Pos = counts.G < 2 ? "G" : counts.F < 2 ? "F" : counts.C < 1 ? "C" : "G";
    const pick = open
      .filter((p) => !used.has(p.id) && p.pos === want)
      .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name))[0]
      ?? open.filter((p) => !used.has(p.id)).sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name))[0];
    if (!pick) break;
    used.add(pick.id);
    five.push(pick);
  }
  return five.slice(0, 5);
}

export function keepWalkTeam(week: string, wnba = false) {
  const clubs = wnba ? WNBA_FRANCHISES : FRANCHISES;
  const rows = [...weekDensity(week, clubs)].sort((a, b) => b.games - a.games || a.team.localeCompare(b.team));
  const code = rows[0]?.team ?? (wnba ? "LVA" : "LAL");
  if (wnba) return WNBA_FRANCHISES.find((name) => clubAbbr(name) === code) ?? "Aces";
  return FRANCHISES.find((name) => clubAbbr(name) === code) ?? "Lakers";
}

export function keepWalkPlan(week: string, five: Player[]) {
  const wnba = five.filter((p) => p.shelf === "wnba").length >= 3;
  return {
    wnba,
    team: keepWalkTeam(week, wnba),
    era: "Positionless" as const,
    luck: "Even" as const,
    ids: five.map((p) => p.id),
  };
}

/** Legacy twelve. Do not use as the desk. Tests and copy may mention the names. */
export const KEEPER_ROWS: KeeperRow[] = keeperRows().slice(0, 12);
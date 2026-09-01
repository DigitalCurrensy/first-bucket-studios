import { clubAbbr, FRANCHISES, rngFrom, nbaBook, WNBA_FRANCHISES, type Player } from "./nba.ts";
import { weekDensity } from "./schedule.ts";
import { weekKey } from "./studio-save.ts";

export type Mark = "UP" | "FLAT" | "DOWN";

export type TapeRow = {
  player: Player;
  mark: Mark;
  heat: 1 | 2 | 3;
  note: string;
};

function noteFor(player: Player, mark: Mark) {
  const paint = player.pos === "C" ? "the paint" : player.pos === "F" ? "the wing" : "the ball";
  const room = player.shelf === "wnba" ? "Both rooms count." : "The week is the print.";
  if (mark === "UP") {
    if (player.peak >= 92) return `${player.club}. Usage held. ${paint} is still theirs.`;
    if (player.pos === "C") return `${player.club}. Blocks travel. ${room}`;
    return `${player.club}. Four games is a week. ${paint} is live.`;
  }
  if (mark === "DOWN") {
    if (player.peak >= 90) return `${player.club}. Road B2B. Sit the name, keep the peak.`;
    return `${player.club}. Thin slate. Counting cats go quiet on ${paint}.`;
  }
  if (player.peak >= 88) return `${player.club}. Floor is the same. Ceiling waits. ${room}`;
  return `${player.club}. Minutes intact. That's the whole note on ${paint}.`;
}

function weekOf(key: string) {
  return key.replace(/:wnba$/, "");
}

function takeSome<T>(list: T[], n: number, rng: () => number) {
  const copy = [...list];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    const i = Math.floor(rng() * Math.min(3, copy.length));
    out.push(copy.splice(i, 1)[0]!);
  }
  return out;
}

/** Density-first. Heavy slate UP. Thin / B2B DOWN. Same week → same 12. */
export function buildTape(key = weekKey(), pool: Player[] = nbaBook()): TapeRow[] {
  const rng = rngFrom(`tape:${key}`);
  const wnba = key.endsWith(":wnba") || pool.every((p) => p.shelf === "wnba");
  const dens = weekDensity(weekOf(key), wnba ? WNBA_FRANCHISES : FRANCHISES);
  const by = Object.fromEntries(dens.map((row) => [row.team, row]));
  const scored = [...pool]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((player) => {
      const d = by[clubAbbr(player.club)] ?? { games: 2, b2b: 0 };
      let score = d.games * 12 + player.peak * 0.12;
      if (d.b2b) score -= 7;
      return { player, games: d.games, b2b: d.b2b, score };
    });
  scored.sort((a, b) => b.score - a.score || a.player.id.localeCompare(b.player.id));
  const heavy = scored.filter((row) => row.games >= (wnba ? 3 : 4) || (row.games >= 3 && !row.b2b));
  const thin = scored.filter((row) => row.b2b || row.games <= 2);
  const mid = scored.filter((row) => !heavy.includes(row) && !thin.includes(row));
  const picked = [
    ...takeSome(heavy, 4, rng).map((row) => ({ ...row, mark: "UP" as const })),
    ...takeSome(mid.length ? mid : scored, 4, rng).map((row) => ({ ...row, mark: "FLAT" as const })),
    ...takeSome(thin.length ? thin : [...scored].reverse(), 4, rng).map((row) => ({ ...row, mark: "DOWN" as const })),
  ];
  const seen = new Set<string>();
  const rows: TapeRow[] = [];
  for (const row of picked) {
    if (seen.has(row.player.id)) continue;
    seen.add(row.player.id);
    const heat = (row.games >= 4 ? 3 : row.games <= 2 ? 1 : 2) as 1 | 2 | 3;
    rows.push({ player: row.player, mark: row.mark, heat, note: noteFor(row.player, row.mark) });
    if (rows.length >= 12) break;
  }
  for (const row of scored) {
    if (rows.length >= 12) break;
    if (seen.has(row.player.id)) continue;
    seen.add(row.player.id);
    const mark: Mark = row.b2b || row.games <= 2 ? "DOWN" : row.games >= 4 ? "UP" : "FLAT";
    rows.push({ player: row.player, mark, heat: 2, note: noteFor(row.player, mark) });
  }
  const rank = { UP: 0, FLAT: 1, DOWN: 2 };
  return rows.sort((a, b) => rank[a.mark] - rank[b.mark] || b.heat - a.heat);
}

export function markLine(row: TapeRow) {
  return `${row.player.name} is ${row.mark} on The Tape. ${row.note} First Bucket Studio.`;
}
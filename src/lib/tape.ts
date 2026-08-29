import { hashSeed, mulberry32, type Player } from "./nba.ts";
import { currentPlayers } from "./slate.ts";
import { weekKey } from "./studio-save.ts";

export type Mark = "UP" | "FLAT" | "DOWN";

export type TapeRow = {
  player: Player;
  mark: Mark;
  heat: 1 | 2 | 3;
  note: string;
};

const UP_NOTES = [
  "The usage held. The night is still his.",
  "Four games is a week. Don't get cute.",
  "The walk is real. The passing is the cover.",
  "Blocks travel. The tape noticed.",
];

const FLAT_NOTES = [
  "The floor is the same. The ceiling waits.",
  "A three-game week is not a movement.",
  "Hold. The room already priced the burst.",
  "Minutes are intact. That's the whole note.",
];

const DOWN_NOTES = [
  "Road B2B. The second night is where it dies.",
  "Thin schedule. Counting cats go quiet.",
  "The role is the question. Sit the mark.",
  "Load management week. Don't chase the name.",
];

const NOTES: Record<Mark, readonly string[]> = {
  UP: UP_NOTES,
  FLAT: FLAT_NOTES,
  DOWN: DOWN_NOTES,
};

function pickMark(rng: () => number): Mark {
  const n = rng();
  if (n < 0.34) return "UP";
  if (n < 0.72) return "FLAT";
  return "DOWN";
}

export function buildTape(key = weekKey(), pool: Player[] = currentPlayers()): TapeRow[] {
  const rng = mulberry32(hashSeed(`tape:${key}`));
  const copy = [...pool];
  const rows: TapeRow[] = [];
  const n = Math.min(12, copy.length);
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    const player = copy.splice(idx, 1)[0]!;
    const mark = pickMark(rng);
    const heat = (1 + Math.floor(rng() * 3)) as 1 | 2 | 3;
    const notes = NOTES[mark];
    const note = notes[Math.floor(rng() * notes.length)]!;
    rows.push({ player, mark, heat, note });
  }
  const rank = { UP: 0, FLAT: 1, DOWN: 2 };
  return rows.sort((a, b) => rank[a.mark] - rank[b.mark] || b.heat - a.heat);
}

export function markLine(row: TapeRow) {
  return `${row.player.name} is ${row.mark} on The Tape. ${row.note} First Bucket Studio.`;
}

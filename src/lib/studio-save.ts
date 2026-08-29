import type { Recap } from "./recap.ts";
import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel } from "./nba.ts";

const KEY = "fbs.v1";
const VERSION = 3;

export type SavedRun = {
  id: string;
  at: number;
  mode: "82-0" | "daily" | "goat" | "16-0" | "corners";
  team: string;
  era: string;
  wins: number;
  roster: string[];
  luck?: string;
  walk?: string;
  recap?: Recap;
};

export type StudioSave = {
  version: number;
  theme: "light" | "night";
  streak: number;
  lastDaily: string | null;
  bestWins: number;
  runs: SavedRun[];
  walks: string[];
  boardTiers: Record<string, 1 | 2 | 3>;
  keepers: Record<string, "KEEP" | "TRADE" | "CUT">;
  tapePins: string[];
};

export const emptySave = (): StudioSave => ({
  version: VERSION,
  theme: "night",
  streak: 0,
  lastDaily: null,
  bestWins: 0,
  runs: [],
  walks: [],
  boardTiers: {},
  keepers: {},
  tapePins: [],
});

function migrate(raw: StudioSave): StudioSave {
  const next = { ...emptySave(), ...raw, version: VERSION };
  if ((raw.version ?? 0) < 2) next.theme = "night";
  if (!Array.isArray(next.walks)) next.walks = [];
  return next;
}

export function loadSave(): StudioSave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    return migrate(JSON.parse(raw) as StudioSave);
  } catch {
    return emptySave();
  }
}

export function writeSave(next: StudioSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

export function bestFrom(runs: SavedRun[], mode: SavedRun["mode"]) {
  let best = 0;
  for (const run of runs) {
    if (run.mode === mode && run.wins > best) best = run.wins;
  }
  return best;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function yesterdayKey(d = new Date()) {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

/** ISO week, UTC. Tape / Slate / Brief share this. Daily stays on todayKey. */
export function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${pad2(week)}`;
}

export function recordRun(run: SavedRun, dailyStamp?: string) {
  const save = loadSave();
  const runs = [run, ...save.runs].slice(0, 24);
  const season = run.mode === "82-0" || run.mode === "daily" || run.mode === "corners";
  const bestWins = season ? Math.max(save.bestWins, run.wins) : save.bestWins;
  let streak = save.streak;
  let lastDaily = save.lastDaily;
  if (run.mode === "daily" && dailyStamp && lastDaily !== dailyStamp) {
    streak = lastDaily === yesterdayKey() ? streak + 1 : 1;
    lastDaily = dailyStamp;
  }
  const walks = run.walk ? [run.walk, ...save.walks.filter((id) => id !== run.walk)].slice(0, 48) : save.walks;
  const next = { ...save, runs, bestWins, streak, lastDaily, walks };
  writeSave(next);
  return next;
}

export function rememberWalk(id: string) {
  const save = loadSave();
  const walks = [id, ...save.walks.filter((item) => item !== id)].slice(0, 48);
  const next = { ...save, walks };
  writeSave(next);
  return next;
}

export function writeKeepers(keepers: StudioSave["keepers"]) {
  const save = loadSave();
  const next = { ...save, keepers };
  writeSave(next);
  return next;
}

export function writeTapePins(tapePins: string[]) {
  const save = loadSave();
  const next = { ...save, tapePins };
  writeSave(next);
  return next;
}

export function exportStudio() {
  return JSON.stringify({ ...loadSave(), exportedAt: Date.now() }, null, 2);
}

export function importStudio(raw: string) {
  const parsed = JSON.parse(raw) as StudioSave;
  if (!parsed || typeof parsed !== "object") throw new Error("Not a studio file");
  const next = migrate(parsed);
  writeSave(next);
  return next;
}

export function formatRun(run: SavedRun) {
  if (run.mode === "goat") return `${run.wins} · ${goatLabel(run.wins)}`;
  if (run.mode === "16-0") return `${playoffLine(run.wins)} · ${playoffLabel(run.wins)}`;
  return `${recordLine(run.wins)} · ${winLabel(run.wins)}`;
}

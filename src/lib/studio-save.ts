import type { Recap } from "@/lib/recap";
import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel } from "@/lib/nba";

const KEY = "fbs.v1";
const VERSION = 1;

export type SavedRun = {
  id: string;
  at: number;
  mode: "82-0" | "daily" | "goat" | "16-0";
  team: string;
  era: string;
  wins: number;
  roster: string[];
  recap?: Recap;
};

export type StudioSave = {
  version: number;
  theme: "light" | "night";
  streak: number;
  lastDaily: string | null;
  bestWins: number;
  runs: SavedRun[];
  boardTiers: Record<string, 1 | 2 | 3>;
  keepers: Record<string, "KEEP" | "TRADE" | "CUT">;
  tapePins: string[];
};

export const emptySave = (): StudioSave => ({
  version: VERSION,
  theme: "light",
  streak: 0,
  lastDaily: null,
  bestWins: 0,
  runs: [],
  boardTiers: {},
  keepers: {},
  tapePins: [],
});

function migrate(raw: StudioSave): StudioSave {
  return { ...emptySave(), ...raw, version: VERSION };
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

export function recordRun(run: SavedRun, dailyStamp?: string) {
  const save = loadSave();
  const runs = [run, ...save.runs].slice(0, 24);
  const season = run.mode === "82-0" || run.mode === "daily";
  const bestWins = season ? Math.max(save.bestWins, run.wins) : save.bestWins;
  let streak = save.streak;
  let lastDaily = save.lastDaily;
  if (run.mode === "daily" && dailyStamp && lastDaily !== dailyStamp) {
    streak = lastDaily === yesterdayKey() ? streak + 1 : 1;
    lastDaily = dailyStamp;
  }
  const next = { ...save, runs, bestWins, streak, lastDaily };
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

export function formatRun(run: SavedRun) {
  if (run.mode === "goat") return `${run.wins} · ${goatLabel(run.wins)}`;
  if (run.mode === "16-0") return `${playoffLine(run.wins)} · ${playoffLabel(run.wins)}`;
  return `${recordLine(run.wins)} · ${winLabel(run.wins)}`;
}

import type { Recap } from "./recap.ts";
import { copyText, presentFile, saveCardFile } from "./deliver.ts";
import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel } from "./nba.ts";
import { storeGet, storeSet } from "./safe-store.ts";

const KEY = "fbs.v1";
const VERSION = 7;
const SAVE_EVENT = "fbs-save";
const PIN_CAP = 6;

export type SavedNight = { win: boolean; us?: number; them?: number; opp?: string; home?: boolean };

export type SavedRun = {
  id: string;
  at: number;
  mode: "82-0" | "daily" | "goat" | "16-0" | "corners" | "wnba";
  team: string;
  era: string;
  wins: number;
  roster: string[];
  luck?: string;
  walk?: string;
  recap?: Recap;
  nights?: SavedNight[];
};

export type SavedMock = {
  youSlot: number;
  board: Array<string | null>;
  at: number;
};

export type SavedTrade = {
  you: string[];
  them: string[];
  at: number;
};

export type LastScrub = {
  n: number;
  us?: number;
  them?: number;
  opp?: string;
  home?: boolean;
  team?: string;
};

export type StudioSave = {
  version: number;
  theme: "light" | "night";
  streak: number;
  lastDaily: string | null;
  bestWins: number;
  runs: SavedRun[];
  walks: string[];
  pins: string[];
  boardTiers: Record<string, 1 | 2 | 3>;
  keepers: Record<string, "KEEP" | "TRADE" | "CUT">;
  tapePins: string[];
  mock?: SavedMock | null;
  lastTrade?: SavedTrade | null;
  capNote?: string;
  lastDeskWeek?: string | null;
  exportedAt?: number | null;
  lastScrub?: LastScrub | null;
};

export const emptySave = (): StudioSave => ({
  version: VERSION,
  theme: "night",
  streak: 0,
  lastDaily: null,
  bestWins: 0,
  runs: [],
  walks: [],
  pins: [],
  boardTiers: {},
  keepers: {},
  tapePins: [],
  mock: null,
  lastTrade: null,
  capNote: "",
  lastDeskWeek: null,
  exportedAt: null,
  lastScrub: null,
});

function migrate(raw: StudioSave): StudioSave {
  const next = { ...emptySave(), ...raw, version: VERSION };
  if ((raw.version ?? 0) < 2) next.theme = "night";
  if (!Array.isArray(next.walks)) next.walks = [];
  if (!Array.isArray(next.pins)) next.pins = [];
  if (!next.mock) next.mock = null;
  if (!next.lastTrade) next.lastTrade = null;
  if (typeof next.capNote !== "string") next.capNote = "";
  if (typeof next.lastDeskWeek !== "string") next.lastDeskWeek = next.lastDeskWeek ?? null;
  if (typeof next.exportedAt !== "number") next.exportedAt = next.exportedAt ?? null;
  if (!next.lastScrub) next.lastScrub = null;
  return next;
}

export function loadSave(): StudioSave {
  try {
    const raw = storeGet(KEY) ?? storeGet(`${KEY}.bak`);
    if (!raw) return emptySave();
    return migrate(JSON.parse(raw) as StudioSave);
  } catch {
    return emptySave();
  }
}

export function writeSave(next: StudioSave) {
  try {
    const blob = JSON.stringify(next);
    storeSet(KEY, blob);
    storeSet(`${KEY}.bak`, blob);
    void persistStudio();
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SAVE_EVENT));
  } catch {
    /* private mode */
  }
}

export function onSaveChange(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SAVE_EVENT, fn);
  return () => window.removeEventListener(SAVE_EVENT, fn);
}

let persistAsked = false;
function persistStudio() {
  if (persistAsked || typeof navigator === "undefined") return;
  persistAsked = true;
  void navigator.storage?.persist?.();
}

if (typeof window !== "undefined") {
  const flushBak = () => {
    try {
      const raw = storeGet(KEY);
      if (raw) storeSet(`${KEY}.bak`, raw);
    } catch {
      /* ignore */
    }
  };
  window.addEventListener("pagehide", flushBak);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushBak();
  });
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
  const dropped = save.runs.length >= 24;
  const nights = run.nights?.map((n) => ({
    win: n.win,
    us: n.us,
    them: n.them,
    opp: n.opp,
    home: n.home,
  }));
  const stored: SavedRun = { ...run, nights };
  const runs = [stored, ...save.runs].slice(0, 24);
  const season = run.mode === "82-0" || run.mode === "daily" || run.mode === "corners" || run.mode === "wnba";
  const bestWins = season ? Math.max(save.bestWins, run.wins) : save.bestWins;
  let streak = save.streak;
  let lastDaily = save.lastDaily;
  if (run.mode === "daily" && dailyStamp && lastDaily !== dailyStamp) {
    streak = lastDaily === yesterdayKey() ? streak + 1 : 1;
    lastDaily = dailyStamp;
  }
  const walks = run.walk ? [run.walk, ...save.walks.filter((id) => id !== run.walk)].slice(0, 48) : save.walks;
  const capNote = dropped ? "Oldest 25th poster dropped." : save.capNote;
  const next = { ...save, runs, bestWins, streak, lastDaily, walks, capNote };
  writeSave(next);
  void import("./ledger.ts").then((mod) => mod.ledgerPut(stored)).catch(() => {});
  return next;
}

export function rememberWalk(id: string) {
  const save = loadSave();
  const dropped = save.walks.length >= 48 && !save.walks.includes(id);
  const walks = [id, ...save.walks.filter((item) => id !== item)].slice(0, 48);
  const next = { ...save, walks, capNote: dropped ? "Oldest 49th walk dropped." : save.capNote };
  writeSave(next);
  return next;
}

export function isPinned(id: string) {
  if (!id) return false;
  return loadSave().pins.includes(id);
}

export function pinWalk(id: string) {
  if (!id) return loadSave();
  const save = loadSave();
  const pins = [id, ...save.pins.filter((item) => item !== id)].slice(0, PIN_CAP);
  const next = { ...save, pins };
  writeSave(next);
  return next;
}

export function unpinWalk(id: string) {
  const save = loadSave();
  const next = { ...save, pins: save.pins.filter((item) => item !== id) };
  writeSave(next);
  return next;
}

export function togglePin(id: string) {
  return isPinned(id) ? unpinWalk(id) : pinWalk(id);
}

export function writeKeepers(keepers: StudioSave["keepers"]) {
  const save = loadSave();
  writeSave({ ...save, keepers });
}

export function writeTapePins(tapePins: string[]) {
  const save = loadSave();
  writeSave({ ...save, tapePins });
}

export function writeMock(mock: SavedMock | null) {
  writeSave({ ...loadSave(), mock });
}

export function writeLastDesk(week: string) {
  writeSave({ ...loadSave(), lastDeskWeek: week });
}

export function writeLastTrade(lastTrade: SavedTrade | null) {
  writeSave({ ...loadSave(), lastTrade });
}

export function writeLastScrub(scrub: LastScrub) {
  writeSave({ ...loadSave(), lastScrub: scrub });
}

export function attemptsFor(ids: string[], mode?: SavedRun["mode"] | SavedRun["mode"][]) {
  const key = [...ids].sort().join(",");
  const modes = mode ? (Array.isArray(mode) ? mode : [mode]) : null;
  return loadSave()
    .runs.filter((run) => {
      if ([...run.roster].sort().join(",") !== key) return false;
      if (!modes) return true;
      return modes.includes(run.mode);
    })
    .slice(0, 12);
}

export function markExported() {
  const save = loadSave();
  writeSave({ ...save, exportedAt: Date.now() });
}

export async function downloadStudioFile() {
  markExported();
  const blob = new Blob([exportStudio()], { type: "application/json" });
  presentFile(blob, "first-bucket-studio.json", "Desk file. Load it on another desk.");
  void saveCardFile(blob, "first-bucket-studio.json").catch(() => {});
}

export function needsExportNag(save = loadSave()) {
  return save.runs.length >= 3 && !save.exportedAt;
}

export async function copyStudioJson() {
  markExported();
  const ok = await copyText(exportStudio());
  if (!ok) throw new Error("Couldn’t copy");
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
  if (run.mode === "wnba") return `${recordLine(run.wins, 40)} · ${winLabel(run.wins, 40)}`;
  return `${recordLine(run.wins)} · ${winLabel(run.wins)}`;
}

export function markJustFiled() {
  try {
    sessionStorage.setItem("fbs.justFiled", "1");
  } catch {
    /* private mode */
  }
}

export function justFiled() {
  try {
    return sessionStorage.getItem("fbs.justFiled") === "1";
  } catch {
    return false;
  }
}

export type StreakHole = {
  date: string;
  state: "played" | "missed" | "today";
};

export function shiftKey(iso: string, delta: number) {
  const [y, mo, d] = iso.split("-").map(Number);
  const dt = new Date(y ?? 2026, (mo ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + delta);
  return todayKey(dt);
}

/** Seven holes ending today. Played = consecutive streak ending at lastDaily. */
export function streakStrip(today = todayKey(), lastDaily: string | null = null, streak = 0): StreakHole[] {
  const holes: StreakHole[] = [];
  const played = new Set<string>();
  if (lastDaily && streak > 0) {
    for (let i = 0; i < streak; i += 1) played.add(shiftKey(lastDaily, -i));
  }
  for (let i = 6; i >= 0; i -= 1) {
    const date = shiftKey(today, -i);
    if (date === today && !played.has(date)) holes.push({ date, state: "today" });
    else holes.push({ date, state: played.has(date) ? "played" : "missed" });
  }
  return holes;
}

export function nextTuesdayLabel(week = weekKey()) {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  const now = new Date();
  let year = now.getFullYear();
  let w = 1;
  if (m) {
    year = Number(m[1]);
    w = Number(m[2]);
  }
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (day - 1) + (w - 1) * 7);
  const tuesday = new Date(monday);
  tuesday.setUTCDate(monday.getUTCDate() + 1);
  if (tuesday.getTime() < Date.now()) tuesday.setUTCDate(tuesday.getUTCDate() + 7);
  return tuesday.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

function tuesdayUtc(week: string) {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  const year = m ? Number(m[1]) : new Date().getUTCFullYear();
  const w = m ? Number(m[2]) : 1;
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (day - 1) + (w - 1) * 7);
  const tuesday = new Date(monday);
  tuesday.setUTCDate(monday.getUTCDate() + 1);
  return tuesday;
}

export function tuesdayIcs(week = weekKey()) {
  const tuesday = tuesdayUtc(week);
  const y = tuesday.getUTCFullYear();
  const mo = pad2(tuesday.getUTCMonth() + 1);
  const d = pad2(tuesday.getUTCDate());
  const start = `${y}${mo}${d}`;
  const endDt = new Date(tuesday);
  endDt.setUTCDate(tuesday.getUTCDate() + 1);
  const end = `${endDt.getUTCFullYear()}${pad2(endDt.getUTCMonth() + 1)}${pad2(endDt.getUTCDate())}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//First Bucket Studio//Tape//EN",
    "BEGIN:VEVENT",
    `DTSTAMP:${start}T150000Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    "SUMMARY:First Bucket · The Tape",
    "DESCRIPTION:Tape, Brief, Daily. Editorial. Not a sportsbook.",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadTuesdayIcs(week = weekKey()) {
  const blob = new Blob([tuesdayIcs(week)], { type: "text/calendar" });
  presentFile(blob, `first-bucket-tape-${week}.ics`, `First Bucket Tape · ${week}`);
}

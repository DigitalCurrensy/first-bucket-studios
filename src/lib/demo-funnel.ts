/** Local demo funnel. No accounts. Nothing leaves this device. */

export const DEMO_BEATS = [
  "home",
  "rip",
  "room",
  "foil",
  "lock",
  "card",
  "tray",
  "save",
  "copy",
  "open",
] as const;

export type DemoBeat = (typeof DEMO_BEATS)[number];

export type DemoEvent = {
  beat: DemoBeat;
  at: number;
  ms: number;
  note?: string;
};

export type DemoLog = {
  version: 1;
  started: number;
  events: DemoEvent[];
};

export type DemoFunnel = {
  order: DemoBeat[];
  missing: DemoBeat[];
  toCardMs: number | null;
  toTrayMs: number | null;
  toSendMs: number | null;
  sent: boolean;
};

const KEY = "fbs.demo";

export function emptyDemoLog(): DemoLog {
  return { version: 1, started: 0, events: [] };
}

export function foldFunnel(events: DemoEvent[]): DemoFunnel {
  const first = new Map<DemoBeat, DemoEvent>();
  for (const event of events) {
    if (!first.has(event.beat)) first.set(event.beat, event);
  }
  const order = DEMO_BEATS.filter((beat) => first.has(beat));
  const origin = first.get("home")?.at ?? events[0]?.at;
  const card = first.get("card");
  const tray = first.get("tray");
  const success = first.get("save") ?? first.get("copy");
  const delta = (event: DemoEvent | undefined) =>
    event && origin != null ? event.at - origin : null;
  return {
    order,
    missing: DEMO_BEATS.filter((beat) => !first.has(beat)),
    toCardMs: delta(card),
    toTrayMs: delta(tray),
    toSendMs: delta(success),
    sent: Boolean(success),
  };
}

function readLog(): DemoLog {
  if (typeof window === "undefined") return emptyDemoLog();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyDemoLog();
    const parsed = JSON.parse(raw) as DemoLog;
    if (parsed.version !== 1 || !Array.isArray(parsed.events)) return emptyDemoLog();
    return parsed;
  } catch {
    return emptyDemoLog();
  }
}

function writeLog(log: DemoLog) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    /* private mode */
  }
  expose(log);
}

function expose(log: DemoLog) {
  if (typeof window === "undefined") return;
  (window as Window & { __fbsDemo?: { log: DemoLog; funnel: DemoFunnel } }).__fbsDemo = {
    log,
    funnel: foldFunnel(log.events),
  };
}

export function demoSnapshot() {
  const log = readLog();
  return { log, funnel: foldFunnel(log.events) };
}

export function demoReset() {
  writeLog(emptyDemoLog());
}

export function markDemo(beat: DemoBeat, note?: string) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const log = readLog();
  if (!log.started) log.started = now;
  log.events.push({
    beat,
    at: now,
    ms: now - log.started,
    note,
  });
  writeLog(log);
}

if (typeof window !== "undefined") {
  expose(readLog());
}

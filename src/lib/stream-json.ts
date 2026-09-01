/** NDJSON for the ninety-second loop. One object per line. Not Claude's MCP. */

import { DEMO_BEATS, foldFunnel, type DemoBeat, type DemoFunnel, type DemoLog } from "./demo-funnel.ts";
import { HOUSE_WALK_ID } from "./house-pack.ts";

export { HOUSE_WALK_ID };

export const STREAM_VERSION = 1 as const;
export const STREAM_STUDIO = "first-bucket" as const;

export type StreamInit = {
  type: "system";
  subtype: "init";
  version: typeof STREAM_VERSION;
  studio: typeof STREAM_STUDIO;
  at: number;
};

export type StreamBeat = {
  type: "beat";
  beat: DemoBeat;
  ms: number;
  note?: string;
};

export type StreamWalk = {
  type: "walk";
  id: string;
  live: boolean;
};

export type StreamResult = {
  type: "result";
  ok: boolean;
  ms: number;
  walk?: string;
  funnel?: DemoFunnel;
  error?: string;
};

export type StreamMsg = StreamInit | StreamBeat | StreamWalk | StreamResult;

export function encodeLine(msg: StreamMsg): string {
  return JSON.stringify(msg);
}

export function decodeLine(line: string): StreamMsg | null {
  const raw = line.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StreamMsg;
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return null;
    if (parsed.type === "system") {
      if (parsed.subtype !== "init" || parsed.studio !== STREAM_STUDIO) return null;
      return parsed;
    }
    if (parsed.type === "beat") {
      if (!(DEMO_BEATS as readonly string[]).includes(parsed.beat)) return null;
      return parsed;
    }
    if (parsed.type === "walk") {
      if (typeof parsed.id !== "string" || !parsed.id) return null;
      return parsed;
    }
    if (parsed.type === "result") {
      if (typeof parsed.ok !== "boolean") return null;
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function decodeStream(text: string): StreamMsg[] {
  return text
    .split(/\n/)
    .map(decodeLine)
    .filter((msg): msg is StreamMsg => Boolean(msg));
}

export function streamFromLog(log: DemoLog, extra?: { walk?: string; ms?: number; ok?: boolean; error?: string }): StreamMsg[] {
  const started = log.started || log.events[0]?.at || Date.now();
  const lines: StreamMsg[] = [
    { type: "system", subtype: "init", version: STREAM_VERSION, studio: STREAM_STUDIO, at: started },
  ];
  const seen = new Set<DemoBeat>();
  for (const event of log.events) {
    if (seen.has(event.beat)) continue;
    seen.add(event.beat);
    lines.push({
      type: "beat",
      beat: event.beat,
      ms: event.ms,
      note: event.note,
    });
  }
  const walk = extra?.walk ?? log.events.find((event) => event.beat === "card")?.note;
  if (walk) {
    lines.push({
      type: "walk",
      id: walk.replace(/^\/walk\//, ""),
      live: walk.replace(/^\/walk\//, "") !== HOUSE_WALK_ID,
    });
  }
  const funnel = foldFunnel(log.events);
  lines.push({
    type: "result",
    ok: extra?.ok ?? (funnel.order.includes("card") && funnel.sent),
    ms: extra?.ms ?? (log.events.at(-1)?.ms ?? 0),
    walk: walk ? `/walk/${walk.replace(/^\/walk\//, "")}` : undefined,
    funnel,
    error: extra?.error,
  });
  return lines;
}

export function writeStream(msgs: StreamMsg[], write = (line: string) => process.stdout.write(line)): void {
  for (const msg of msgs) write(`${encodeLine(msg)}\n`);
}

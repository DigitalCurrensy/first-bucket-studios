import { LUCKS } from "./luck.ts";
import {
  ABBR,
  clubAbbr,
  dealFrom,
  ERAS,
  FRANCHISES,
  rngFrom,
  pickIndex,
  nbaBook,
  PLAYERS_BY_ID,
  wnbaBook,
  WNBA_ABBR,
  WNBA_FRANCHISES,
  type Era,
  type Franchise,
  type Player,
  type WnbaClub,
} from "./nba.ts";
import { seasonWalk, wnbaWalk } from "./sim.ts";
import { pad2, todayKey } from "./studio-save.ts";

export type WalkKind = "season" | "goat" | "playoff" | "wnba";

export type WalkPayload = {
  kind: WalkKind;
  team: string;
  era: string;
  luck: string;
  wins: number;
  ids: string[];
  of: number;
};

const ERA_BY_SLUG = Object.fromEntries(ERAS.map((era) => [slug(era), era])) as Record<string, Era>;
const TEAM_BY_ABBR = Object.fromEntries(Object.entries(ABBR).map(([name, code]) => [code, name])) as Record<
  string,
  Franchise
>;
const WNBA_BY_ABBR = Object.fromEntries(Object.entries(WNBA_ABBR).map(([name, code]) => [code, name])) as Record<
  string,
  WnbaClub
>;
const LUCK_BY_SLUG = Object.fromEntries(LUCKS.map((luck) => [slug(luck), luck]));

export function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function rosterKey(ids: string[]) {
  return [...ids].sort().join(",");
}

export function encodeWalk(payload: {
  team: string;
  era: string;
  luck: string;
  wins: number;
  ids: string[];
}) {
  const abbr = clubAbbr(payload.team);
  const ids = [...payload.ids].sort().join("~");
  return `v1.${abbr}.${slug(payload.era)}.${slug(payload.luck)}.${payload.wins}.${ids}`;
}

export function encodeGoatWalk(payload: { wins: number; ids: string[] }) {
  const ids = [...payload.ids].sort().join("~");
  return `v2.goat.${payload.wins}.${ids}`;
}

export function encodePlayoffWalk(payload: {
  team: string;
  era: string;
  luck: string;
  wins: number;
  ids: string[];
}) {
  const abbr = clubAbbr(payload.team);
  const ids = [...payload.ids].sort().join("~");
  return `v2.playoff.${abbr}.${slug(payload.era)}.${slug(payload.luck)}.${payload.wins}.${ids}`;
}

export function encodeWnbaWalk(payload: {
  team: string;
  era: string;
  luck: string;
  wins: number;
  ids: string[];
}) {
  const abbr = clubAbbr(payload.team);
  const ids = [...payload.ids].sort().join("~");
  return `v2.wnba.${abbr}.${slug(payload.era)}.${slug(payload.luck)}.${payload.wins}.${ids}`;
}

function fiveIds(raw: string) {
  const ids = raw.split("~").filter(Boolean);
  if (ids.length !== 5) return null;
  if (!ids.every((key) => PLAYERS_BY_ID[key])) return null;
  return ids;
}

export function decodeWalk(id: string): WalkPayload | null {
  const v2goat = /^v2\.goat\.(\d+)\.([a-z0-9~-]+)$/i.exec(id);
  if (v2goat) {
    const ids = fiveIds(v2goat[2]!);
    const wins = Number(v2goat[1]);
    if (!ids || !Number.isFinite(wins)) return null;
    return { kind: "goat", team: "GOAT Five", era: "All-time", luck: "Even", wins, ids, of: 0 };
  }

  const v2playoff = /^v2\.playoff\.([A-Z0-9]{3})\.([a-z0-9-]+)\.([a-z]+)\.(\d+)\.([a-z0-9~-]+)$/i.exec(id);
  if (v2playoff) {
    const team = TEAM_BY_ABBR[v2playoff[1]!.toUpperCase()];
    const era = ERA_BY_SLUG[v2playoff[2]!];
    const luck = LUCK_BY_SLUG[v2playoff[3]!] ?? v2playoff[3];
    const wins = Number(v2playoff[4]);
    const ids = fiveIds(v2playoff[5]!);
    if (!team || !era || !ids || !Number.isFinite(wins)) return null;
    return { kind: "playoff", team, era, luck: luck as string, wins, ids, of: 16 };
  }

  const v2wnba = /^v2\.wnba\.([A-Z0-9]{3})\.([a-z0-9-]+)\.([a-z]+)\.(\d+)\.([a-z0-9~-]+)$/i.exec(id);
  if (v2wnba) {
    const team = WNBA_BY_ABBR[v2wnba[1]!.toUpperCase()];
    const era = ERA_BY_SLUG[v2wnba[2]!];
    const luck = LUCK_BY_SLUG[v2wnba[3]!] ?? v2wnba[3];
    const wins = Number(v2wnba[4]);
    const ids = fiveIds(v2wnba[5]!);
    if (!team || !era || !ids || !Number.isFinite(wins)) return null;
    return { kind: "wnba", team, era, luck: luck as string, wins, ids, of: 40 };
  }

  const v2season = /^v2\.season\.([A-Z0-9]{3})\.([a-z0-9-]+)\.([a-z]+)\.(\d+)\.([a-z0-9~-]+)$/i.exec(id);
  const v1 = /^v1\.([A-Z0-9]{3})\.([a-z0-9-]+)\.([a-z]+)\.(\d+)\.([a-z0-9~-]+)$/i.exec(id);
  const match = v2season ?? v1;
  if (!match) return null;
  const team = TEAM_BY_ABBR[match[1]!.toUpperCase()];
  const era = ERA_BY_SLUG[match[2]!];
  const luck = LUCK_BY_SLUG[match[3]!] ?? match[3];
  const ids = fiveIds(match[5]!);
  const wins = Number(match[4]);
  if (!team || !era || !ids || !Number.isFinite(wins)) return null;
  return { kind: "season", team, era, luck: luck as string, wins, ids, of: 82 };
}

export function playersOf(ids: string[]) {
  return ids.map((id) => PLAYERS_BY_ID[id]).filter((p): p is Player => Boolean(p));
}

export function dailyRoom(date = todayKey()) {
  const rng = rngFrom(`daily:${date}`);
  return {
    date,
    team: pickIndex(rng, FRANCHISES),
    era: pickIndex(rng, ERAS),
    luck: pickIndex(rng, LUCKS),
    pack: dealFrom(nbaBook(), rng, 10),
  };
}

export function houseWalk(date = todayKey()) {
  const room = dailyRoom(date);
  const rng = rngFrom(`house:${date}`);
  const five = dealFrom(room.pack, rng, 5);
  const walk = seasonWalk(room.team, room.era, five, room.luck);
  const id = encodeWalk({
    team: room.team,
    era: room.era,
    luck: room.luck,
    wins: walk.wins,
    ids: five.map((p) => p.id),
  });
  return { room, five, walk, id };
}

export function dailyRoomWnba(date = todayKey()) {
  const rng = rngFrom(`daily-wnba:${date}`);
  return {
    date,
    team: pickIndex(rng, WNBA_FRANCHISES),
    era: pickIndex(rng, ERAS),
    luck: pickIndex(rng, LUCKS),
    pack: dealFrom(wnbaBook(), rng, 10),
  };
}

export function houseWalkWnba(date = todayKey()) {
  const room = dailyRoomWnba(date);
  const rng = rngFrom(`house-wnba:${date}`);
  const five = dealFrom(room.pack, rng, 5);
  const walk = wnbaWalk(room.team, room.era, five, room.luck);
  const id = encodeWnbaWalk({
    team: room.team,
    era: room.era,
    luck: room.luck,
    wins: walk.wins,
    ids: five.map((p) => p.id),
  });
  return { room, five, walk, id };
}

export function shiftDate(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export function houseWalkDates(n = 14, from = todayKey()) {
  return Array.from({ length: n }, (_, i) => shiftDate(from, -i));
}

export function walkHref(id: string) {
  return `/walk/${encodeURIComponent(id)}`;
}

/** Preview / local hosts. A URL with this origin is not pasteable to anyone else. */
export function isEphemeralOrigin(origin?: string) {
  const raw = origin ?? (typeof window === "undefined" ? "" : window.location?.origin);
  if (!raw || raw === "null") return true;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
    if (host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com")) return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * URL you can paste. Path-only on sandbox/localhost so we never hand someone
 * a grok-sandbox host. Origin+path on a real public host.
 */
export function walkUrl(id: string) {
  const path = walkHref(id);
  if (typeof window === "undefined") return path;
  const origin = window.location?.origin;
  if (!origin || origin === "null" || isEphemeralOrigin(origin)) return path;
  return `${origin}${path}`;
}

/** Public booth. Social posts always point here, never a sandbox host. */
export const LIVE_ORIGIN = "https://first-bucket-studios.vercel.app";

export function publicWalkUrl(id: string) {
  const path = walkHref(id);
  if (typeof window === "undefined") return `${LIVE_ORIGIN}${path}`;
  const origin = window.location?.origin;
  if (origin && origin !== "null" && !isEphemeralOrigin(origin)) return `${origin}${path}`;
  return `${LIVE_ORIGIN}${path}`;
}

export function walkIdFromHref(href: string) {
  if (!href) return "";
  try {
    const path = href.startsWith("http") ? new URL(href).pathname : href;
    const match = /\/walk\/([^/?#]+)/.exec(path);
    return match ? decodeURIComponent(match[1]!) : "";
  } catch {
    return "";
  }
}

export function encodeChallengeIds(ids: string[]) {
  return [...ids].sort().join("~");
}

export function decodeChallengeIds(raw: unknown) {
  if (Array.isArray(raw)) {
    const ids = raw.filter((key): key is string => typeof key === "string");
    if (ids.length !== 5) return undefined;
    if (!ids.every((key) => PLAYERS_BY_ID[key])) return undefined;
    return ids;
  }
  if (typeof raw !== "string") return undefined;
  const ids = raw.split("~").filter(Boolean);
  if (ids.length !== 5) return undefined;
  if (!ids.every((key) => PLAYERS_BY_ID[key])) return undefined;
  return ids;
}

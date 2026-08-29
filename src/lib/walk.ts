import { LUCKS } from "./luck.ts";
import {
  ABBR,
  clubAbbr,
  dealFrom,
  ERAS,
  FRANCHISES,
  hashSeed,
  mulberry32,
  pickIndex,
  PLAYERS,
  PLAYERS_BY_ID,
  type Era,
  type Franchise,
  type Player,
} from "./nba.ts";
import { seasonWalk } from "./sim.ts";
import { todayKey } from "./studio-save.ts";

export type WalkPayload = {
  team: Franchise;
  era: Era;
  luck: string;
  wins: number;
  ids: string[];
};

const ERA_BY_SLUG = Object.fromEntries(ERAS.map((era) => [slug(era), era])) as Record<string, Era>;
const TEAM_BY_ABBR = Object.fromEntries(Object.entries(ABBR).map(([name, code]) => [code, name])) as Record<
  string,
  Franchise
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

export function decodeWalk(id: string): WalkPayload | null {
  const match = /^v1\.([A-Z0-9]{3})\.([a-z0-9-]+)\.([a-z]+)\.(\d+)\.([a-z0-9~-]+)$/i.exec(id);
  if (!match) return null;
  const [, abbr, eraSlug, luckSlug, winsRaw, idsRaw] = match;
  const team = TEAM_BY_ABBR[abbr!.toUpperCase()];
  const era = ERA_BY_SLUG[eraSlug!];
  const luck = LUCK_BY_SLUG[luckSlug!] ?? luckSlug;
  const ids = idsRaw!.split("~").filter(Boolean);
  const wins = Number(winsRaw);
  if (!team || !era || ids.length !== 5 || !Number.isFinite(wins)) return null;
  if (!ids.every((key) => PLAYERS_BY_ID[key])) return null;
  return { team, era, luck: luck as string, wins, ids };
}

export function playersOf(ids: string[]) {
  return ids.map((id) => PLAYERS_BY_ID[id]).filter((p): p is Player => Boolean(p));
}

export function dailyRoom(date = todayKey()) {
  const rng = mulberry32(hashSeed(`daily:${date}`));
  return {
    date,
    team: pickIndex(rng, FRANCHISES),
    era: pickIndex(rng, ERAS),
    luck: pickIndex(rng, LUCKS),
    pack: dealFrom(PLAYERS, rng, 10),
  };
}

export function houseWalk(date = todayKey()) {
  const room = dailyRoom(date);
  const rng = mulberry32(hashSeed(`house:${date}`));
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

export function walkHref(id: string) {
  return `/walk/${encodeURIComponent(id)}`;
}

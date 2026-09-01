import { clubAbbr, FRANCHISES, rngFrom } from "./nba.ts";
import { weekFileOf } from "./weeks/index.ts";

export type Slot = {
  n: number;
  opp: string;
  home: boolean;
  b2b: boolean;
};

/** Nights for a room. Same franchise+era+of → same skeleton. Roster only changes the coin. */
export function seasonSkeleton(team: string, era: string, of = 82, clubs: readonly string[] = FRANCHISES): Slot[] {
  const nbaDefault = of === 82 && clubs === FRANCHISES;
  const rng = rngFrom(nbaDefault ? `sked:${team}:${era}` : `sked:${team}:${era}:${of}`);
  const us = clubAbbr(team);
  const opps = clubs.map((name) => clubAbbr(name)).filter((code) => code !== us);
  const bag: string[] = [];
  if (opps.length === 0) {
    for (let i = 0; i < of; i++) bag.push("OPP");
  } else {
    const base = Math.floor(of / opps.length);
    for (const opp of opps) {
      for (let i = 0; i < base; i++) bag.push(opp);
    }
    while (bag.length < of) bag.push(opps[Math.floor(rng() * opps.length)]!);
  }
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = bag[i]!;
    bag[i] = bag[j]!;
    bag[j] = a;
  }

  const home = Array.from({ length: of }, (_, i) => i < of / 2);
  for (let i = home.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = home[i]!;
    home[i] = home[j]!;
    home[j] = a;
  }

  const slots: Slot[] = bag.slice(0, of).map((opp, i) => ({
    n: i + 1,
    opp,
    home: Boolean(home[i]),
    b2b: false,
  }));

  const target = Math.max(4, Math.round(of * (14 + Math.floor(rng() * 5)) / 82));
  let count = 0;
  let i = 1;
  while (i < of && count < target) {
    if (rng() < 0.4 && !slots[i - 1]?.b2b) {
      slots[i]!.b2b = true;
      count += 1;
      i += 2;
    } else {
      i += 1;
    }
  }
  return slots;
}

export function sitSet(team: string, era: string, luck: string, rosterKey: string, of = 82) {
  const rng = rngFrom(of === 82 ? `sits:${team}:${era}:${luck}:${rosterKey}` : `sits:${team}:${era}:${luck}:${rosterKey}:${of}`);
  let n = of === 82 ? 8 + Math.floor(rng() * 5) : Math.round((8 + Math.floor(rng() * 5)) * (of / 82));
  if (luck === "Thin") n += of === 82 ? 3 : 2;
  if (luck === "Steel") n -= 2;
  if (luck === "Hot") n -= 1;
  n = Math.max(of === 82 ? 4 : 2, Math.min(of === 82 ? 16 : Math.round(of * 0.2), n));
  const sits = new Set<number>();
  while (sits.size < n) sits.add(1 + Math.floor(rng() * of));
  return sits;
}

export type Density = {
  team: string;
  games: number;
  b2b: number;
  home: number;
  pace: "Live-ball" | "Mid" | "Half-court";
};

/** Editorial week density. Authored file wins. Else a seeded generator. Not a total. Not a line. */
export function weekDensity(week: string, clubs: readonly string[] = FRANCHISES): Density[] {
  const stamp = week.replace(/:wnba$/, "");
  const nba = clubs === FRANCHISES;
  const authored = weekFileOf(stamp);
  const rows = authored ? (nba ? authored.nba : authored.wnba) : null;
  if (rows && rows.length) {
    const by = Object.fromEntries(rows.map((row) => [row.team, row]));
    return clubs.map((name) => {
      const team = clubAbbr(name);
      const hit = by[team];
      if (hit) return { team, games: hit.games, b2b: hit.b2b, home: hit.home, pace: hit.pace };
      return { team, games: 2, b2b: 0, home: 1, pace: "Mid" as const };
    });
  }
  const rng = rngFrom(nba ? `density:${stamp}` : `density:${stamp}:wnba`);
  const codes = clubs.map((name) => clubAbbr(name));
  const span = nba ? 3 : 2;
  return codes.map((team) => {
    const games = 2 + Math.floor(rng() * span);
    const b2b = rng() < (nba ? 0.42 : 0.28) ? 1 : 0;
    const home = Math.min(games, Math.floor(games / 2) + (rng() < 0.5 ? 1 : 0));
    const pace: Density["pace"] = rng() < 0.34 ? "Live-ball" : rng() < 0.5 ? "Mid" : "Half-court";
    return { team, games, b2b, home, pace };
  });
}
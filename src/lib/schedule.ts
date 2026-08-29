import { clubAbbr, FRANCHISES, hashSeed, mulberry32 } from "./nba.ts";

export type Slot = {
  n: number;
  opp: string;
  home: boolean;
  b2b: boolean;
};

/** 82 nights for a room. Same franchise+era → same skeleton. Roster only changes the coin. */
export function seasonSkeleton(team: string, era: string, of = 82): Slot[] {
  const rng = mulberry32(hashSeed(`sked:${team}:${era}`));
  const us = clubAbbr(team);
  const opps = FRANCHISES.map((name) => clubAbbr(name)).filter((code) => code !== us);
  const bag: string[] = [];
  const base = Math.floor(of / opps.length);
  for (const opp of opps) {
    for (let i = 0; i < base; i++) bag.push(opp);
  }
  while (bag.length < of) bag.push(opps[Math.floor(rng() * opps.length)]!);
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

  const target = 14 + Math.floor(rng() * 5);
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
  const rng = mulberry32(hashSeed(`sits:${team}:${era}:${luck}:${rosterKey}`));
  let n = 8 + Math.floor(rng() * 5);
  if (luck === "Thin") n += 3;
  if (luck === "Steel") n -= 2;
  if (luck === "Hot") n -= 1;
  n = Math.max(4, Math.min(16, n));
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

/** Editorial week density. Not a total. Not a line. */
export function weekDensity(week: string): Density[] {
  const rng = mulberry32(hashSeed(`density:${week}`));
  const paces = ["Live-ball", "Mid", "Half-court"] as const;
  return FRANCHISES.map((team) => {
    const games = 2 + Math.floor(rng() * 3);
    const b2b = rng() < 0.4 && games >= 3 ? 1 : 0;
    const home = Math.min(games, Math.floor(rng() * (games + 1)));
    return {
      team: clubAbbr(team),
      games,
      b2b,
      home,
      pace: paces[Math.floor(rng() * paces.length)]!,
    };
  });
}

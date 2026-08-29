import { luckShift } from "./luck.ts";
import { clubAbbr, hashSeed, mulberry32, playoffWins, projectWins, type Player } from "./nba.ts";
import { seasonSkeleton, sitSet } from "./schedule.ts";

export const PLAYOFF_ROUNDS = ["First round", "Second round", "Conference finals", "Finals"] as const;

export type Night = {
  n: number;
  opp: string;
  home: boolean;
  win: boolean;
  us: number;
  them: number;
  b2b?: boolean;
  sit?: boolean;
  round?: string;
};

function score(rng: () => number, win: boolean) {
  const base = 94 + Math.floor(rng() * 24);
  const margin = 2 + Math.floor(rng() * 17);
  return win ? { us: base + margin, them: base } : { us: base, them: base + margin };
}

function nightP(base: number, home: boolean, b2b: boolean, sit: boolean, run: number) {
  let p = base;
  if (home) p += 0.04;
  else p -= 0.02;
  if (b2b) p -= 0.05;
  if (sit) p -= 0.08;
  if (run >= 3) p += 0.015;
  if (run <= -3) p -= 0.015;
  return Math.max(0.12, Math.min(0.94, p));
}

function seedKey(roster: Player[]) {
  return [...roster.map((r) => r.id)].sort().join(",");
}

export function seasonWalk(team: string, era: string, roster: Player[], luck = "Even") {
  const projected = projectWins(roster, era);
  const key = seedKey(roster);
  const rng = mulberry32(hashSeed(`season:${team}:${era}:${luck}:${key}`));
  const slots = seasonSkeleton(team, era);
  const sits = sitSet(team, era, luck, key);
  const us = clubAbbr(team);
  const base = projected / 82 + luckShift(luck);
  const nights: Night[] = [];
  let wins = 0;
  let run = 0;
  for (const slot of slots) {
    const sit = sits.has(slot.n);
    const p = nightP(base, slot.home, slot.b2b, sit, run);
    const win = rng() < p;
    if (win) {
      wins += 1;
      run = run > 0 ? run + 1 : 1;
    } else {
      run = run < 0 ? run - 1 : -1;
    }
    const box = score(rng, win);
    nights.push({
      n: slot.n,
      opp: slot.opp,
      home: slot.home,
      win,
      us: box.us,
      them: box.them,
      b2b: slot.b2b,
      sit,
    });
  }
  return { projected, p: base, nights, wins, us };
}

function seriesHome(gameInSeries: number) {
  return gameInSeries === 1 || gameInSeries === 2 || gameInSeries === 5 || gameInSeries === 7;
}

export function playoffWalk(team: string, era: string, roster: Player[], luck = "Even") {
  const projected = playoffWins(roster);
  const key = seedKey(roster);
  const p = Math.max(0.2, Math.min(0.8, 0.28 + projected * 0.03 + luckShift(luck)));
  const rng = mulberry32(hashSeed(`playoff:${team}:${era}:${luck}:${key}`));
  const us = clubAbbr(team);
  const bag = seasonSkeleton(team, era).map((s) => s.opp);
  const nights: Night[] = [];
  const rounds: { round: string; taken: boolean; wins: number; losses: number }[] = [];
  let total = 0;
  let n = 0;
  for (const round of PLAYOFF_ROUNDS) {
    let w = 0;
    let l = 0;
    const opp = bag[Math.floor(rng() * bag.length)]!;
    while (w < 4 && l < 4) {
      const win = rng() < p;
      if (win) w += 1;
      else l += 1;
      n += 1;
      const box = score(rng, win);
      nights.push({
        n,
        opp,
        home: seriesHome(w + l),
        win,
        us: box.us,
        them: box.them,
        round,
      });
    }
    total += w;
    const taken = w === 4;
    rounds.push({ round, taken, wins: w, losses: l });
    if (!taken) break;
  }
  return { projected, p, nights, wins: total, rounds, us };
}

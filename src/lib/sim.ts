import { luckShift } from "./luck.ts";
import { clubAbbr, rngFrom, playoffWins, projectWins, WNBA_FRANCHISES, type Player } from "./nba.ts";
import { seasonSkeleton, sitSet } from "./schedule.ts";

export const PLAYOFF_ROUNDS = ["First round", "Second round", "Conference finals", "Finals"] as const;
export const WNBA_NIGHTS = 40;

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

function walkNights(
  team: string,
  era: string,
  roster: Player[],
  luck: string,
  of: number,
  clubs?: readonly string[],
  tag = "season",
) {
  const projected = projectWins(roster, era, of);
  const key = seedKey(roster);
  const rng = rngFrom(`${tag}:${team}:${era}:${luck}:${key}`);
  const slots = seasonSkeleton(team, era, of, clubs);
  const sits = sitSet(team, era, luck, key, of);
  const us = clubAbbr(team);
  const base = projected / of + luckShift(luck);
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
  return { projected, p: base, nights, wins, us, of };
}

export function seasonWalk(team: string, era: string, roster: Player[], luck = "Even") {
  return walkNights(team, era, roster, luck, 82, undefined, "season");
}

/** Forty nights. Honest WNBA length. Not an 82 in a different jersey. */
export function wnbaWalk(team: string, era: string, roster: Player[], luck = "Even") {
  return walkNights(team, era, roster, luck, WNBA_NIGHTS, WNBA_FRANCHISES, "wnba");
}

function seriesHome(gameInSeries: number) {
  return gameInSeries === 1 || gameInSeries === 2 || gameInSeries === 5 || gameInSeries === 7;
}

export function playoffWalk(team: string, era: string, roster: Player[], luck = "Even") {
  const projected = playoffWins(roster, era);
  const key = seedKey(roster);
  const p = Math.max(0.2, Math.min(0.8, 0.28 + projected * 0.03 + luckShift(luck)));
  const rng = rngFrom(`playoff:${team}:${era}:${luck}:${key}`);
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
  return { projected, p, nights, wins: total, rounds, us, of: 16 };
}
import { luckShift } from "./luck.ts";
import {
  FRANCHISES,
  hashSeed,
  mulberry32,
  playoffWins,
  projectWins,
  type Franchise,
  type Player,
} from "./nba.ts";

export const CLUB_ABBR: Record<Franchise, string> = {
  Lakers: "LAL",
  Celtics: "BOS",
  Spurs: "SAS",
  Bulls: "CHI",
  Warriors: "GSW",
  Heat: "MIA",
  Pistons: "DET",
  Knicks: "NYK",
  Suns: "PHX",
  Nuggets: "DEN",
};

export const PLAYOFF_ROUNDS = ["First round", "Second round", "Conference finals", "Finals"] as const;

export type Night = {
  n: number;
  opp: string;
  home: boolean;
  win: boolean;
  us: number;
  them: number;
  round?: string;
};

function score(rng: () => number, win: boolean) {
  const base = 94 + Math.floor(rng() * 24);
  const margin = 2 + Math.floor(rng() * 17);
  return win ? { us: base + margin, them: base } : { us: base, them: base + margin };
}

function oppsFor(team: string) {
  const us = (CLUB_ABBR as Record<string, string>)[team] ?? team.slice(0, 3).toUpperCase();
  return {
    us,
    opps: FRANCHISES.map((name) => CLUB_ABBR[name]).filter((code) => code !== us),
  };
}

export function seasonWalk(team: string, era: string, roster: Player[], luck = "Even") {
  const projected = projectWins(roster, era);
  const p = Math.max(0.16, Math.min(0.92, projected / 82 + luckShift(luck)));
  const rng = mulberry32(hashSeed(`season:${team}:${era}:${luck}:${roster.map((r) => r.id).join(",")}`));
  const { us, opps } = oppsFor(team);
  const nights: Night[] = [];
  let wins = 0;
  for (let i = 0; i < 82; i++) {
    const opp = opps[Math.floor(rng() * opps.length)]!;
    const home = rng() >= 0.5;
    const win = rng() < p;
    if (win) wins += 1;
    const box = score(rng, win);
    nights.push({ n: i + 1, opp, home, win, us: box.us, them: box.them });
  }
  return { projected, p, nights, wins, us };
}

export function playoffWalk(team: string, era: string, roster: Player[], luck = "Even") {
  const projected = playoffWins(roster);
  const p = Math.max(0.2, Math.min(0.8, 0.28 + projected * 0.03 + luckShift(luck)));
  const rng = mulberry32(hashSeed(`playoff:${team}:${era}:${luck}:${roster.map((r) => r.id).join(",")}`));
  const { us, opps } = oppsFor(team);
  const nights: Night[] = [];
  const rounds: { round: string; taken: boolean; wins: number; losses: number }[] = [];
  let total = 0;
  let n = 0;
  for (const round of PLAYOFF_ROUNDS) {
    let w = 0;
    let l = 0;
    const opp = opps[Math.floor(rng() * opps.length)]!;
    while (w < 4 && l < 4) {
      const win = rng() < p;
      if (win) w += 1;
      else l += 1;
      n += 1;
      const box = score(rng, win);
      nights.push({ n, opp, home: n % 2 === 1, win, us: box.us, them: box.them, round });
    }
    total += w;
    const taken = w === 4;
    rounds.push({ round, taken, wins: w, losses: l });
    if (!taken) break;
  }
  return { projected, p, nights, wins: total, rounds, us };
}

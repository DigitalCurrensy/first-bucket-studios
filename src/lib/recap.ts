import type { Night } from "./sim.ts";

export type Recap = {
  projected: number;
  wins: number;
  losses: number;
  streak: number;
  ending: number;
  homeW: number;
  homeL: number;
  awayW: number;
  awayL: number;
  bestLine: string;
  worstLine: string;
  exit?: string;
};

function line(n: Night) {
  return `${n.us}–${n.them} ${n.home ? "vs" : "@"} ${n.opp}`;
}

export function recapOf(nights: Night[], projected: number, exit?: string): Recap {
  let streak = 0;
  let run = 0;
  let homeW = 0;
  let homeL = 0;
  let awayW = 0;
  let awayL = 0;
  let best: Night | null = null;
  let worst: Night | null = null;

  for (const n of nights) {
    if (n.win) {
      run += 1;
      if (run > streak) streak = run;
      if (n.home) homeW += 1;
      else awayW += 1;
      if (!best || n.us - n.them > best.us - best.them) best = n;
    } else {
      run = 0;
      if (n.home) homeL += 1;
      else awayL += 1;
      if (!worst || n.them - n.us > worst.them - worst.us) worst = n;
    }
  }

  let ending = 0;
  for (let i = nights.length - 1; i >= 0; i--) {
    if (!nights[i]?.win) break;
    ending += 1;
  }

  return {
    projected,
    wins: homeW + awayW,
    losses: homeL + awayL,
    streak,
    ending,
    homeW,
    homeL,
    awayW,
    awayL,
    bestLine: best ? line(best) : "—",
    worstLine: worst ? line(worst) : "—",
    exit,
  };
}

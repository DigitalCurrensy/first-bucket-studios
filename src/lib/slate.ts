import { currentBook, dealFrom, hashSeed, mulberry32, type Player } from "./nba.ts";
import { weekDensity } from "./schedule.ts";
import { weekKey } from "./studio-save.ts";
import type { Call } from "./week.ts";

export function currentPlayers(pool: Player[] = currentBook()) {
  return pool.filter((p) => p.shelf === "current" || p.shelf === "wnba");
}

export type SlateRow = {
  player: Player;
  club: string;
  opp: string;
  home: boolean;
  b2b: boolean;
  call: Call;
  why: string;
};

export function buildSlate(key = weekKey(), pool: Player[] = currentBook()): SlateRow[] {
  const rng = mulberry32(hashSeed(`slate:${key}`));
  const dens = weekDensity(key);
  const dealt = dealFrom(currentPlayers(pool), rng, 10);
  return dealt.map((player) => {
    const club = player.club;
    const d = dens.find((row) => row.team === club);
    const oppPool = dens.map((row) => row.team).filter((code) => code !== club);
    const opp = oppPool[Math.floor(rng() * oppPool.length)] ?? "FA";
    const home = d ? d.home >= Math.ceil(d.games / 2) : rng() > 0.45;
    const b2b = d ? d.b2b > 0 : rng() < 0.32;
    const call: Call = b2b && player.peak < 93 ? "SIT" : player.peak >= 90 ? "START" : "STREAM";
    const why =
      call === "SIT"
        ? "Second night. Minutes risk. Sit."
        : call === "START" && b2b
          ? "B2B, but the floor still wins tonight."
          : call === "START"
            ? home
              ? "Home night. Usage intact."
              : "Road, but the counting cats travel."
            : "If you need the cat, play him. Not a lock.";
    return { player, club, opp, home, b2b, call, why };
  });
}

import { dealFrom, hashSeed, mulberry32, PLAYERS, type Player } from "./nba.ts";
import type { Call } from "./week.ts";

export const CLUB: Record<string, string> = {
  lebron: "LAL",
  jokic: "DEN",
  curry: "GSW",
  giannis: "MIL",
  kd: "HOU",
  sga: "OKC",
  luka: "LAL",
  wemby: "SAS",
  kawhi: "LAC",
  aja: "LVA",
  sabrina: "NYL",
  cade: "DET",
  tatum: "BOS",
  ant: "MIN",
};

const OPP = ["OKC", "DEN", "BOS", "DET", "ATL", "SAS", "MIN", "NYK", "MIA", "HOU", "MIL", "GSW", "LAC", "DAL"];

export type SlateRow = {
  player: Player;
  club: string;
  opp: string;
  home: boolean;
  b2b: boolean;
  call: Call;
  why: string;
};

export function currentPlayers(pool: Player[] = PLAYERS) {
  return pool.filter((p) => p.era === "Positionless");
}

export function buildSlate(dateKey: string, pool: Player[] = PLAYERS): SlateRow[] {
  const rng = mulberry32(hashSeed(`slate:${dateKey}`));
  const dealt = dealFrom(currentPlayers(pool), rng, 8);
  return dealt.map((player) => {
    const club = CLUB[player.id] ?? "FA";
    let opp = OPP[Math.floor(rng() * OPP.length)]!;
    if (opp === club) opp = OPP[(OPP.indexOf(opp) + 3) % OPP.length]!;
    const home = rng() > 0.45;
    const b2b = rng() < 0.32;
    const call: Call = b2b && player.peak < 93 ? "SIT" : player.peak >= 93 ? "START" : "STREAM";
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

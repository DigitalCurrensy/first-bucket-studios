import { currentBook, dealFrom, rngFrom, wnbaBook, WNBA_FRANCHISES, type Player } from "./nba.ts";
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
  games: number;
};

export function buildSlate(key = weekKey(), pool: Player[] = currentBook()): SlateRow[] {
  const rng = rngFrom(`slate:${key}:${pool[0]?.shelf ?? "nba"}`);
  const wnba = pool.length > 0 && pool.every((p) => p.shelf === "wnba");
  const dens = weekDensity(key, wnba ? WNBA_FRANCHISES : undefined);
  const dealt = dealFrom(currentPlayers(wnba ? wnbaBook() : pool), rng, 10);
  return dealt.map((player) => {
    const club = player.club;
    const d = dens.find((row) => row.team === club);
    const others = dens
      .filter((row) => row.team !== club)
      .sort((a, b) => b.games - a.games || a.team.localeCompare(b.team));
    const oppRng = rngFrom(`slate-opp:${key}:${player.id}`);
    const pick = others[Math.floor(oppRng() * Math.min(6, others.length))] ?? others[0];
    const opp = pick?.team ?? dens.find((row) => row.team !== club)?.team ?? "BYE";
    const home = d ? d.home >= Math.ceil(d.games / 2) : oppRng() > 0.45;
    const b2b = d ? d.b2b > 0 : false;
    const call: Call = b2b && player.peak < 93 ? "SIT" : player.peak >= 90 ? "START" : "STREAM";
    const why =
      call === "SIT"
        ? `${club} at ${opp}. Second night. Minutes risk. Sit.`
        : call === "START" && b2b
          ? `${club} vs ${opp}. B2B, but the floor still wins tonight.`
          : call === "START"
            ? home
              ? `${club} vs ${opp}. Home night. Usage intact.`
              : `${club} at ${opp}. Road, but the counting cats travel.`
            : `${club} vs ${opp}. If you need the cat, play them. Not a lock.`;
    return { player, club, opp, home, b2b, call, why, games: d?.games ?? 2 };
  });
}
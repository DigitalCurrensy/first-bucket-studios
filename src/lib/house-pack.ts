import type { Luck } from "./luck.ts";
import { PLAYERS_BY_ID, type Era, type Player } from "./nba.ts";
import { seasonWalk } from "./sim.ts";
import { encodeWalk } from "./walk.ts";

/** Staged 82-0 room. Same foil, same ten, same five, every time. */
export const HOUSE_PACK = {
  team: "Thunder",
  era: "Positionless" as Era,
  luck: "Even" as Luck,
  tag: "HOUSEPACK",
} as const;

/** Thunder core plus the rest of the foil. A table, not a shuffle. */
export const HOUSE_TEN_IDS = [
  "sga",
  "jalenw",
  "chet",
  "dort",
  "hartenstein",
  "caruso",
  "cason",
  "og",
  "herb",
  "mcdaniels",
] as const;

/** The marked five. The live room always walks these names. */
export const HOUSE_FIVE_IDS = ["sga", "jalenw", "chet", "dort", "hartenstein"] as const;

/** Locked walk. Optional demo via ?pack=house — never auto-pinned. */
export const HOUSE_WALK_ID = encodeWalk({
  team: HOUSE_PACK.team,
  era: HOUSE_PACK.era,
  luck: HOUSE_PACK.luck,
  wins: 51,
  ids: [...HOUSE_FIVE_IDS],
});

export function housePackSeed(): string {
  return `${HOUSE_PACK.team}:${HOUSE_PACK.era}:${HOUSE_PACK.luck}:${HOUSE_PACK.tag}`;
}

function ofIds(ids: readonly string[]): Player[] {
  return ids.map((id) => PLAYERS_BY_ID[id]).filter((p): p is Player => Boolean(p));
}

export function dealHousePack() {
  return ofIds(HOUSE_TEN_IDS);
}

/** Fold of the ten. Pinned, not drawn — the 90-second room cannot drift. */
export function dealHouseFive() {
  return ofIds(HOUSE_FIVE_IDS);
}

/**
 * Collapse the staged room. Not procgen: ids are a table, nights recompute
 * from the same five. Live packs still Fisher–Yates via dealFrom + mulberry32.
 */
export function walkHouse() {
  const ten = dealHousePack();
  const five = dealHouseFive();
  const walked = seasonWalk(HOUSE_PACK.team, HOUSE_PACK.era, five, HOUSE_PACK.luck);
  return { ten, five, walked };
}

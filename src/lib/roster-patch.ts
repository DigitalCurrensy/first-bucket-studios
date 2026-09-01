import { PLAYERS, PLAYERS_BY_ID, type Player } from "./nba.ts";

type Patch = {
  version?: number;
  upsert?: Player[];
  retire?: string[];
};

export async function loadRosterPatch() {
  if (typeof fetch === "undefined") return;
  try {
    const res = await fetch("/roster.patch.json", { cache: "no-store" });
    if (!res.ok) return;
    const patch = (await res.json()) as Patch;
    applyPatch(patch);
  } catch {
    /* optional file */
  }
}

export function applyPatch(patch: Patch) {
  for (const id of patch.retire ?? []) {
    const i = PLAYERS.findIndex((p) => p.id === id);
    if (i >= 0) PLAYERS.splice(i, 1);
    delete PLAYERS_BY_ID[id];
  }
  for (const row of patch.upsert ?? []) {
    if (!row?.id || !row.name) continue;
    const i = PLAYERS.findIndex((p) => p.id === row.id);
    if (i >= 0) PLAYERS[i] = row;
    else PLAYERS.push(row);
    PLAYERS_BY_ID[row.id] = row;
  }
}

import { dealCornersPack, dealFrom, type Player, type Pos } from "./nba.ts";

export type PosFilter = "ALL" | Pos;

export function filterPack<T extends { name: string; pos: string }>(
  pack: T[],
  query: string,
  pos: PosFilter,
): T[] {
  const q = query.trim().toLowerCase();
  return pack.filter((p) => {
    if (pos !== "ALL" && p.pos !== pos) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q);
  });
}

export { dealCornersPack, dealFrom };

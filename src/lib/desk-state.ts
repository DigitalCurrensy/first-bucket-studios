import { useEffect, useState } from "react";
import { storeGet, storeSet } from "./safe-store.ts";

const KEY = "fbs.desk.v1";

export type DeskState = {
  tape?: { league: "nba" | "wnba"; filter: string };
  slate?: { league: "nba" | "wnba"; call: string };
  keepers?: { query: string; pos: string; shelf: string };
  trade?: { query: string; tool: string };
  board?: { query: string };
  mock?: { query: string };
  gym?: { home: string; away: string };
  wall?: { tab: string };
  brief?: { league: string };
};

function read(): DeskState {
  try {
    const raw = storeGet(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DeskState;
  } catch {
    return {};
  }
}

function write(next: DeskState) {
  try {
    storeSet(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

export function loadDesk<K extends keyof DeskState>(desk: K): DeskState[K] {
  if (typeof window === "undefined") return undefined;
  return read()[desk];
}

export function saveDesk<K extends keyof DeskState>(desk: K, value: DeskState[K]) {
  if (typeof window === "undefined") return;
  write({ ...read(), [desk]: value });
}

export function useDesk<K extends keyof DeskState>(desk: K, fallback: NonNullable<DeskState[K]>) {
  const [state, setState] = useState<NonNullable<DeskState[K]>>(() => ({
    ...fallback,
    ...(typeof window === "undefined" ? undefined : loadDesk(desk)),
  }));
  useEffect(() => {
    saveDesk(desk, state);
  }, [desk, state]);
  return [state, setState] as const;
}

import type { SavedRun } from "./studio-save.ts";
import { storeGet, storeSet } from "./safe-store.ts";

const DB = "fbs-ledger";
const STORE = "runs";
const FALLBACK = "fbs-ledger.v1";

let memory: SavedRun[] = [];

function fallbackList(): SavedRun[] {
  try {
    const raw = storeGet(FALLBACK);
    if (raw) {
      const rows = JSON.parse(raw) as SavedRun[];
      if (Array.isArray(rows)) {
        memory = rows;
        return rows;
      }
    }
  } catch {
    /* keep memory */
  }
  return memory;
}

function fallbackPut(run: SavedRun) {
  const rows = [run, ...fallbackList().filter((row) => row.id !== run.id)].slice(0, 48);
  memory = rows;
  try {
    storeSet(FALLBACK, JSON.stringify(rows));
  } catch {
    /* memory only */
  }
}

function openDb(): Promise<IDBDatabase | null> {
  try {
    if (typeof indexedDB === "undefined") return Promise.resolve(null);
  } catch {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        try {
          if (!req.result.objectStoreNames.contains(STORE)) {
            req.result.createObjectStore(STORE, { keyPath: "id" });
          }
        } catch {
          /* private */
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function ledgerPut(run: SavedRun) {
  try {
    const db = await openDb();
    if (!db) {
      fallbackPut(run);
      return;
    }
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(run);
        tx.oncomplete = () => resolve();
        tx.onerror = () => {
          fallbackPut(run);
          resolve();
        };
        tx.onabort = () => {
          fallbackPut(run);
          resolve();
        };
      } catch {
        fallbackPut(run);
        resolve();
      }
    });
  } catch {
    fallbackPut(run);
  }
}

export async function ledgerList(mode?: SavedRun["mode"]): Promise<SavedRun[]> {
  try {
    const db = await openDb();
    if (!db) {
      const rows = fallbackList();
      return mode ? rows.filter((r) => r.mode === mode) : rows;
    }
    return await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () => {
          const rows = ((req.result as SavedRun[]) ?? []).sort((a, b) => b.at - a.at);
          resolve(mode ? rows.filter((r) => r.mode === mode) : rows);
        };
        req.onerror = () => {
          const rows = fallbackList();
          resolve(mode ? rows.filter((r) => r.mode === mode) : rows);
        };
      } catch {
        const rows = fallbackList();
        resolve(mode ? rows.filter((r) => r.mode === mode) : rows);
      }
    });
  } catch {
    const rows = fallbackList();
    return mode ? rows.filter((r) => r.mode === mode) : rows;
  }
}

export function deltaVsBest(wins: number, best: number) {
  if (!best) return { label: "First mark", pts: 0 };
  const d = wins - best;
  if (d > 0) return { label: `+${d} vs house best`, pts: d };
  if (d < 0) return { label: `${d} vs house best`, pts: d };
  return { label: "Even with the house best", pts: 0 };
}

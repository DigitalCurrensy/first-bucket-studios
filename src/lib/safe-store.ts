/** Private-mode and quota-safe string store. localStorage → sessionStorage → memory. */

const mem = new Map<string, string>();

export function storeGet(key: string): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      const value = localStorage.getItem(key);
      if (value != null) return value;
    }
  } catch {
    /* private / quota */
  }
  try {
    if (typeof sessionStorage !== "undefined") {
      const value = sessionStorage.getItem(key);
      if (value != null) return value;
    }
  } catch {
    /* private / quota */
  }
  return mem.get(key) ?? null;
}

export function storeSet(key: string, value: string) {
  mem.set(key, value);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(key, value);
    }
  } catch {
    /* memory only */
  }
}

import { WEEK_2026_W35, type WeekFile } from "./2026-W35.ts";

export type { WeekFile } from "./2026-W35.ts";

/** Optional authored weeks. Missing keys stay generated. */
export const WEEK_FILES: Record<string, WeekFile> = {
  "2026-W35": WEEK_2026_W35,
};

export function weekFileOf(week: string) {
  return WEEK_FILES[week.replace(/:wnba$/, "")];
}

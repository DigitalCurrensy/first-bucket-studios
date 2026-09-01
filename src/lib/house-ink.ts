/** Franchise inks. House marks, not league logos. */

import { ABBR, WNBA_ABBR } from "./nba.ts";

export type HouseInk = {
  ink: string;
  foil: string;
  flare: string;
};

const HOUSE: HouseInk = { ink: "#C5A059", foil: "#F4F1EA", flare: "#8B6B3D" };
const W_HOUSE: HouseInk = { ink: "#C5A059", foil: "#F4F1EA", flare: "#7C3AED" };

export const HOUSE_INK: Record<string, HouseInk> = {
  Hawks: { ink: "#DC2626", foil: "#EAB308", flare: "#F4F1EA" },
  Celtics: { ink: "#15803D", foil: "#C5A059", flare: "#F4F1EA" },
  Nets: { ink: "#F4F1EA", foil: "#64748B", flare: "#18181B" },
  Hornets: { ink: "#0D9488", foil: "#7E22CE", flare: "#F4F1EA" },
  Bulls: { ink: "#B91C1C", foil: "#F4F1EA", flare: "#0D0D0E" },
  Cavaliers: { ink: "#881337", foil: "#C5A059", flare: "#F4F1EA" },
  Mavericks: { ink: "#1D4ED8", foil: "#94A3B8", flare: "#0F172A" },
  Nuggets: { ink: "#1E3A8A", foil: "#EAB308", flare: "#9F1239" },
  Pistons: { ink: "#DC2626", foil: "#64748B", flare: "#1E3A8A" },
  Warriors: { ink: "#1D4ED8", foil: "#D97706", flare: "#F4F1EA" },
  Rockets: { ink: "#DC2626", foil: "#64748B", flare: "#F4F1EA" },
  Pacers: { ink: "#1E3A8A", foil: "#EAB308", flare: "#F4F1EA" },
  Clippers: { ink: "#1E3A8A", foil: "#DC2626", flare: "#38BDF8" },
  Lakers: { ink: "#6B21A8", foil: "#D97706", flare: "#F4F1EA" },
  Grizzlies: { ink: "#1E3A8A", foil: "#60A5FA", flare: "#C5A059" },
  Heat: { ink: "#B91C1C", foil: "#F59E0B", flare: "#F4F1EA" },
  Bucks: { ink: "#14532D", foil: "#C5A059", flare: "#F4F1EA" },
  Timberwolves: { ink: "#0F172A", foil: "#4ADE80", flare: "#94A3B8" },
  Pelicans: { ink: "#1E3A8A", foil: "#C5A059", flare: "#B91C1C" },
  Knicks: { ink: "#1D4ED8", foil: "#EA580C", flare: "#94A3B8" },
  Thunder: { ink: "#0284C7", foil: "#F97316", flare: "#C5A059" },
  Magic: { ink: "#1D4ED8", foil: "#94A3B8", flare: "#F4F1EA" },
  "76ers": { ink: "#1D4ED8", foil: "#DC2626", flare: "#F4F1EA" },
  Suns: { ink: "#581C87", foil: "#F97316", flare: "#C5A059" },
  "Trail Blazers": { ink: "#DC2626", foil: "#F4F1EA", flare: "#27272A" },
  Kings: { ink: "#6B21A8", foil: "#F4F1EA", flare: "#475569" },
  Spurs: { ink: "#94A3B8", foil: "#F4F1EA", flare: "#C5A059" },
  Raptors: { ink: "#BE123C", foil: "#7E22CE", flare: "#F4F1EA" },
  Jazz: { ink: "#0F172A", foil: "#6B21A8", flare: "#D97706" },
  Wizards: { ink: "#1E3A8A", foil: "#DC2626", flare: "#94A3B8" },
  Dream: { ink: "#60A5FA", foil: "#E11D48", flare: "#F4F1EA" },
  Sky: { ink: "#1E3A8A", foil: "#38BDF8", flare: "#C5A059" },
  Sun: { ink: "#EA580C", foil: "#C5A059", flare: "#F4F1EA" },
  Wings: { ink: "#0D9488", foil: "#84CC16", flare: "#F4F1EA" },
  Valkyries: { ink: "#7C3AED", foil: "#C5A059", flare: "#F4F1EA" },
  Fever: { ink: "#1D4ED8", foil: "#DC2626", flare: "#D97706" },
  Aces: { ink: "#B91C1C", foil: "#C5A059", flare: "#F4F1EA" },
  Sparks: { ink: "#6B21A8", foil: "#14B8A6", flare: "#F4F1EA" },
  Lynx: { ink: "#1E293B", foil: "#2DD4BF", flare: "#C5A059" },
  Liberty: { ink: "#2DD4BF", foil: "#C2410C", flare: "#F4F1EA" },
  Mercury: { ink: "#F97316", foil: "#581C87", flare: "#C5A059" },
  Storm: { ink: "#166534", foil: "#A3E635", flare: "#F4F1EA" },
  Mystics: { ink: "#1E40AF", foil: "#DC2626", flare: "#94A3B8" },
};

const NBA_BY: Record<string, string> = Object.fromEntries(
  Object.entries(ABBR).map(([name, code]) => [code, name]),
);
const W_BY: Record<string, string> = Object.fromEntries(
  Object.entries(WNBA_ABBR).map(([name, code]) => [code, name]),
);

/** Resolve a franchise name from a book club code or a full name. */
export function clubName(codeOrName?: string, shelf?: string) {
  if (!codeOrName) return undefined;
  if (HOUSE_INK[codeOrName]) return codeOrName;
  if (shelf === "wnba") return W_BY[codeOrName];
  return NBA_BY[codeOrName] ?? W_BY[codeOrName];
}

export function houseInk(name?: string, room?: "nba" | "wnba" | "goat" | "playoff" | "alltime" | "current"): HouseInk {
  const shelf = room === "wnba" ? "wnba" : undefined;
  const resolved = clubName(name, shelf) ?? name;
  if (resolved && HOUSE_INK[resolved]) return HOUSE_INK[resolved];
  if (room === "wnba") return W_HOUSE;
  return HOUSE;
}

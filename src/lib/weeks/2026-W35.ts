import type { Density } from "../schedule.ts";

export type WeekClub = {
  team: string;
  games: number;
  b2b: number;
  home: number;
  pace: Density["pace"];
};

export type WeekFile = {
  week: string;
  nba: WeekClub[];
  wnba: WeekClub[];
};

/** Authored 2026-W35. Editorial density. Not a total. Not a line. */
export const WEEK_2026_W35: WeekFile = {
  week: "2026-W35",
  nba: [
    { team: "OKC", games: 4, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "BOS", games: 4, b2b: 0, home: 2, pace: "Mid" },
    { team: "NYK", games: 4, b2b: 0, home: 3, pace: "Live-ball" },
    { team: "DEN", games: 4, b2b: 0, home: 2, pace: "Mid" },
    { team: "DET", games: 4, b2b: 0, home: 2, pace: "Mid" },
    { team: "SAS", games: 4, b2b: 0, home: 2, pace: "Half-court" },
    { team: "MIN", games: 4, b2b: 0, home: 2, pace: "Half-court" },
    { team: "HOU", games: 3, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "CLE", games: 3, b2b: 1, home: 1, pace: "Mid" },
    { team: "GSW", games: 3, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "MIL", games: 3, b2b: 1, home: 2, pace: "Mid" },
    { team: "DAL", games: 3, b2b: 0, home: 1, pace: "Mid" },
    { team: "CHI", games: 3, b2b: 0, home: 2, pace: "Mid" },
    { team: "ATL", games: 3, b2b: 0, home: 1, pace: "Live-ball" },
    { team: "SAC", games: 3, b2b: 1, home: 1, pace: "Live-ball" },
    { team: "MEM", games: 3, b2b: 0, home: 2, pace: "Half-court" },
    { team: "ORL", games: 3, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "NOP", games: 3, b2b: 0, home: 1, pace: "Live-ball" },
    { team: "TOR", games: 3, b2b: 1, home: 2, pace: "Mid" },
    { team: "UTA", games: 3, b2b: 0, home: 1, pace: "Half-court" },
    { team: "CHA", games: 3, b2b: 0, home: 2, pace: "Mid" },
    { team: "PHX", games: 3, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "LAL", games: 2, b2b: 1, home: 1, pace: "Half-court" },
    { team: "PHI", games: 2, b2b: 0, home: 1, pace: "Mid" },
    { team: "MIA", games: 2, b2b: 1, home: 1, pace: "Live-ball" },
    { team: "LAC", games: 2, b2b: 0, home: 1, pace: "Mid" },
    { team: "IND", games: 2, b2b: 1, home: 1, pace: "Mid" },
    { team: "BKN", games: 2, b2b: 0, home: 1, pace: "Mid" },
    { team: "POR", games: 2, b2b: 0, home: 1, pace: "Mid" },
    { team: "WAS", games: 2, b2b: 1, home: 1, pace: "Mid" },
  ],
  wnba: [
    { team: "LVA", games: 3, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "NYL", games: 3, b2b: 0, home: 2, pace: "Mid" },
    { team: "MIN", games: 3, b2b: 0, home: 1, pace: "Half-court" },
    { team: "SEA", games: 3, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "CHI", games: 3, b2b: 0, home: 1, pace: "Mid" },
    { team: "ATL", games: 3, b2b: 0, home: 2, pace: "Live-ball" },
    { team: "GSV", games: 3, b2b: 0, home: 2, pace: "Mid" },
    { team: "IND", games: 2, b2b: 1, home: 1, pace: "Mid" },
    { team: "CON", games: 2, b2b: 0, home: 1, pace: "Half-court" },
    { team: "PHX", games: 2, b2b: 0, home: 1, pace: "Live-ball" },
    { team: "DAL", games: 2, b2b: 1, home: 1, pace: "Mid" },
    { team: "WAS", games: 2, b2b: 0, home: 1, pace: "Mid" },
    { team: "LAS", games: 2, b2b: 0, home: 1, pace: "Half-court" },
  ],
};

export type Call = "START" | "SIT" | "STREAM";

export type WeekRow = {
  name: string;
  team: string;
  pos: string;
  games: number;
  b2b: boolean;
  call: Call;
  why: string;
};

export const WEEK_ROWS: WeekRow[] = [
  { name: "Shai Gilgeous-Alexander", team: "OKC", pos: "G", games: 4, b2b: false, call: "START", why: "Home-heavy, usage intact, no rest flag." },
  { name: "Nikola Jokic", team: "DEN", pos: "C", games: 3, b2b: false, call: "START", why: "Three games is still a week-winning floor." },
  { name: "Jalen Williams", team: "OKC", pos: "F", games: 4, b2b: false, call: "STREAM", why: "Four games, soft interiors, secondary creation." },
  { name: "Cade Cunningham", team: "DET", pos: "G", games: 4, b2b: true, call: "START", why: "Volume holds even on the back half." },
  { name: "Jayson Tatum", team: "BOS", pos: "F", games: 3, b2b: true, call: "SIT", why: "Back-to-back after a road set. Minutes risk." },
  { name: "Naz Reid", team: "MIN", pos: "C", games: 4, b2b: false, call: "STREAM", why: "Frontcourt run if the starter sits a half." },
  { name: "Star wing on a B2B", team: "LAL", pos: "F", games: 2, b2b: true, call: "SIT", why: "Load-management week. Sit the back half." },
  { name: "Payton Pritchard", team: "BOS", pos: "G", games: 4, b2b: false, call: "STREAM", why: "Threes and minutes if the offense stalls." },
  { name: "Victor Wembanyama", team: "SAS", pos: "C", games: 3, b2b: false, call: "START", why: "Blocks travel. Three games is still elite." },
  { name: "Bench big vs pace-up", team: "ATL", pos: "C", games: 4, b2b: false, call: "STREAM", why: "Four games, live-ball pace, cheap boards." },
  { name: "A'ja Wilson", team: "LVA", pos: "F", games: 3, b2b: false, call: "START", why: "Usage and blocks. Three games is a lock." },
  { name: "Anthony Edwards", team: "MIN", pos: "G", games: 3, b2b: true, call: "SIT", why: "Road B2B after a heavy minute night." },
];

export const LOVE = [
  { name: "Shai", note: "The week is built around him. Don't get cute." },
  { name: "OKC wings", note: "Four-game week, secondary usage, streamable." },
  { name: "Wemby blocks", note: "Category leagues still underrate a three-game block spike." },
];

export const HATE = [
  { name: "Thin-game stars", note: "Two games plus rest risk is how you lose counting cats." },
  { name: "Road B2B heroes", note: "The second night is where minutes vanish." },
  { name: "Empty-stat streams", note: "If they don't help a category you are losing, skip." },
];

export const TOTALS = [
  { team: "OKC", total: 232.5, pace: "Up" },
  { team: "DEN", total: 228.0, pace: "Mid" },
  { team: "BOS", total: 221.5, pace: "Down" },
  { team: "DET", total: 226.5, pace: "Up" },
  { team: "ATL", total: 237.0, pace: "Up" },
  { team: "SAS", total: 224.5, pace: "Mid" },
];

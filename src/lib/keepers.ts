export type KeepCall = "KEEP" | "TRADE" | "CUT";

export type KeeperRow = {
  id: string;
  name: string;
  team: string;
  pos: string;
  note: string;
};

export const KEEPER_ROWS: KeeperRow[] = [
  { id: "jokic", name: "Nikola Jokic", team: "DEN", pos: "C", note: "The floor is a championship. Keep until the league ends." },
  { id: "sga", name: "Shai Gilgeous-Alexander", team: "OKC", pos: "G", note: "Usage and age. This is a keep even in a shallow room." },
  { id: "wemby", name: "Victor Wembanyama", team: "SAS", pos: "C", note: "Blocks plus the counting cats that come later. Keep." },
  { id: "luka", name: "Luka Doncic", team: "LAL", pos: "G", note: "Volume is the contract. Keep unless the price is a farm." },
  { id: "giannis", name: "Giannis Antetokounmpo", team: "MIL", pos: "F", note: "Still a keep. The window is not closed." },
  { id: "aja", name: "A'ja Wilson", team: "LVA", pos: "F", note: "Basketball, not just the men’s league. Keep the usage." },
  { id: "cade", name: "Cade Cunningham", team: "DET", pos: "G", note: "Hold. The counting stats arrived. Do not trade for a rental." },
  { id: "ant", name: "Anthony Edwards", team: "MIN", pos: "G", note: "Keep in dynasty. Sit him on a road B2B this week." },
  { id: "tatum", name: "Jayson Tatum", team: "BOS", pos: "F", note: "Keep. Sitting a B2B is not a trade signal." },
  { id: "kd", name: "Kevin Durant", team: "HOU", pos: "F", note: "Trade window is open if a contender overpays. Not a cut." },
  { id: "kawhi", name: "Kawhi Leonard", team: "LAC", pos: "F", note: "Load management is the player. Trade the availability, do not cut the peak." },
  { id: "sabrina", name: "Sabrina Ionescu", team: "NYL", pos: "G", note: "Threes and dimes. Keep in a 6-cat that counts 3s." },
];

export const KEEP_CALLS: KeepCall[] = ["KEEP", "TRADE", "CUT"];

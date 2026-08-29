export const LUCKS = ["Even", "Hot", "Grit", "Thin", "Pace", "Steel"] as const;

export type Luck = (typeof LUCKS)[number];

export function luckShift(luck: Luck | string) {
  if (luck === "Hot") return 0.045;
  if (luck === "Grit") return 0.02;
  if (luck === "Thin") return -0.05;
  if (luck === "Steel") return 0.03;
  return 0;
}

export function luckLine(luck: Luck | string) {
  if (luck === "Hot") return "The nights run hot.";
  if (luck === "Grit") return "Close ones lean your way.";
  if (luck === "Thin") return "The room is thin. The walk pays.";
  if (luck === "Pace") return "The scores stretch. The record still has to land.";
  if (luck === "Steel") return "Steel. The floor holds.";
  return "Even. The formula is the center.";
}

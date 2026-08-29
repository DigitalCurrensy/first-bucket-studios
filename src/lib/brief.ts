import { HATE, LOVE, WEEK_ROWS } from "@/lib/week";

export const BRIEF = {
  id: "001",
  date: "August 28, 2026",
  kicker: "Brief Desk · Issue 001",
  title: "Four games is the week.",
  dek: "OKC is the board. Thin-game stars are how you lose. Sit the back half. This is a desk, not a signup.",
  grafs: [
    "The week is not a beauty contest. Four games with secondary usage beats two games of a star who might sit the second night. If you are still starting the Lakers wing through a back-to-back, you are volunteering a loss in a counting cat.",
    "Shai is the axis. Do not get cute. Jokic on three games is still a floor. Wemby’s blocks travel even when the slate is short. Cade’s volume holds on the back half. Tatum does not — sit the B2B, do not cut him.",
    "Stream the column you are losing, not the name you like. Naz Reid and the ATL big are live if you need boards and blocks. Pritchard is threes or nothing. Empty-stat streams are how a 9-cat week dies quietly.",
  ],
  love: LOVE,
  hate: HATE,
  start: WEEK_ROWS.filter((r) => r.call === "START").slice(0, 3),
  sit: WEEK_ROWS.filter((r) => r.call === "SIT"),
  stream: WEEK_ROWS.filter((r) => r.call === "STREAM").slice(0, 3),
  close: "Editorial only. Not a sportsbook. Not an NCAA determination. Come back next week.",
};

export function briefText() {
  const lines = [
    `${BRIEF.kicker}`,
    BRIEF.title,
    BRIEF.dek,
    "",
    ...BRIEF.grafs,
    "",
    "Love: " + BRIEF.love.map((l) => l.name).join(", "),
    "Hate: " + BRIEF.hate.map((h) => h.name).join(", "),
    "Start: " + BRIEF.start.map((s) => s.name).join(", "),
    "Sit: " + BRIEF.sit.map((s) => s.name).join(", "),
    "Stream: " + BRIEF.stream.map((s) => s.name).join(", "),
    "",
    BRIEF.close,
    "First Bucket Studio",
  ];
  return lines.join("\n");
}
import { houseWalk } from "./walk.ts";
import { issueFor, type Issue } from "./issues/index.ts";
import { todayKey, weekKey } from "./studio-save.ts";
import { recordLine } from "./nba.ts";
import { hateOf, loveOf, weekRows, type WeekRow } from "./week.ts";

export type BriefView = Issue & {
  start: WeekRow[];
  sit: WeekRow[];
  stream: WeekRow[];
  house: {
    id: string;
    line: string;
    team: string;
    era: string;
    wins: number;
    names: string[];
  };
};

export function buildBrief(week = weekKey(), date = todayKey()): BriefView {
  const issue = issueFor(week);
  const rows = weekRows(week);
  const house = houseWalk(date);
  return {
    ...issue,
    love: issue.love.length ? issue.love : loveOf(week),
    hate: issue.hate.length ? issue.hate : hateOf(week),
    start: rows.filter((r) => r.call === "START").slice(0, 3),
    sit: rows.filter((r) => r.call === "SIT").slice(0, 3),
    stream: rows.filter((r) => r.call === "STREAM").slice(0, 3),
    house: {
      id: house.id,
      line: `${house.room.team} ${recordLine(house.walk.wins)} · ${house.room.era} · ${house.room.luck}`,
      team: house.room.team,
      era: house.room.era,
      wins: house.walk.wins,
      names: house.five.map((p) => p.name),
    },
  };
}

export const BRIEF = buildBrief("2026-W35", "2026-08-29");

export function briefText(week = weekKey(), date = todayKey()) {
  const brief = buildBrief(week, date);
  const lines = [
    `${brief.kicker}`,
    brief.title,
    brief.dek,
    "",
    `House walk · ${brief.house.line}`,
    brief.house.names.join(", "),
    `/walk/${brief.house.id}`,
    "",
    ...brief.grafs,
    "",
    "Love: " + brief.love.map((l) => l.name).join(", "),
    "Hate: " + brief.hate.map((h) => h.name).join(", "),
    "Start: " + brief.start.map((s) => s.name).join(", "),
    "Sit: " + brief.sit.map((s) => s.name).join(", "),
    "Stream: " + brief.stream.map((s) => s.name).join(", "),
    "",
    brief.close,
    "First Bucket Studio",
  ];
  return lines.join("\n");
}

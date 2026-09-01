import { houseWalk, houseWalkWnba } from "./walk.ts";
import { issueById, issueFor, type Issue } from "./issues/index.ts";
import { todayKey, weekKey } from "./studio-save.ts";
import { recordLine } from "./nba.ts";
import { hateOf, loveOf, weekRows, type WeekRow } from "./week.ts";

export type BriefLeague = "nba" | "wnba";

export type BriefView = Issue & {
  start: WeekRow[];
  sit: WeekRow[];
  stream: WeekRow[];
  live: boolean;
  league: BriefLeague;
  house: {
    id: string;
    line: string;
    team: string;
    era: string;
    wins: number;
    names: string[];
    ids: string[];
  };
};

export function buildBrief(
  week = weekKey(),
  date = todayKey(),
  issueId?: string,
  league: BriefLeague = "nba",
): BriefView {
  const liveIssue = issueFor(week);
  const issue = issueId ? issueById(issueId) : liveIssue;
  const live = issue.id === liveIssue.id && issue.week === liveIssue.week;
  const rows = weekRows(week);
  const house = league === "wnba" ? houseWalkWnba(date) : houseWalk(date);
  const of = league === "wnba" ? 40 : 82;
  return {
    ...issue,
    live,
    league,
    love: live ? loveOf(week) : issue.love,
    hate: live ? hateOf(week) : issue.hate,
    start: rows.filter((r) => r.call === "START").slice(0, 3),
    sit: rows.filter((r) => r.call === "SIT").slice(0, 3),
    stream: rows.filter((r) => r.call === "STREAM").slice(0, 3),
    house: {
      id: house.id,
      line: `${house.room.team} ${recordLine(house.walk.wins, of)} · ${house.room.era} · ${house.room.luck}`,
      team: house.room.team,
      era: house.room.era,
      wins: house.walk.wins,
      names: house.five.map((p) => p.name),
      ids: house.five.map((p) => p.id),
    },
  };
}

export const BRIEF = buildBrief("2026-W35", "2026-08-29");

export function briefText(week = weekKey(), date = todayKey(), issueId?: string, league: BriefLeague = "nba") {
  const brief = buildBrief(week, date, issueId, league);
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
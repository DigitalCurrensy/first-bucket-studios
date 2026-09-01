import assert from "node:assert/strict";
import { test } from "node:test";
import { attemptsFor, bestFrom, nextTuesdayLabel, streakStrip, tuesdayIcs, weekKey, type SavedRun } from "./studio-save.ts";

const runs: SavedRun[] = [
  {
    id: "1",
    at: 1,
    mode: "82-0",
    team: "Lakers",
    era: "Showtime",
    wins: 61,
    roster: [],
    nights: [{ win: true }, { win: true }, { win: false }],
  },
  { id: "2", at: 2, mode: "82-0", team: "Bulls", era: "90s East", wins: 72, roster: [] },
  { id: "3", at: 3, mode: "goat", team: "GOAT Five", era: "All-time", wins: 96, roster: [] },
  { id: "4", at: 4, mode: "daily", team: "Heat", era: "Positionless", wins: 54, roster: [] },
  {
    id: "5",
    at: 5,
    mode: "wnba",
    team: "Aces",
    era: "Positionless",
    wins: 32,
    roster: [],
    nights: [{ win: true }, { win: false }],
  },
];

test("bestFrom takes the high walk for that mode", () => {
  assert.equal(bestFrom(runs, "82-0"), 72);
  assert.equal(bestFrom(runs, "daily"), 54);
  assert.equal(bestFrom(runs, "goat"), 96);
  assert.equal(bestFrom(runs, "16-0"), 0);
  assert.equal(bestFrom(runs, "wnba"), 32);
});

test("bestFrom on an empty book is zero", () => {
  assert.equal(bestFrom([], "82-0"), 0);
});

test("SavedRun may carry nights and bestFrom still works", () => {
  assert.equal(runs[0]!.nights?.length, 3);
  assert.equal(runs[4]!.nights?.length, 2);
  assert.equal(bestFrom(runs, "82-0"), 72);
  assert.equal(bestFrom(runs, "wnba"), 32);
});

test("week key is an ISO week", () => {
  assert.match(weekKey(), /^\d{4}-W\d{2}$/);
});

test("tuesday ics is a vcalendar", () => {
  const ics = tuesdayIcs("2026-W36");
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /SUMMARY:First Bucket · The Tape/);
});

test("next Tuesday is a date label", () => {
  const label = nextTuesdayLabel("2026-W36");
  assert.match(label, /Tuesday/);
  assert.match(label, /2026|August|September|October|November|December|January/);
});

test("attemptsFor is empty without a browser save", () => {
  assert.equal(attemptsFor(["a", "b", "c", "d", "e"]).length, 0);
});

test("streakStrip is seven holes from lastDaily", () => {
  const holes = streakStrip("2026-08-29", "2026-08-28", 3);
  assert.equal(holes.length, 7);
  assert.equal(holes[6]!.date, "2026-08-29");
  assert.equal(holes[6]!.state, "today");
  assert.equal(holes[5]!.state, "played");
  assert.equal(holes[4]!.state, "played");
  assert.equal(holes[3]!.state, "played");
  assert.equal(holes[2]!.state, "missed");
});

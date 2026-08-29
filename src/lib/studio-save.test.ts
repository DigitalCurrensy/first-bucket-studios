import assert from "node:assert/strict";
import { test } from "node:test";
import { bestFrom, type SavedRun } from "./studio-save.ts";

const runs: SavedRun[] = [
  { id: "1", at: 1, mode: "82-0", team: "Lakers", era: "Showtime", wins: 61, roster: [] },
  { id: "2", at: 2, mode: "82-0", team: "Bulls", era: "90s East", wins: 72, roster: [] },
  { id: "3", at: 3, mode: "goat", team: "GOAT Five", era: "All-time", wins: 96, roster: [] },
  { id: "4", at: 4, mode: "daily", team: "Heat", era: "Positionless", wins: 54, roster: [] },
];

test("bestFrom takes the high walk for that mode", () => {
  assert.equal(bestFrom(runs, "82-0"), 72);
  assert.equal(bestFrom(runs, "daily"), 54);
  assert.equal(bestFrom(runs, "goat"), 96);
  assert.equal(bestFrom(runs, "16-0"), 0);
});

test("bestFrom on an empty book is zero", () => {
  assert.equal(bestFrom([], "82-0"), 0);
});

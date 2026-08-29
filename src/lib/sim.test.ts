import assert from "node:assert/strict";
import { test } from "node:test";
import { PLAYERS_BY_ID } from "./nba.ts";
import { playoffWalk, seasonWalk } from "./sim.ts";

const five = [
  PLAYERS_BY_ID.mj,
  PLAYERS_BY_ID.pippen,
  PLAYERS_BY_ID.bird,
  PLAYERS_BY_ID.magic,
  PLAYERS_BY_ID.russell,
];

test("same seed walks the same season", () => {
  const a = seasonWalk("Bulls", "90s East", five);
  const b = seasonWalk("Bulls", "90s East", five);
  assert.equal(a.wins, b.wins);
  assert.equal(a.nights.length, 82);
  assert.deepEqual(
    a.nights.map((n) => n.win),
    b.nights.map((n) => n.win),
  );
});

test("season wins stay inside 0–82 and near the projection", () => {
  const walk = seasonWalk("Bulls", "90s East", five);
  assert.ok(walk.wins >= 0 && walk.wins <= 82);
  assert.ok(Math.abs(walk.wins - walk.projected) <= 18);
});

test("playoff walk stops after a lost series", () => {
  const walk = playoffWalk("Lakers", "Showtime", five);
  assert.ok(walk.nights.length >= 4);
  assert.ok(walk.nights.length <= 16);
  assert.ok(walk.wins <= 16);
  const lost = walk.rounds.find((r) => !r.taken);
  if (lost) {
    const last = walk.rounds[walk.rounds.length - 1];
    assert.equal(last?.taken, false);
  }
});

test("a different room is a different walk", () => {
  const a = seasonWalk("Bulls", "90s East", five);
  const b = seasonWalk("Heat", "90s East", five);
  assert.notDeepEqual(
    a.nights.map((n) => n.us),
    b.nights.map((n) => n.us),
  );
});

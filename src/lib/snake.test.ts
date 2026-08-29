import assert from "node:assert/strict";
import { test } from "node:test";
import {
  overallFor,
  pickLabel,
  pickMeta,
  roomSelect,
  scoreNeed,
  seatNames,
  snakeSeat,
} from "./snake.ts";
import type { Player } from "./nba.ts";

function p(id: string, pos: Player["pos"], peak: number): Player {
  return { id, name: id, pos, era: "2000s", peak, pts: 20, reb: 5, ast: 5, stl: 1, blk: 1, threes: 1, club: "LAL", shelf: "current" };
}

test("odd rounds run left, even rounds reverse", () => {
  assert.equal(snakeSeat(0), 0);
  assert.equal(snakeSeat(3), 3);
  assert.equal(snakeSeat(4), 3);
  assert.equal(snakeSeat(5), 2);
  assert.equal(snakeSeat(6), 1);
  assert.equal(snakeSeat(7), 0);
  assert.equal(snakeSeat(8), 0);
});

test("pick labels are round.order, not seat numbers", () => {
  assert.equal(pickLabel(0), "1.01");
  assert.equal(pickLabel(3), "1.04");
  assert.equal(pickLabel(4), "2.01");
  assert.equal(pickLabel(7), "2.04");
  assert.equal(pickLabel(8), "3.01");
});

test("1.04 owns 2.01 — the turnaround", () => {
  const turnaround = pickMeta(4);
  assert.equal(turnaround.label, "2.01");
  assert.equal(turnaround.seat, 3);
  assert.equal(turnaround.reversing, true);
  assert.equal(overallFor(1, 3), 4);
  assert.equal(overallFor(1, 0), 7);
  assert.equal(pickLabel(overallFor(1, 0)), "2.04");
});

test("seat names put You on the chosen slot", () => {
  assert.deepEqual(seatNames(0), ["You", "Room A", "Room B", "Room C"]);
  assert.deepEqual(seatNames(3), ["Room A", "Room B", "Room C", "You"]);
});

test("need-first taxes a third guard and boosts a missing big", () => {
  const roster = [p("g1", "G", 96), p("g2", "G", 94)];
  const guard = p("g3", "G", 93);
  const center = p("c1", "C", 88);
  assert.ok(scoreNeed(center, roster) > scoreNeed(guard, roster));
  const take = roomSelect([guard, center], roster);
  assert.equal(take?.id, "c1");
});

test("empty roster is peak order — first pick is BPA", () => {
  const a = p("star", "G", 99);
  const b = p("big", "C", 94);
  assert.equal(roomSelect([b, a], [])?.id, "star");
});

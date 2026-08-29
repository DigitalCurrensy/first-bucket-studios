import assert from "node:assert/strict";
import { test } from "node:test";
import { PLAYERS_BY_ID } from "./nba.ts";
import { gradeTrade } from "./trade.ts";

const jokic = PLAYERS_BY_ID.jokic;
const sabrina = PLAYERS_BY_ID.sabrina;
const tatum = PLAYERS_BY_ID.tatum;
const cade = PLAYERS_BY_ID.cade;

test("empty sides stay pending", () => {
  const g = gradeTrade([], [jokic]);
  assert.equal(g.pending, true);
  assert.equal(g.note, "Mark both sides.");
});

test("sending Jokic for Sabrina is a pass", () => {
  const g = gradeTrade([jokic], [sabrina]);
  assert.equal(g.grade, "PASS");
  assert.match(g.note, /lose C/);
});

test("getting Jokic for Sabrina is a win", () => {
  const g = gradeTrade([sabrina], [jokic]);
  assert.equal(g.grade, "WIN");
});

test("near-even deals stay even", () => {
  const g = gradeTrade([tatum], [cade]);
  assert.equal(g.grade, "EVEN");
  assert.equal(g.pending, false);
});

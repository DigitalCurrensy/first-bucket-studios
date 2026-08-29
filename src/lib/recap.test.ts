import assert from "node:assert/strict";
import { test } from "node:test";
import { recapOf } from "./recap.ts";
import type { Night } from "./sim.ts";

function night(partial: Partial<Night> & { n: number; win: boolean }): Night {
  return {
    opp: "BOS",
    home: true,
    us: partial.win ? 110 : 98,
    them: partial.win ? 100 : 108,
    ...partial,
  };
}

test("longest win streak and ending streak", () => {
  const nights = [
    night({ n: 1, win: true }),
    night({ n: 2, win: true }),
    night({ n: 3, win: true }),
    night({ n: 4, win: false }),
    night({ n: 5, win: true }),
    night({ n: 6, win: true }),
  ];
  const recap = recapOf(nights, 50);
  assert.equal(recap.streak, 3);
  assert.equal(recap.ending, 2);
  assert.equal(recap.wins, 5);
  assert.equal(recap.losses, 1);
});

test("home and away split, best night is the fattest win", () => {
  const nights = [
    night({ n: 1, win: true, home: true, us: 120, them: 90, opp: "MIA" }),
    night({ n: 2, win: true, home: false, us: 105, them: 101, opp: "CHI" }),
    night({ n: 3, win: false, home: false, us: 88, them: 111, opp: "BOS" }),
  ];
  const recap = recapOf(nights, 60);
  assert.equal(recap.homeW, 1);
  assert.equal(recap.homeL, 0);
  assert.equal(recap.awayW, 1);
  assert.equal(recap.awayL, 1);
  assert.equal(recap.bestLine, "120–90 vs MIA");
  assert.equal(recap.worstLine, "88–111 @ BOS");
});

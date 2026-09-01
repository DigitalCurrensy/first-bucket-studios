import assert from "node:assert/strict";
import { test } from "node:test";
import { GAPS, HOUSE, LOCKED, LOOPS, POTENTIAL, RANKED_NEXT, SKILLS, SURFACES, gapCount } from "./score.ts";

test("the house score is the card", () => {
  assert.equal(HOUSE, 96);
  assert.ok(HOUSE >= 94 && HOUSE < 98);
});

test("every loop has a status and a score", () => {
  assert.ok(LOOPS.length >= 14);
  for (const row of LOOPS) {
    assert.ok(row.score >= 0 && row.score <= 100);
    assert.ok(["earned", "acquired", "potential", "locked"].includes(row.status));
  }
  assert.ok(LOOPS.filter((row) => row.status === "earned").length >= 8);
  assert.ok(LOOPS.filter((row) => row.status === "acquired").length >= 4);
});

test("earned skills stay earned and locked stay locked", () => {
  const earned = SKILLS.filter((row) => row.status === "earned").map((row) => row.id);
  assert.ok(earned.includes("reel"));
  assert.ok(earned.includes("pack"));
  assert.ok(earned.includes("issue-gen"));
  assert.ok(earned.includes("share-files"));
  assert.ok(earned.includes("goat-pack"));
  assert.ok(earned.includes("night-scrub"));
  const ids = LOCKED.map((row) => row.id);
  assert.ok(ids.includes("auth"));
  assert.ok(ids.includes("og"));
  assert.ok(ids.includes("two-k"));
  assert.ok(!SKILLS.some((row) => ids.includes(row.id)));
  assert.ok(!POTENTIAL.some((row) => ids.includes(row.id)));
});

test("potential skills are scoped", () => {
  const ids = POTENTIAL.map((row) => row.id);
  assert.ok(ids.includes("p2p"));
  assert.ok(ids.includes("stranger"));
  assert.ok(!ids.includes("walk-v2"));
  assert.ok(!ids.includes("issue-gen"));
});

test("gaps are named and sized with no silent holes", () => {
  assert.ok(gapCount("big") >= 2);
  assert.ok(gapCount("small") >= 4);
  assert.equal(new Set(GAPS.map((g) => g.id)).size, GAPS.length);
  const ids = GAPS.map((g) => g.id);
  assert.ok(ids.includes("unfurl"));
  assert.ok(ids.includes("stranger-proof"));
  assert.ok(!ids.includes("formula-grafs"));
  assert.ok(!ids.includes("chip-wall"));
  assert.ok(!ids.includes("keep-void-week"));
  assert.ok(!ids.includes("tape-random-12"));
  assert.ok(!ids.includes("mad-libs"));
  assert.ok(!ids.includes("private-wall"));
  assert.ok(!ids.includes("ticker"));
  assert.ok(!ids.includes("export-buried"));
  assert.ok(!ids.includes("corners-pack"));
});

test("surfaces cover the machine and the wall", () => {
  const hrefs = SURFACES.map((s) => s.href);
  assert.ok(hrefs.includes("/games/82-0"));
  assert.ok(hrefs.includes("/games/wnba"));
  assert.ok(hrefs.includes("/keepers"));
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test("ranked next is the remaining work", () => {
  assert.ok(RANKED_NEXT.length >= 3);
  assert.match(RANKED_NEXT.join(" "), /stranger|PNG|og/i);
});

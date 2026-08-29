import assert from "node:assert/strict";
import test from "node:test";
import { daysUntilTip, seasonLine } from "./season.ts";

test("tip-off countdown is 53 days on August 29, 2026", () => {
  const from = new Date(2026, 7, 29);
  assert.equal(daysUntilTip(from), 52);
  assert.match(seasonLine(from), /days until tip-off/);
});

test("opening night is tonight", () => {
  assert.equal(seasonLine(new Date(2026, 9, 20)), "Tip-off is tonight");
});

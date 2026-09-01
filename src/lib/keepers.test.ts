import assert from "node:assert/strict";
import { test } from "node:test";
import { keepFive, keepWalkPlan } from "./keepers.ts";
import { currentBook, wnbaBook } from "./nba.ts";

test("no KEEP prints an empty five", () => {
  assert.equal(keepFive({}, "2026-W40").length, 0);
});

test("three KEEPs and two holes still print a five", () => {
  const book = currentBook();
  const a = book[0]!;
  const b = book[1]!;
  const c = book[2]!;
  const five = keepFive({ [a.id]: "KEEP", [b.id]: "KEEP", [c.id]: "KEEP" }, "2026-W40");
  assert.equal(five.length, 5);
  assert.ok(five.some((p) => p.id === a.id));
});

test("same week same KEEP five", () => {
  const book = currentBook();
  const marks = { [book[0]!.id]: "KEEP" as const, [book[3]!.id]: "KEEP" as const };
  const a = keepFive(marks, "2026-W40");
  const b = keepFive(marks, "2026-W40");
  assert.deepEqual(
    a.map((p) => p.id),
    b.map((p) => p.id),
  );
});

test("changing the week changes hole-fills", () => {
  const book = currentBook();
  const marks = { [book[0]!.id]: "KEEP" as const };
  const a = keepFive(marks, "2026-W40");
  const b = keepFive(marks, "2026-W41");
  assert.equal(a.length, 5);
  assert.equal(b.length, 5);
  assert.ok(a.some((p) => p.id === book[0]!.id));
  assert.notDeepEqual(
    a.map((p) => p.id),
    b.map((p) => p.id),
  );
});

test("WNBA shelf prints a W five", () => {
  const book = wnbaBook();
  const marks = { [book[0]!.id]: "KEEP" as const };
  const five = keepFive(marks, "2026-W40", book);
  assert.equal(five.length, 5);
  assert.ok(five.every((p) => p.shelf === "wnba"));
});

test("a W five plans a WNBA walk", () => {
  const book = wnbaBook();
  const marks = {
    [book[0]!.id]: "KEEP" as const,
    [book[1]!.id]: "KEEP" as const,
    [book[2]!.id]: "KEEP" as const,
  };
  const five = keepFive(marks, "2026-W40", book);
  const plan = keepWalkPlan("2026-W40", five);
  assert.equal(plan.wnba, true);
  assert.equal(plan.ids.length, 5);
  assert.equal(plan.luck, "Even");
});

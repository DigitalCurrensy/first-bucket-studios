import assert from "node:assert/strict";
import { test } from "node:test";
import { buildTape } from "./tape.ts";

test("same date prints the same tape", () => {
  const a = buildTape("2026-08-29");
  const b = buildTape("2026-08-29");
  assert.equal(a.length, b.length);
  assert.deepEqual(
    a.map((r) => [r.player.id, r.mark, r.heat, r.note]),
    b.map((r) => [r.player.id, r.mark, r.heat, r.note]),
  );
});

test("marks are only UP FLAT DOWN", () => {
  const rows = buildTape("2026-08-29");
  assert.ok(rows.length >= 8);
  for (const row of rows) {
    assert.ok(row.mark === "UP" || row.mark === "FLAT" || row.mark === "DOWN");
    assert.ok(row.heat >= 1 && row.heat <= 3);
  }
});

test("a different day is a different print", () => {
  const a = buildTape("2026-08-29");
  const b = buildTape("2026-08-30");
  assert.notDeepEqual(
    a.map((r) => r.player.id),
    b.map((r) => r.player.id),
  );
});

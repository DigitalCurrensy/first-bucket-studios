import assert from "node:assert/strict";
import { test } from "node:test";
import { WNBA_FRANCHISES } from "./nba.ts";
import { seasonSkeleton, sitSet, weekDensity } from "./schedule.ts";

test("skeleton is 82 nights, 41 home, B2Bs in band", () => {
  const slots = seasonSkeleton("Lakers", "Showtime");
  assert.equal(slots.length, 82);
  assert.equal(slots.filter((s) => s.home).length, 41);
  const b2b = slots.filter((s) => s.b2b).length;
  assert.ok(b2b >= 8 && b2b <= 22);
  assert.ok(slots.every((s) => s.opp !== "LAL"));
});

test("same franchise and era print the same skeleton", () => {
  const a = seasonSkeleton("Bulls", "90s East");
  const b = seasonSkeleton("Bulls", "90s East");
  assert.deepEqual(a, b);
});

test("sit nights stay in band", () => {
  const sits = sitSet("Bulls", "90s East", "Even", "mj,pippen,bird,magic,russell");
  assert.ok(sits.size >= 4 && sits.size <= 16);
  for (const n of sits) {
    assert.ok(n >= 1 && n <= 82);
  }
});

test("week density has 30 clubs and no betting totals", () => {
  const rows = weekDensity("2026-W35");
  assert.equal(rows.length, 30);
  const okc = rows.find((row) => row.team === "OKC");
  assert.equal(okc?.games, 4);
  const lal = rows.find((row) => row.team === "LAL");
  assert.equal(lal?.games, 2);
  for (const row of rows) {
    assert.ok(row.games >= 2 && row.games <= 4);
    assert.ok(row.b2b === 0 || row.b2b === 1);
    assert.ok(["Live-ball", "Mid", "Half-court"].includes(row.pace));
    assert.equal("total" in row, false);
  }
});

test("WNBA density is thirteen clubs, still no totals", () => {
  const rows = weekDensity("2026-W35", WNBA_FRANCHISES);
  assert.equal(rows.length, 13);
  for (const row of rows) {
    assert.ok(row.games >= 2 && row.games <= 3);
    assert.ok(row.b2b === 0 || row.b2b === 1);
    assert.equal("total" in row, false);
  }
});

test("generated weeks stay generated and differ from the file week", () => {
  const a = weekDensity("2026-W40");
  const b = weekDensity("2026-W41");
  const file = weekDensity("2026-W35");
  assert.equal(a.length, 30);
  assert.notDeepEqual(
    a.map((r) => r.games),
    b.map((r) => r.games),
  );
  assert.notDeepEqual(
    a.map((r) => r.games),
    file.map((r) => r.games),
  );
});

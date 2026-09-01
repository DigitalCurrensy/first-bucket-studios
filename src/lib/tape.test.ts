import assert from "node:assert/strict";
import { test } from "node:test";
import { clubAbbr } from "./nba.ts";
import { weekDensity } from "./schedule.ts";
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

test("W40 and W41 differ in ids or order", () => {
  const a = buildTape("2026-W40");
  const b = buildTape("2026-W41");
  assert.equal(a.length, 12);
  assert.notDeepEqual(
    a.map((r) => r.player.id),
    b.map((r) => r.player.id),
  );
});

test("UP clubs are at least as dense as FLAT", () => {
  const week = "2026-W40";
  const rows = buildTape(week);
  const dens = Object.fromEntries(weekDensity(week).map((row) => [row.team, row.games]));
  const avg = (mark: "UP" | "FLAT") => {
    const games = rows.filter((row) => row.mark === mark).map((row) => dens[clubAbbr(row.player.club)] ?? 0);
    return games.reduce((n, g) => n + g, 0) / Math.max(1, games.length);
  };
  assert.ok(avg("UP") >= avg("FLAT"));
});

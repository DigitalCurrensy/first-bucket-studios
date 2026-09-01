import assert from "node:assert/strict";
import { test } from "node:test";
import { PLAYERS_BY_ID } from "./nba.ts";
import { goatTelemetry, seasonTelemetry } from "./telemetry.ts";

const stacked = [PLAYERS_BY_ID.mj!, PLAYERS_BY_ID.kobe!, PLAYERS_BY_ID.lebron!, PLAYERS_BY_ID.shaq!, PLAYERS_BY_ID.magic!];
const thin = [PLAYERS_BY_ID.herb!, PLAYERS_BY_ID.tobias!, PLAYERS_BY_ID.camara!, PLAYERS_BY_ID.kat!, PLAYERS_BY_ID.wcj!];

test("telemetry lines sum toward the projection", () => {
  const t = seasonTelemetry(stacked, "Showtime");
  assert.ok(t.lines.length >= 3);
  assert.ok(t.projected >= 50);
  assert.ok(t.lines.some((row) => row.label === "Peak"));
});

test("a two-position five takes a positional deficit", () => {
  const t = seasonTelemetry(thin, "90s East");
  assert.ok(t.lines.some((row) => row.label === "Positional deficit"));
  assert.ok(t.projected <= 40);
});

test("goat telemetry stays in 72–99", () => {
  const t = goatTelemetry(stacked);
  assert.ok(t.projected >= 72 && t.projected <= 99);
  assert.match(t.hash, /^[0-9a-f]+$/);
});

test("hand-check taxes soft wings", () => {
  const t = seasonTelemetry(thin, "90s East");
  assert.ok(t.lines.some((row) => row.label === "90s hand-check"));
});

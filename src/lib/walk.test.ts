import assert from "node:assert/strict";
import { test } from "node:test";
import { PLAYERS_BY_ID } from "./nba.ts";
import { seasonWalk } from "./sim.ts";
import { dailyRoom, decodeWalk, encodeWalk, houseWalk, rosterKey } from "./walk.ts";

const ids = ["magic", "kobe", "shaq", "worthy", "kareem"];

test("encode and decode round-trip a walk", () => {
  const id = encodeWalk({ team: "Lakers", era: "Showtime", luck: "Even", wins: 61, ids });
  const parsed = decodeWalk(id);
  assert.ok(parsed);
  assert.equal(parsed.team, "Lakers");
  assert.equal(parsed.era, "Showtime");
  assert.equal(parsed.luck, "Even");
  assert.equal(parsed.wins, 61);
  assert.deepEqual([...parsed.ids].sort(), [...ids].sort());
});

test("same five in any order is the same walk id", () => {
  const a = encodeWalk({ team: "Lakers", era: "Showtime", luck: "Hot", wins: 58, ids });
  const b = encodeWalk({ team: "Lakers", era: "Showtime", luck: "Hot", wins: 58, ids: [...ids].reverse() });
  assert.equal(a, b);
  assert.equal(rosterKey(ids), rosterKey([...ids].reverse()));
});

test("same five walks the same season", () => {
  const five = ids.map((id) => PLAYERS_BY_ID[id]!);
  const a = seasonWalk("Lakers", "Showtime", five);
  const b = seasonWalk("Lakers", "Showtime", [...five].reverse());
  assert.equal(a.wins, b.wins);
  assert.deepEqual(
    a.nights.map((n) => n.win),
    b.nights.map((n) => n.win),
  );
});

test("garbage walk ids fail closed", () => {
  assert.equal(decodeWalk("nope"), null);
  assert.equal(decodeWalk("v1.XXX.showtime.even.10.a~b~c~d~e"), null);
});

test("daily room is stable for a calendar day", () => {
  const a = dailyRoom("2026-08-29");
  const b = dailyRoom("2026-08-29");
  assert.equal(a.team, b.team);
  assert.equal(a.era, b.era);
  assert.equal(a.luck, b.luck);
  assert.deepEqual(
    a.pack.map((p) => p.id),
    b.pack.map((p) => p.id),
  );
});

test("a different day is a different daily room", () => {
  const a = dailyRoom("2026-08-29");
  const b = dailyRoom("2026-08-30");
  assert.notEqual(
    `${a.team}:${a.era}:${a.luck}:${a.pack.map((p) => p.id).join(",")}`,
    `${b.team}:${b.era}:${b.luck}:${b.pack.map((p) => p.id).join(",")}`,
  );
});

test("house walk is deterministic and encodes", () => {
  const a = houseWalk("2026-08-29");
  const b = houseWalk("2026-08-29");
  assert.equal(a.id, b.id);
  assert.equal(a.walk.wins, b.walk.wins);
  assert.equal(a.five.length, 5);
  assert.ok(decodeWalk(a.id));
});

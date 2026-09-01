import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HOUSE_FIVE_IDS,
  HOUSE_PACK,
  HOUSE_TEN_IDS,
  HOUSE_WALK_ID,
  dealHouseFive,
  dealHousePack,
  housePackSeed,
  walkHouse,
} from "./house-pack.ts";
import { seasonWalk } from "./sim.ts";
import { encodeWalk } from "./walk.ts";

test("house pack is a cueable Thunder room", () => {
  assert.equal(HOUSE_PACK.team, "Thunder");
  assert.equal(HOUSE_PACK.era, "Positionless");
  assert.equal(HOUSE_PACK.luck, "Even");
  assert.equal(housePackSeed(), "Thunder:Positionless:Even:HOUSEPACK");
});

test("house pack is a table of ten, not a shuffle", () => {
  const a = dealHousePack().map((p) => p.id);
  const b = dealHousePack().map((p) => p.id);
  assert.deepEqual(a, [...HOUSE_TEN_IDS]);
  assert.deepEqual(a, b);
  assert.equal(a.length, 10);
  assert.equal(new Set(a).size, 10);
});

test("house five is the Thunder core, folded from the ten", () => {
  const ten = new Set(dealHousePack().map((p) => p.id));
  const five = dealHouseFive();
  assert.deepEqual(
    five.map((p) => p.id),
    [...HOUSE_FIVE_IDS],
  );
  assert.deepEqual(
    five.map((p) => p.name),
    ["Shai Gilgeous-Alexander", "Jalen Williams", "Chet Holmgren", "Luguentz Dort", "Isaiah Hartenstein"],
  );
  assert.ok(five.every((p) => ten.has(p.id)));
  assert.equal(new Set(five.map((p) => p.id)).size, 5);
});

test("house five walks a real Thunder season", () => {
  const walk = seasonWalk("Thunder", "Positionless", dealHouseFive(), "Even");
  assert.equal(walk.nights.length, 82);
  assert.ok(walk.wins >= 50, `cinematic room, got ${walk.wins}`);
  assert.deepEqual(seasonWalk("Thunder", "Positionless", dealHouseFive(), "Even").nights, walk.nights);
});

test("house walk is a pin table, not procgen", () => {
  const a = walkHouse();
  const b = walkHouse();
  assert.equal(a.walked.wins, b.walked.wins);
  assert.ok(a.walked.wins >= 50, `cinematic room, got ${a.walked.wins}`);
  assert.equal(a.five.length, 5);
  assert.equal(a.ten.length, 10);
  assert.deepEqual(
    a.five.map((p) => p.id),
    [...HOUSE_FIVE_IDS],
  );
  assert.deepEqual(
    a.walked.nights.map((n) => n.win),
    b.walked.nights.map((n) => n.win),
  );
});

test("house walk id is the staged certificate — do not retune mulberry32", () => {
  const { five, walked } = walkHouse();
  assert.equal(walked.wins, 51);
  assert.equal(
    encodeWalk({
      team: HOUSE_PACK.team,
      era: HOUSE_PACK.era,
      luck: HOUSE_PACK.luck,
      wins: walked.wins,
      ids: five.map((p) => p.id),
    }),
    "v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga",
  );
  assert.equal(HOUSE_WALK_ID, "v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga");
});
import assert from "node:assert/strict";
import { test } from "node:test";
import { filterPack } from "./draft.ts";

const pack = [
  { name: "Michael Jordan", pos: "G" },
  { name: "Nikola Jokic", pos: "C" },
  { name: "Larry Bird", pos: "F" },
];

test("empty query and ALL returns the pack", () => {
  assert.equal(filterPack(pack, "", "ALL").length, 3);
});

test("pos G drops the bigs", () => {
  assert.deepEqual(
    filterPack(pack, "", "G").map((p) => p.name),
    ["Michael Jordan"],
  );
});

test("search is case-insensitive on name", () => {
  assert.deepEqual(
    filterPack(pack, "jok", "ALL").map((p) => p.name),
    ["Nikola Jokic"],
  );
});

test("pos and search stack", () => {
  assert.equal(filterPack(pack, "bird", "C").length, 0);
  assert.equal(filterPack(pack, "bird", "F").length, 1);
});

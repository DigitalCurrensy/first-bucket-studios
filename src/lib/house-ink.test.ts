import { readdirSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";
import { FRANCHISES, WNBA_FRANCHISES } from "./nba.ts";
import { clubName, HOUSE_INK, houseInk } from "./house-ink.ts";

test("every NBA franchise has a house ink and a lithograph plate", () => {
  const files = new Set(readdirSync(join(process.cwd(), "public/emblems")));
  for (const name of FRANCHISES) {
    assert.ok(HOUSE_INK[name], name);
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    assert.ok(files.has(`${slug}.png`), slug);
  }
});

test("every W club in the book has a house ink and a lithograph plate", () => {
  const files = new Set(readdirSync(join(process.cwd(), "public/emblems")));
  for (const name of WNBA_FRANCHISES) {
    assert.ok(HOUSE_INK[name], name);
    assert.ok(files.has(`${name.toLowerCase()}.png`), name);
  }
});

test("house fallback stays brass", () => {
  const pal = houseInk(undefined, "goat");
  assert.equal(pal.ink, "#C5A059");
});

test("club codes resolve without W/NBA collisions", () => {
  assert.equal(clubName("LAL"), "Lakers");
  assert.equal(clubName("LAS", "wnba"), "Sparks");
  assert.equal(clubName("MIN"), "Timberwolves");
  assert.equal(clubName("MIN", "wnba"), "Lynx");
  assert.equal(clubName("CHI", "wnba"), "Sky");
  assert.equal(houseInk("LAL").ink, HOUSE_INK.Lakers.ink);
});

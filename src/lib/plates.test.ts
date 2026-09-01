import assert from "node:assert/strict";
import { test } from "node:test";
import { PLAYERS } from "./nba.ts";
import { PLATES, cardSerial, initials, nameParts, plateCrop, plateForPlayer } from "./plates.ts";

test("first six stills stay first", () => {
  assert.equal(PLATES[0], "/plates/center.jpg");
  assert.equal(PLATES[1], "/plates/forward.jpg");
  assert.equal(PLATES[2], "/plates/guard.jpg");
  assert.equal(PLATES[3], "/plates/hardwood.jpg");
  assert.equal(PLATES[4], "/plates/locker.jpg");
  assert.equal(PLATES[5], "/plates/night.jpg");
});

test("plates append to thirty-six", () => {
  assert.equal(PLATES.length, 36);
  assert.ok(plateForPlayer("jokic"));
});

test("plate crops split the stills without moving the first six paths", () => {
  assert.equal(plateCrop("jokic"), plateCrop("jokic"));
  assert.notEqual(plateCrop("jokic"), plateCrop("sabrina"));
  assert.match(plateCrop("jokic"), /^(0|50|100)% (0|50|100)%$/);
  const crops = PLAYERS.map((p) => `${plateForPlayer(p.id)}@${plateCrop(p.id)}`);
  assert.ok(new Set(crops).size > PLATES.length);
});

test("house serial is stable and unique enough", () => {
  assert.equal(cardSerial("jokic"), cardSerial("jokic"));
  assert.notEqual(cardSerial("jokic"), cardSerial("sabrina"));
  assert.match(cardSerial("jokic"), /^FB-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
  assert.doesNotMatch(cardSerial("jokic"), /[IO01]/);
});

test("every name in the book has a unique plate", () => {
  const serials = PLAYERS.map((p) => cardSerial(p.id));
  assert.equal(new Set(serials).size, PLAYERS.length);
  assert.ok(serials.every((s) => /^FB-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(s)));
});

test("tobacco caption splits Jr. onto the last name", () => {
  assert.deepEqual(nameParts("Jaren Jackson Jr."), { first: "Jaren", last: "Jackson Jr." });
  assert.deepEqual(nameParts("Shai Gilgeous-Alexander"), { first: "Shai", last: "Gilgeous-Alexander" });
  assert.deepEqual(nameParts("Alperen Sengun"), { first: "Alperen", last: "Sengun" });
  assert.equal(initials("Jaren Jackson Jr."), "JJ");
  assert.equal(initials("Victor Wembanyama"), "VW");
});


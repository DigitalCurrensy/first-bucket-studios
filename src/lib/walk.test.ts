import assert from "node:assert/strict";
import { test } from "node:test";
import { PLAYERS_BY_ID } from "./nba.ts";
import { seasonWalk } from "./sim.ts";
import {
  dailyRoom,
  decodeWalk,
  encodeGoatWalk,
  encodePlayoffWalk,
  encodeWalk,
  encodeWnbaWalk,
  houseWalk,
  houseWalkDates,
  houseWalkWnba,
  isEphemeralOrigin,
  rosterKey,
  walkHref,
  walkIdFromHref,
  walkUrl,
} from "./walk.ts";

const ids = ["magic", "kobe", "shaq", "worthy", "kareem"];
const wnbaIds = ["aja", "sabrina", "napheesa", "caitlin", "athomas"];

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

test("garbage v2 ids fail closed", () => {
  assert.equal(decodeWalk("v2.nope"), null);
  assert.equal(decodeWalk("v2.goat.10.a~b~c~d~e"), null);
  assert.equal(decodeWalk("v2.goat.ninety.magic~kobe~shaq~worthy~kareem"), null);
  assert.equal(decodeWalk("v2.playoff.XXX.showtime.even.8.magic~kobe~shaq~worthy~kareem"), null);
  assert.equal(decodeWalk("v2.wnba.XXX.positionless.even.20.aja~sabrina~napheesa~caitlin~athomas"), null);
  assert.equal(decodeWalk("v2.season.XXX.showtime.even.61.magic~kobe~shaq~worthy~kareem"), null);
  assert.equal(decodeWalk("v2.wnba.LVA.positionless.even.20.fake~ids~not~in~book"), null);
});

test("encodeGoatWalk / decodeWalk kind goat roundtrip", () => {
  const id = encodeGoatWalk({ wins: 96, ids });
  const parsed = decodeWalk(id);
  assert.ok(parsed);
  assert.equal(parsed.kind, "goat");
  assert.equal(parsed.team, "GOAT Five");
  assert.equal(parsed.era, "All-time");
  assert.equal(parsed.luck, "Even");
  assert.equal(parsed.wins, 96);
  assert.deepEqual([...parsed.ids].sort(), [...ids].sort());
});

test("encodePlayoffWalk / decodeWalk kind playoff", () => {
  const id = encodePlayoffWalk({ team: "Lakers", era: "Showtime", luck: "Even", wins: 12, ids });
  const parsed = decodeWalk(id);
  assert.ok(parsed);
  assert.equal(parsed.kind, "playoff");
  assert.equal(parsed.team, "Lakers");
  assert.equal(parsed.era, "Showtime");
  assert.equal(parsed.luck, "Even");
  assert.equal(parsed.wins, 12);
  assert.equal(parsed.of, 16);
  assert.deepEqual([...parsed.ids].sort(), [...ids].sort());
});

test("encodeWnbaWalk / decodeWalk kind wnba", () => {
  const id = encodeWnbaWalk({
    team: "Aces",
    era: "Positionless",
    luck: "Even",
    wins: 32,
    ids: wnbaIds,
  });
  const parsed = decodeWalk(id);
  assert.ok(parsed);
  assert.equal(parsed.kind, "wnba");
  assert.equal(parsed.team, "Aces");
  assert.equal(parsed.era, "Positionless");
  assert.equal(parsed.luck, "Even");
  assert.equal(parsed.wins, 32);
  assert.equal(parsed.of, 40);
  assert.deepEqual([...parsed.ids].sort(), [...wnbaIds].sort());
});

test("v1 Lakers Showtime still decodes kind season", () => {
  const id = encodeWalk({ team: "Lakers", era: "Showtime", luck: "Even", wins: 61, ids });
  assert.match(id, /^v1\./);
  const parsed = decodeWalk(id);
  assert.ok(parsed);
  assert.equal(parsed.kind, "season");
  assert.equal(parsed.team, "Lakers");
  assert.equal(parsed.era, "Showtime");
  assert.equal(parsed.luck, "Even");
  assert.equal(parsed.wins, 61);
  assert.equal(parsed.of, 82);
  assert.deepEqual([...parsed.ids].sort(), [...ids].sort());
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

test("houseWalkDates is fourteen newest first", () => {
  const dates = houseWalkDates(14, "2026-08-29");
  assert.equal(dates.length, 14);
  assert.equal(dates[0], "2026-08-29");
  assert.equal(dates[1], "2026-08-28");
});

test("WNBA house walk is forty nights and encodes v2.wnba", () => {
  const a = houseWalkWnba("2026-08-29");
  const b = houseWalkWnba("2026-08-29");
  assert.equal(a.id, b.id);
  assert.equal(a.walk.nights.length, 40);
  assert.match(a.id, /^v2\.wnba\./);
  const parsed = decodeWalk(a.id);
  assert.ok(parsed);
  assert.equal(parsed.kind, "wnba");
});

test("walkHref encodes tildes, walkUrl is a path in node", () => {
  const id = encodeWalk({ team: "Bucks", era: "90s East", luck: "Thin", wins: 18, ids });
  assert.match(id, /~/);
  assert.equal(walkHref(id), `/walk/${encodeURIComponent(id)}`);
  assert.equal(walkUrl(id), walkHref(id));
});

test("sandbox and loopback origins are ephemeral", () => {
  assert.equal(isEphemeralOrigin("https://hds-u0aph2gcbrop-6014-1xsff.grok-code-wild.hades-www.grok-sandbox.com"), true);
  assert.equal(isEphemeralOrigin("https://grok-sandbox.com"), true);
  assert.equal(isEphemeralOrigin("http://127.0.0.1:8080"), true);
  assert.equal(isEphemeralOrigin("http://localhost:8080"), true);
  assert.equal(isEphemeralOrigin("https://grok.com"), false);
});

test("walkIdFromHref reads the certificate from a path or a burned sandbox url", () => {
  const id = "v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga";
  assert.equal(walkIdFromHref(walkHref(id)), id);
  assert.equal(
    walkIdFromHref(
      `https://hds-u0aph2gcbrop-6014-1xsff.grok-code-wild.hades-www.grok-sandbox.com${walkHref(id)}`,
    ),
    id,
  );
  assert.equal(walkIdFromHref("/nope"), "");
});


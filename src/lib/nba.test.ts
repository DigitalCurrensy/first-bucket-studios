import assert from "node:assert/strict";
import { test } from "node:test";
import { ALLTIME } from "./book-alltime.ts";
import { CURRENT } from "./book-current.ts";
import { WNBA } from "./book-wnba.ts";
import { shuffle } from "./utils.ts";
import {
  clubAbbr,
  cornersOk,
  currentBook,
  dealCornersPack,
  dealFrom,
  deriveSeed,
  FRANCHISES,
  freshEntropy,
  hashSeed,
  mulberry32,
  nbaBook,
  PLAYERS,
  PLAYERS_BY_ID,
  projectWins,
  rngFrom,
  sanitizeSeed,
  streamRng,
  WNBA_FRANCHISES,
  wnbaBook,
} from "./nba.ts";

test("the book has unique ids and no dummy peaks", () => {
  const ids = PLAYERS.map((p) => p.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(PLAYERS.every((p) => p.peak >= 70));
  assert.ok(PLAYERS.length >= 400);
  assert.ok(PLAYERS_BY_ID.mj);
  assert.ok(PLAYERS_BY_ID.aja);
  assert.ok(PLAYERS_BY_ID.sabrina);
  assert.ok(PLAYERS_BY_ID.lebron);
  for (const p of PLAYERS) {
    const row = p as unknown as Record<string, unknown>;
    assert.equal(row.img, undefined);
    assert.equal(row.photo, undefined);
    assert.equal(row.headshot, undefined);
    assert.equal(typeof p.name, "string");
  }
});

test("current book is NBA current plus WNBA", () => {
  const book = currentBook();
  assert.ok(book.length >= 150);
  assert.equal(
    book.length,
    CURRENT.length + WNBA.length,
  );
  assert.ok(WNBA.length >= 36);
  assert.ok(ALLTIME.length >= 30);
});

test("nba book is current NBA only", () => {
  const book = nbaBook();
  assert.ok(book.length >= 150);
  assert.ok(book.every((p) => p.shelf === "current"));
  assert.ok(!book.some((p) => p.id === "mj"));
});

test("thirty franchises", () => {
  assert.equal(FRANCHISES.length, 30);
});

test("visual shuffle does not always lead with Lakers", () => {
  const first = new Set<string>();
  for (let i = 0; i < 48; i += 1) first.add(shuffle(FRANCHISES)[0]!);
  assert.ok(first.size >= 8);
  assert.equal(first.has("Lakers") && first.size === 1, false);
});

test("wnbaBook length >= 36", () => {
  assert.ok(wnbaBook().length >= 36);
  assert.ok(wnbaBook().every((p) => p.shelf === "wnba"));
});

test("WNBA_FRANCHISES length 13", () => {
  assert.equal(WNBA_FRANCHISES.length, 13);
});

test("clubAbbr Aces is LVA", () => {
  assert.equal(clubAbbr("Aces"), "LVA");
});

test("dealCornersPack always contains at least 2G 2F 1C", () => {
  const pool = nbaBook();
  for (let seed = 1; seed <= 40; seed++) {
    const pack = dealCornersPack(pool, mulberry32(seed), 10);
    const g = pack.filter((p) => p.pos === "G").length;
    const f = pack.filter((p) => p.pos === "F").length;
    const c = pack.filter((p) => p.pos === "C").length;
    assert.ok(g >= 2, `seed ${seed} guards ${g}`);
    assert.ok(f >= 2, `seed ${seed} forwards ${f}`);
    assert.ok(c >= 1, `seed ${seed} centers ${c}`);
    assert.equal(pack.length, 10);
  }
});

test("four corners is two guards, two wings, one center", () => {
  assert.equal(
    cornersOk([
      PLAYERS_BY_ID.sga!,
      PLAYERS_BY_ID.curry!,
      PLAYERS_BY_ID.giannis!,
      PLAYERS_BY_ID.tatum!,
      PLAYERS_BY_ID.jokic!,
    ]),
    true,
  );
  assert.equal(
    cornersOk([
      PLAYERS_BY_ID.sga!,
      PLAYERS_BY_ID.curry!,
      PLAYERS_BY_ID.cade!,
      PLAYERS_BY_ID.tatum!,
      PLAYERS_BY_ID.jokic!,
    ]),
    false,
  );
});

test("a thin two-position five projects lottery, a balanced five does not floor", () => {
  const thin = [PLAYERS_BY_ID.herb!, PLAYERS_BY_ID.tobias!, PLAYERS_BY_ID.camara!, PLAYERS_BY_ID.kat!, PLAYERS_BY_ID.wcj!].filter(Boolean);
  if (thin.length === 5) {
    const wins = projectWins(thin, "90s East");
    assert.ok(wins <= 40, `lottery-range, got ${wins}`);
  }
  const stacked = [PLAYERS_BY_ID.mj!, PLAYERS_BY_ID.kobe!, PLAYERS_BY_ID.lebron!, PLAYERS_BY_ID.shaq!, PLAYERS_BY_ID.magic!];
  assert.ok(projectWins(stacked, "Showtime") >= 55);
});

test("dealFrom is a shuffle without replacement", () => {
  const rng = mulberry32(1);
  const ten = dealFrom(nbaBook(), rng, 10);
  assert.equal(ten.length, 10);
  assert.equal(new Set(ten.map((p) => p.id)).size, 10);
});

test("freshEntropy is unique across pulls", () => {
  const a = new Set(Array.from({ length: 40 }, () => freshEntropy()));
  assert.equal(a.size, 40);
});

test("sanitizeSeed strips to uppercase alphanumerics", () => {
  assert.equal(sanitizeSeed(" #alpha 12! "), "ALPHA12");
  assert.equal(sanitizeSeed("#seed-one"), "SEEDONE");
  assert.equal(sanitizeSeed("east-96"), "EAST96");
  assert.equal(sanitizeSeed("!!!"), "");
  assert.equal(hashSeed(`pull:${sanitizeSeed(" #alpha 12! ")}`), hashSeed("pull:ALPHA12"));
  assert.equal(sanitizeSeed(`${"A".repeat(40)}-92`), "A".repeat(32));
});

test("mulberry32 never yields NaN", () => {
  for (const seed of [Number.NaN, Number.POSITIVE_INFINITY, -1, 0, 1.5, hashSeed("")]) {
    const n = mulberry32(seed)();
    assert.ok(Number.isFinite(n) && n >= 0 && n < 1, String(seed));
  }
});

test("hashSeed stays FNV-1a so plates do not shuffle", () => {
  assert.equal(hashSeed(""), 2166136261);
  assert.equal(hashSeed("jokic"), hashSeed("jokic"));
  assert.notEqual(hashSeed("jokic"), hashSeed("sabrina"));
});

test("deriveSeed avalanches similar keys and stays finite", () => {
  assert.equal(deriveSeed("season:Bulls:90s East"), deriveSeed("season:Bulls:90s East"));
  assert.notEqual(deriveSeed("season:Bulls:90s East"), deriveSeed("season:Heat:90s East"));
  const a = deriveSeed("sked:Lakers:Showtime");
  const b = deriveSeed("sked:Lakers:Showtime!");
  let xor = (a ^ b) >>> 0;
  let bits = 0;
  while (xor) {
    bits += xor & 1;
    xor >>>= 1;
  }
  assert.ok(bits >= 10, `hamming ${bits}`);
  assert.equal(deriveSeed(""), deriveSeed(""));
  assert.ok(Number.isFinite(deriveSeed(undefined as unknown as string)));
});

test("mulberry32 mixer is locked — do not retune, walk nights recompute from ids", () => {
  const rng = mulberry32(1);
  assert.equal(rng(), 0.6270739405881613);
  assert.equal(rng(), 0.002735721180215478);
  assert.equal(deriveSeed("Thunder:Positionless:Even:HOUSEPACK"), 1670774552);
});

test("mulberry32 seeding entropy: nearby seeds diverge in the first draw", () => {
  const a = mulberry32(1)();
  const b = mulberry32(2)();
  const c = mulberry32(1 ^ 0x9e3779b9)();
  assert.ok(Math.abs(a - b) > 0.01, "adjacent seeds must not cluster");
  assert.ok(Math.abs(a - c) > 0.01, "xored lane seeds must not cluster");
  assert.notEqual(deriveSeed("pull:A"), deriveSeed("pull:B"));
});

test("freshEntropy is 64 bits of CSPRNG before the 32-bit fold", () => {
  const a = freshEntropy();
  const b = freshEntropy();
  assert.notEqual(a, b);
  assert.equal(a.length, 16);
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.equal(deriveSeed(a), deriveSeed(a));
  assert.notEqual(deriveSeed(a), deriveSeed(b));
});

test("rngFrom is deterministic and in unit interval", () => {
  const a = rngFrom("pull:SEEDONE");
  const b = rngFrom("pull:SEEDONE");
  const seqA = [a(), a(), a(), a()];
  const seqB = [b(), b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  assert.ok(seqA.every((n) => Number.isFinite(n) && n >= 0 && n < 1));
  const other = rngFrom("pull:SEEDTWO");
  assert.notDeepEqual(seqA, [other(), other(), other(), other()]);
});

test("streamRng lanes off one key stay independent and stable", () => {
  const pull = streamRng("pull", "Thunder:Positionless:Even:HOUSEPACK");
  const five = streamRng("five", "Thunder:Positionless:Even:HOUSEPACK");
  const pullSeq = [pull(), pull(), pull()];
  const fiveSeq = [five(), five(), five()];
  assert.notDeepEqual(pullSeq, fiveSeq);
  const again = streamRng("pull", "Thunder:Positionless:Even:HOUSEPACK");
  assert.deepEqual(pullSeq, [again(), again(), again()]);
});

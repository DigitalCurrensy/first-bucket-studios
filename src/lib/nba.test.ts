import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT } from "./book-current.ts";
import { WNBA } from "./book-wnba.ts";
import { ALLTIME } from "./book-alltime.ts";
import { cornersOk, currentBook, FRANCHISES, PLAYERS, PLAYERS_BY_ID } from "./nba.ts";

test("the book has unique ids and no dummy peaks", () => {
  const ids = PLAYERS.map((p) => p.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(PLAYERS.every((p) => p.peak >= 70));
  assert.ok(PLAYERS_BY_ID.mj);
  assert.ok(PLAYERS_BY_ID.aja);
  assert.ok(PLAYERS_BY_ID.sabrina);
  assert.ok(PLAYERS_BY_ID.lebron);
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

test("thirty franchises", () => {
  assert.equal(FRANCHISES.length, 30);
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

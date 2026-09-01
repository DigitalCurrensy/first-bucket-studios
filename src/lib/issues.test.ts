import assert from "node:assert/strict";
import { test } from "node:test";
import { firstEight, generateIssue, generatedArchive, issueById, issueFor, ISSUES } from "./issues/index.ts";

test("archive files still open by id", () => {
  assert.equal(issueById("001").id, "001");
  assert.equal(issueById("004").id, "004");
  assert.equal(ISSUES.length, 4);
});

test("a future week is generated, not a reprint of 004", () => {
  const live = issueFor("2026-W40");
  assert.equal(live.week, "2026-W40");
  assert.notEqual(live.id, "004");
  assert.equal(live.grafs.length, 3);
  assert.equal(live.love.length, 3);
  assert.equal(live.hate.length, 3);
});

test("same week prints the same live issue", () => {
  const a = generateIssue("2026-W41");
  const b = generateIssue("2026-W41");
  assert.deepEqual(a, b);
});

test("W40 and W41 do not share a title or first graf", () => {
  const a = generateIssue("2026-W40");
  const b = generateIssue("2026-W41");
  assert.notEqual(a.title, b.title);
  assert.notEqual(a.grafs[0], b.grafs[0]);
  assert.notEqual(firstEight(a.grafs[0] ?? ""), firstEight(b.grafs[0] ?? ""));
});

test("W35 still opens the archive file", () => {
  const issue = issueFor("2026-W35");
  assert.equal(issue.id, "001");
});

test("generated archive skips file weeks", () => {
  const weeks = generatedArchive("2026-W40", 4);
  assert.equal(weeks.length, 4);
  assert.equal(weeks[0], "2026-W40");
  assert.ok(!weeks.includes("2026-W38"));
});

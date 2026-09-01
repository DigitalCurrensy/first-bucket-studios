import { pad2, weekKey } from "../studio-save.ts";
import { ISSUE_001 } from "./001.ts";
import { ISSUE_002 } from "./002.ts";
import { ISSUE_003 } from "./003.ts";
import { ISSUE_004 } from "./004.ts";
import { generateIssue } from "./generate.ts";
import type { Issue } from "./types.ts";

export type { Issue } from "./types.ts";
export { generateIssue, firstEight } from "./generate.ts";

export const ISSUES: Issue[] = [ISSUE_001, ISSUE_002, ISSUE_003, ISSUE_004];

export function issueFor(week = weekKey()): Issue {
  const exact = ISSUES.find((issue) => issue.week === week);
  if (exact) return exact;
  return generateIssue(week);
}

export function issueById(id: string) {
  if (!id) return issueFor();
  const archived = ISSUES.find((issue) => issue.id === id);
  if (archived) return archived;
  if (/^\d{4}-W\d{2}$/.test(id)) return generateIssue(id);
  if (id === "live") return issueFor();
  return issueFor();
}

export function isArchivedIssue(issue: Issue) {
  return ISSUES.some((row) => row.id === issue.id && row.week === issue.week);
}

export function shiftWeek(week: string, delta: number) {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!m) return week;
  let year = Number(m[1]);
  let w = Number(m[2]) + delta;
  while (w < 1) {
    year -= 1;
    w += 52;
  }
  while (w > 52) {
    year += 1;
    w -= 52;
  }
  return `${year}-W${pad2(w)}`;
}

/** Last n generated (non-archive) weeks, newest first. */
export function generatedArchive(from = weekKey(), n = 4) {
  const out: string[] = [];
  let w = from;
  let guard = 0;
  while (out.length < n && guard < 24) {
    if (!ISSUES.some((row) => row.week === w)) out.push(w);
    w = shiftWeek(w, -1);
    guard += 1;
  }
  return out;
}
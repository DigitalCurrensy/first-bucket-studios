import { weekKey } from "../studio-save.ts";
import { ISSUE_001 } from "./001.ts";
import { ISSUE_002 } from "./002.ts";
import { ISSUE_003 } from "./003.ts";
import type { Issue } from "./types.ts";

export type { Issue } from "./types.ts";

export const ISSUES: Issue[] = [ISSUE_001, ISSUE_002, ISSUE_003];

export function issueFor(week = weekKey()): Issue {
  if (week <= ISSUE_001.week) return ISSUE_001;
  if (week === ISSUE_002.week) return ISSUE_002;
  return ISSUE_003;
}

export function issueById(id: string) {
  return ISSUES.find((issue) => issue.id === id) ?? ISSUE_001;
}

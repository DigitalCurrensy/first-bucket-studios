export type IssueNote = { name: string; note: string };

export type Issue = {
  id: string;
  week: string;
  date: string;
  kicker: string;
  title: string;
  dek: string;
  grafs: string[];
  love: IssueNote[];
  hate: IssueNote[];
  close: string;
};

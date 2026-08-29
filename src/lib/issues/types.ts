export type IssueNote = { name: string; note: string };

export type Issue = {
  id: "001" | "002" | "003";
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

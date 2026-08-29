import { sixScore } from "./market.ts";
import type { Player } from "./nba.ts";

export type Grade = "WIN" | "EVEN" | "PASS";

export type TradeGrade = {
  grade: Grade;
  delta: number;
  sendScore: number;
  getScore: number;
  note: string;
  pending: boolean;
};

export function sideScore(players: Player[]) {
  return players.reduce((n, p) => n + sixScore(p), 0);
}

export function gradeTrade(send: Player[], get: Player[]): TradeGrade {
  const sendScore = sideScore(send);
  const getScore = sideScore(get);
  const delta = getScore - sendScore;
  if (send.length === 0 || get.length === 0) {
    return {
      grade: "EVEN",
      delta: 0,
      sendScore,
      getScore,
      note: "Mark both sides.",
      pending: true,
    };
  }
  const sendPos = new Set(send.map((p) => p.pos));
  const getPos = new Set(get.map((p) => p.pos));
  const lost = [...sendPos].filter((pos) => !getPos.has(pos));
  let grade: Grade = "EVEN";
  if (delta >= 8) grade = "WIN";
  else if (delta <= -8) grade = "PASS";
  let note =
    grade === "WIN"
      ? "You get the counting cats."
      : grade === "PASS"
        ? "You are selling the floor."
        : "Move if the position fits. Do not move for the headline.";
  if (lost.length) note += ` You lose ${lost.join(" / ")}.`;
  return { grade, delta, sendScore, getScore, note, pending: false };
}

import { houseWalk } from "../walk.ts";
import { rngFrom, recordLine } from "../nba.ts";
import { weekDensity } from "../schedule.ts";
import { pad2, todayKey } from "../studio-save.ts";
import { buildTape } from "../tape.ts";
import { hateOf, loveOf } from "../week.ts";
import type { Issue } from "./types.ts";

function mondayOf(week: string) {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!m) return todayKey();
  const year = Number(m[1]);
  const w = Number(m[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (day - 1) + (w - 1) * 7);
  return `${monday.getUTCFullYear()}-${pad2(monday.getUTCMonth() + 1)}-${pad2(monday.getUTCDate())}`;
}

function prettyDate(iso: string) {
  const [y, mo, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 2026, (mo ?? 1) - 1, d ?? 1));
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function pick<T>(rng: () => number, list: readonly T[]) {
  return list[Math.floor(rng() * list.length)]!;
}

export function firstEight(text: string) {
  return text.split(/\s+/).filter(Boolean).slice(0, 8).join(" ");
}

/** Live issue. Same week → same copy. Graf openers do not share a skeleton. */
export function generateIssue(week: string): Issue {
  const rng = rngFrom(`issue-voice:${week}`);
  const tape = buildTape(week);
  const dens = [...weekDensity(week)].sort((a, b) => b.games - a.games || a.team.localeCompare(b.team));
  const heavy = dens[0];
  const thin = [...dens].sort((a, b) => a.games - b.games || a.team.localeCompare(b.team))[0];
  const up = tape.find((row) => row.mark === "UP") ?? tape[0];
  const down = tape.find((row) => row.mark === "DOWN") ?? tape[1] ?? tape[0];
  const date = mondayOf(week);
  const house = houseWalk(date);
  const love = loveOf(week);
  const hate = hateOf(week);
  const axis = up?.player.name ?? "The axis";
  const sitName = down?.player.name ?? "the thin-game star";
  const heavyClub = heavy?.team ?? "OKC";
  const thinClub = thin?.team ?? "LAL";
  const heavyGames = heavy?.games ?? 4;
  const thinGames = thin?.games ?? 2;
  const houseLine = `${house.room.team} ${recordLine(house.walk.wins)}`;
  const names = house.five.map((p) => p.name).join(", ");
  const stream = hate[2]?.name ?? "Empty-stat streams";

  const titles = [
    `${heavyClub} prints ${heavyGames}. ${axis} is the axis.`,
    `${heavyGames} at ${heavyClub}. Sit ${sitName}.`,
    `${axis} holds. ${thinClub} is how you lose.`,
    `Sit the second night. ${heavyClub} is the board.`,
  ];
  const deks = [
    `${thinClub} prints ${thinGames}. Sit ${sitName} on the second night. This is a desk, not a signup.`,
    `${heavyClub} is dense. ${sitName} on a back-to-back is a volunteer loss.`,
    `The Tape marked ${up?.mark ?? "UP"}. ${thinClub} is thin. Come back next week.`,
  ];
  const densityGrafs = [
    `Heavy print first. ${heavyClub} owns ${heavyGames}. ${thinClub} is ${thinGames}. Four with secondary usage still beats two of a star who sits the second night.`,
    `Count the nights. ${heavyGames} at ${heavyClub} is the board. ${thinClub} going ${thinGames} is how a counting week dies if you start ${sitName} through the back-to-back.`,
    `The slate writes. Do not argue the name. ${heavyClub} prints ${heavyGames}. ${thinClub} prints ${thinGames}. Schedule is the tool. Pace is talk.`,
    `Games before names. ${heavyClub} is dense — ${heavyGames}. ${thinClub} is thin — ${thinGames}. Sit the second night before you sit the usage.`,
  ];
  const axisGrafs = [
    `Leave the axis. ${axis} is marked ${up?.mark ?? "UP"}. House five ${names} walked ${houseLine}. Yours is yours.`,
    `The Tape already had ${axis}. ${names} are the house card on ${houseLine}. Do not get cute with the axis.`,
    `${houseLine} hangs here: ${names}. ${axis} is the one you do not sit for a stream.`,
    `Hold ${axis}. The house walked ${houseLine} with ${names}. A stream is not a reason.`,
  ];
  const sitGrafs = [
    `Volunteer L. ${sitName} through a back-to-back is a counting-cat gift. Stream ${stream} instead.`,
    `Sit ${sitName}. Stream the column you are losing — ${stream} — not the name you like.`,
    `A 9-cat week dies on ${stream} and a stubborn start of ${sitName}. The slate is the tool.`,
    `Second night, sit. ${sitName} is the volunteer. ${stream} is the stream.`,
  ];

  const houseGrafs = [
    `House card first. ${houseLine} with ${names}. The Brief hangs it. Yours is a different five.`,
    `The house walked ${houseLine}. ${names}. Come back next week for a new card, not a reprint.`,
    `${names} are today's house. ${houseLine}. Do not confuse the hanging five with yours.`,
  ];
  const streamGrafs = [
    `Stream ${stream}. Not because the name is loud. Because the column is empty.`,
    `${stream} is the stream. ${sitName} is the volunteer L. Those are different jobs.`,
    `If you need the cat, ${stream} is on the board. Leave ${axis} alone.`,
  ];
  const jobs = ["density", "axis", "sit", "house", "stream"] as const;
  const job = pick(rng, jobs);
  const bank = {
    density: densityGrafs,
    axis: axisGrafs,
    sit: sitGrafs,
    house: houseGrafs,
    stream: streamGrafs,
  };
  const rest = jobs.filter((row) => row !== job);
  const grafs = [pick(rng, bank[job]), pick(rng, bank[rest[0]!]!), pick(rng, bank[rest[1]!]!)];

  return {
    id: week,
    week,
    date: prettyDate(date),
    kicker: "Brief Desk · Live week",
    title: pick(rng, titles),
    dek: pick(rng, deks),
    grafs,
    love,
    hate,
    close: "Editorial only. Not a sportsbook. Not an NCAA determination. Come back next week.",
  };
}
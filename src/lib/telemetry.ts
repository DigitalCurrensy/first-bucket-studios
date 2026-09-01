import { hashSeed, type Player } from "./nba.ts";

export type Flex = "none" | "point-forward" | "stretch";

export type MathLine = {
  label: string;
  pts: number;
  why: string;
};

export type Telemetry = {
  lines: MathLine[];
  raw: number;
  projected: number;
  of: number;
  hash: string;
};

export function flexOf(p: Player): Flex {
  if (p.pos === "F" && p.ast >= 5) return "point-forward";
  if (p.pos === "C" && p.threes >= 1.5) return "stretch";
  return "none";
}

function slotsOf(roster: Player[]) {
  const slots = { G: 0, F: 0, C: 0 };
  for (const p of roster) {
    slots[p.pos] += 1;
    const flex = flexOf(p);
    if (flex === "point-forward") slots.G += 0.5;
    if (flex === "stretch") slots.F += 0.35;
  }
  return slots;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function stamp(s: string) {
  return hashSeed(s).toString(16);
}

function eraKind(era: string) {
  if (era === "90s East" || era === "60s Celtic") return "hand-check";
  if (era === "Positionless") return "pace";
  if (era === "04 Defense") return "defense";
  if (era === "Showtime") return "showtime";
  if (era === "Twin Towers") return "towers";
  return "even";
}

/** Itemized season projection. Same number `projectWins` uses. */
export function seasonTelemetry(roster: Player[], era: string, of = 82): Telemetry {
  const lines: MathLine[] = [];
  if (roster.length === 0) {
    return { lines, raw: 0, projected: 0, of, hash: "0" };
  }
  const avg = roster.reduce((n, p) => n + p.peak, 0) / roster.length;
  const peakPts = (avg - 78) * 3.2;
  lines.push({ label: "Peak", pts: round1(peakPts), why: `Avg peak ${avg.toFixed(1)}` });

  const unique = new Set(roster.map((p) => p.pos)).size;
  const mix = unique * 5;
  lines.push({ label: "Position mix", pts: mix, why: `${unique} spots covered` });

  const eraFit = roster.filter((p) => p.era === era).length * 2.4;
  lines.push({ label: "Era fit", pts: round1(eraFit), why: `${roster.filter((p) => p.era === era).length} names from this era` });

  const slots = slotsOf(roster);
  const missing = (slots.G < 1 ? 1 : 0) + (slots.F < 1 ? 1 : 0) + (slots.C < 1 ? 1 : 0);
  if (missing) {
    const tax = -8 * missing * (of / 82);
    lines.push({
      label: "Positional deficit",
      pts: round1(tax),
      why: `Open ${["G", "F", "C"].filter((k) => slots[k as "G" | "F" | "C"] < 1).join("/")} even after flex`,
    });
  }

  const flexHits = roster.filter((p) => flexOf(p) !== "none");
  if (flexHits.length) {
    const pts = flexHits.length * 1.6 * (of / 82);
    lines.push({
      label: "Pace synergy",
      pts: round1(pts),
      why: flexHits.map((p) => `${p.name.split(" ").pop()} ${flexOf(p)}`).join(" · "),
    });
  }

  const kind = eraKind(era);
  if (kind === "hand-check") {
    const soft = roster.filter((p) => (p.pos === "F" || p.pos === "G") && p.stl < 1.2);
    if (soft.length) {
      lines.push({
        label: "90s hand-check",
        pts: round1(-2.2 * soft.length * (of / 82)),
        why: "Wings without the steal don't survive the hand-check.",
      });
    }
  }
  if (kind === "pace") {
    const brick = roster.filter((p) => p.pos === "C" && p.threes < 0.8);
    if (brick.length) {
      lines.push({
        label: "Pace-and-space",
        pts: round1(-3.1 * brick.length * (of / 82)),
        why: "Non-shooting centers tax the floor in this era.",
      });
    }
  }
  if (kind === "defense") {
    const avgStop = roster.reduce((n, p) => n + p.stl + p.blk, 0) / roster.length;
    if (avgStop < 1.8) {
      lines.push({
        label: "04 defense",
        pts: round1(-4 * (of / 82)),
        why: `Stop rate ${avgStop.toFixed(1)}. This era wants the steal and the block.`,
      });
    } else {
      lines.push({
        label: "04 defense",
        pts: round1(3.2 * (of / 82)),
        why: `Stop rate ${avgStop.toFixed(1)}. The floor holds.`,
      });
    }
  }
  if (kind === "showtime") {
    const avgAst = roster.reduce((n, p) => n + p.ast, 0) / roster.length;
    lines.push({
      label: "Showtime",
      pts: round1((avgAst - 4) * 1.8 * (of / 82)),
      why: `Assist clip ${avgAst.toFixed(1)}.`,
    });
  }
  if (kind === "towers") {
    const avgBlk = roster.reduce((n, p) => n + p.blk, 0) / roster.length;
    lines.push({
      label: "Twin Towers",
      pts: round1((avgBlk - 1) * 2.4 * (of / 82)),
      why: `Block clip ${avgBlk.toFixed(1)}.`,
    });
  }

  const raw = lines.reduce((n, row) => n + row.pts, 0);
  const scaled = of === 82 ? raw : (raw / 82) * of;
  const projected = Math.max(Math.round(of * 0.22), Math.min(of, Math.round(scaled)));
  const hash = stamp(`${era}:${of}:${[...roster.map((p) => p.id)].sort().join("~")}`);
  return { lines, raw: round1(raw), projected, of, hash };
}

export function goatTelemetry(roster: Player[]): Telemetry {
  const lines: MathLine[] = [];
  if (roster.length === 0) return { lines, raw: 0, projected: 0, of: 0, hash: "0" };
  const avg = roster.reduce((n, p) => n + p.peak, 0) / roster.length;
  lines.push({ label: "Peak", pts: round1(avg), why: `Avg peak ${avg.toFixed(1)}` });
  const balance = new Set(roster.map((p) => p.pos)).size;
  lines.push({ label: "Position mix", pts: round1((balance - 1) * 2.4), why: `${balance} spots` });
  const eras = new Set(roster.map((p) => p.era)).size;
  lines.push({ label: "Era spread", pts: round1((eras - 1) * 0.8), why: `${eras} eras` });
  const copies = Math.max(...(["G", "F", "C"] as const).map((pos) => roster.filter((p) => p.pos === pos).length), 0);
  if (copies > 2) {
    lines.push({ label: "Positional deficit", pts: -Math.max(0, copies - 2) * 6, why: `${copies} at one spot` });
  }
  const flexHits = roster.filter((p) => flexOf(p) !== "none");
  if (flexHits.length) {
    lines.push({ label: "Pace synergy", pts: flexHits.length * 0.6, why: "Point-forward / stretch flex" });
  }
  const raw = lines.reduce((n, row) => n + row.pts, 0);
  const projected = Math.max(72, Math.min(99, Math.round(raw)));
  const hash = stamp(`goat:${[...roster.map((p) => p.id)].sort().join("~")}`);
  return { lines, raw: round1(raw), projected, of: 0, hash };
}

export function playoffTelemetry(roster: Player[], era = "2000s"): Telemetry {
  const lines: MathLine[] = [];
  if (roster.length === 0) return { lines, raw: 0, projected: 0, of: 16, hash: "0" };
  const avg = roster.reduce((n, p) => n + p.peak, 0) / roster.length;
  lines.push({ label: "Peak", pts: round1((avg - 91) * 1.2), why: `Avg peak ${avg.toFixed(1)}` });
  const balance = new Set(roster.map((p) => p.pos)).size;
  lines.push({ label: "Position mix", pts: round1(balance * 1.8), why: `${balance} spots` });
  const twoWay = roster.reduce((n, p) => n + p.stl + p.blk, 0) / roster.length;
  lines.push({ label: "Two-way", pts: round1(twoWay * 1.5), why: `Stop clip ${twoWay.toFixed(1)}` });
  const copies = Math.max(...(["G", "F", "C"] as const).map((pos) => roster.filter((p) => p.pos === pos).length), 0);
  if (copies > 2) {
    lines.push({ label: "Positional deficit", pts: -Math.max(0, copies - 2) * 3.5, why: `${copies} at one spot` });
  }
  const flexHits = roster.filter((p) => flexOf(p) !== "none");
  if (flexHits.length) {
    lines.push({ label: "Pace synergy", pts: round1(flexHits.length * 0.4), why: "Point-forward / stretch flex" });
  }
  const kind = eraKind(era);
  if (kind === "hand-check") {
    const soft = roster.filter((p) => (p.pos === "F" || p.pos === "G") && p.stl < 1.2);
    if (soft.length) {
      lines.push({
        label: "90s hand-check",
        pts: round1(-0.6 * soft.length),
        why: "Wings without the steal don't survive seven-game series.",
      });
    }
  }
  if (kind === "pace") {
    const brick = roster.filter((p) => p.pos === "C" && p.threes < 0.8);
    if (brick.length) {
      lines.push({
        label: "Pace-and-space",
        pts: round1(-0.8 * brick.length),
        why: "Non-shooting centers tax the floor in this era.",
      });
    }
  }
  if (kind === "defense") {
    const avgStop = roster.reduce((n, p) => n + p.stl + p.blk, 0) / roster.length;
    lines.push({
      label: "04 defense",
      pts: round1(avgStop >= 1.8 ? 0.8 : -0.9),
      why: `Stop rate ${avgStop.toFixed(1)}.`,
    });
  }
  const raw = lines.reduce((n, row) => n + row.pts, 0);
  const projected = Math.max(0, Math.min(16, Math.round(raw)));
  const hash = stamp(`playoff:${era}:${[...roster.map((p) => p.id)].sort().join("~")}`);
  return { lines, raw: round1(raw), projected, of: 16, hash };
}

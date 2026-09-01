import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel, eraLabel, type Player } from "./nba.ts";
import { drawCrestOps } from "./crest-marks.ts";
import { nativeShare, presentFile } from "./deliver.ts";
import { houseInk } from "./house-ink.ts";
import { initials, cardSerial } from "./plates.ts";
import { acquireSheet, releaseSheet } from "./canvas-sheet.ts";
import { encodeGoatWalk, encodePlayoffWalk, encodeWalk, encodeWnbaWalk, walkUrl } from "./walk.ts";

const INK = "#0c0b09";
const PAPER = "#f4efe4";
const ACCENT = "#c4a574";
const GOOD = "#3d9a68";
const WARN = "#c4894a";

export type CardKind = "season" | "goat" | "playoff" | "mark" | "wnba";
export type CardAspect = "plate" | "square" | "story" | "og";

export const ASPECTS: Array<{ id: CardAspect; label: string }> = [
  { id: "plate", label: "5×7 plate" },
  { id: "square", label: "1:1 feed" },
  { id: "story", label: "9:16 studio" },
  { id: "og", label: "Studio frame" },
];

function frameOf(aspect: CardAspect) {
  if (aspect === "square") return { w: 1080, h: 1080 };
  if (aspect === "story") return { w: 1080, h: 1920 };
  if (aspect === "og") return { w: 1200, h: 630 };
  return { w: 1080, h: 1350 };
}

let lastShare: Parameters<typeof renderShareCard>[0] | null = null;
export function lastShareOpts() {
  return lastShare;
}

function nightsOf(kind: CardKind) {
  if (kind === "playoff") return 16;
  if (kind === "wnba") return 40;
  if (kind === "goat") return 0;
  return 82;
}

function record(kind: CardKind, wins: number) {
  if (kind === "goat") return goatLabel(wins);
  if (kind === "playoff") return `${playoffLine(wins)} · ${playoffLabel(wins)}`;
  return `${recordLine(wins, nightsOf(kind))} · ${winLabel(wins, nightsOf(kind))}`;
}

function walkId(opts: { team: string; era: string; wins: number; roster: Player[]; kind: CardKind; luck?: string }) {
  const ids = opts.roster.map((p) => p.id);
  if (opts.kind === "goat") return encodeGoatWalk({ wins: opts.wins, ids });
  if (!opts.luck) return "";
  if (opts.kind === "playoff") return encodePlayoffWalk({ team: opts.team, era: opts.era, luck: opts.luck, wins: opts.wins, ids });
  if (opts.kind === "wnba") return encodeWnbaWalk({ team: opts.team, era: opts.era, luck: opts.luck, wins: opts.wins, ids });
  return encodeWalk({ team: opts.team, era: opts.era, luck: opts.luck, wins: opts.wins, ids });
}

export function cardCaption(opts: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
  luck?: string;
  walk?: string;
  beat?: number;
}) {
  const { team, era, wins, roster, kind = "season", walk, beat } = opts;
  const names = roster.map((p) => p.name).join(", ");
  const path = walk ? ` ${walkUrl(walk)}` : "";
  const delta =
    beat != null && Number.isFinite(beat)
      ? wins > beat
        ? ` Beat ${beat} by ${wins - beat}.`
        : wins < beat
          ? ` Short of ${beat} by ${beat - wins}.`
          : " Even with the mark."
      : "";
  if (kind === "goat") return `GOAT Five ${wins} · ${goatLabel(wins)} at First Bucket Studio: ${names}.${delta}${path}`;
  if (kind === "playoff") {
    return `Walked a ${playoffLine(wins)} ${eraLabel(era)} ${team} playoff run at First Bucket Studio: ${names}.${delta}${path}`;
  }
  if (kind === "wnba") {
    return `Walked a ${recordLine(wins, 40)} ${eraLabel(era)} ${team} at First Bucket Studio: ${names}.${delta}${path}`;
  }
  return `Walked a ${recordLine(wins)} ${eraLabel(era)} ${team} at First Bucket Studio: ${names}.${delta}${path}`;
}

function hexA(hex: string, a: number) {
  const n = hex.replace("#", "");
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function drawNight(ctx: CanvasRenderingContext2D, w: number, h: number, pal: { ink: string; foil: string; flare: string }) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  const mesh = ctx.createRadialGradient(w * 0.08, h * -0.02, 0, w * 0.08, 0, w * 0.85);
  mesh.addColorStop(0, hexA(pal.flare || ACCENT, 0.28));
  mesh.addColorStop(0.45, hexA(pal.ink, 0.1));
  mesh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mesh;
  ctx.fillRect(0, 0, w, h);
  const heat = ctx.createRadialGradient(w * 0.92, h * 1.05, 0, w * 0.92, h, w * 0.7);
  heat.addColorStop(0, hexA(pal.foil, 0.16));
  heat.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = heat;
  ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.12, w / 2, h * 0.5, h * 0.78);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = pal.ink;
  ctx.fillRect(0, 0, 8, h);
}

function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = PAPER;
  for (let y = 0; y < h; y += 6) {
    for (let x = y % 12; x < w; x += 12) ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function drawFoilNum(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, px: number) {
  fraunces(ctx, 600, px, { opsz: 36, wonk: 0, soft: 0 });
  const g = ctx.createLinearGradient(x, y - px, x + px * 1.4, y);
  g.addColorStop(0, "#f7f1e4");
  g.addColorStop(0.28, "#e4c98a");
  g.addColorStop(0.5, "#c4a574");
  g.addColorStop(0.72, "#f4efe4");
  g.addColorStop(1, "#8a6a3b");
  ctx.save();
  ctx.shadowColor = "rgba(196, 165, 116, 0.35)";
  ctx.shadowBlur = 28;
  ctx.fillStyle = g;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawTicks(
  ctx: CanvasRenderingContext2D,
  nights: { win: boolean }[],
  x: number,
  y: number,
  width: number,
) {
  if (nights.length === 0) return;
  const gap = 3;
  const size = Math.max(4, Math.min(10, (width - gap * (nights.length - 1)) / nights.length));
  const cols = Math.min(nights.length, Math.floor((width + gap) / (size + gap)));
  nights.forEach((night, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.fillStyle = night.win ? PAPER : "rgba(244, 239, 228, 0.16)";
    ctx.fillRect(x + col * (size + gap), y + row * (size + gap), size, size);
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPlate(
  ctx: CanvasRenderingContext2D,
  _img: HTMLImageElement | null,
  name: string,
  x: number,
  y: number,
  size: number,
  pos = "",
) {
  ctx.save();
  roundRect(ctx, x, y, size, size, 10);
  ctx.fillStyle = "#141210";
  ctx.fill();
  ctx.strokeStyle = hexA(ACCENT, 0.55);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, Math.round(size * 0.38), { opsz: 36, wonk: 0, soft: 0, italic: true });
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials(name), x + size / 2, y + size / 2 - (pos ? 6 : 0));
  if (pos) {
    ctx.fillStyle = ACCENT;
    ctx.font = "600 11px 'Instrument Sans', sans-serif";
    ctx.letterSpacing = "0.14em";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(pos, x + size / 2, y + size - 12);
  }
  ctx.restore();
}

function fraunces(
  ctx: CanvasRenderingContext2D,
  weight: number,
  px: number,
  opts?: { opsz?: number; wonk?: number; soft?: number; italic?: boolean },
) {
  ctx.font = `${opts?.italic ? "italic " : ""}${weight} ${px}px Fraunces, Georgia, serif`;
  const variable = ctx as CanvasRenderingContext2D & { fontVariationSettings?: string };
  if (typeof variable.fontVariationSettings === "string") {
    variable.fontVariationSettings = `"opsz" ${opts?.opsz ?? Math.min(144, Math.max(9, px))}, "SOFT" ${opts?.soft ?? 0}, "WONK" ${opts?.wonk ?? 0}`;
  }
}

function drawPrinterMarks(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const m = 28;
  const len = 16;
  ctx.save();
  ctx.strokeStyle = "rgba(250, 246, 238, 0.32)";
  ctx.lineWidth = 1;
  const corners: Array<[number, number, number, number]> = [
    [m, m, 1, 1],
    [w - m, m, -1, 1],
    [m, h - m, 1, -1],
    [w - m, h - m, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x - dx * 8, y);
    ctx.lineTo(x + dx * len, y);
    ctx.moveTo(x, y - dy * 8);
    ctx.lineTo(x, y + dy * len);
    ctx.stroke();
  }
  const cx = w / 2;
  const cy = m - 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.moveTo(cx - 7, cy);
  ctx.lineTo(cx + 7, cy);
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx, cy + 7);
  ctx.stroke();
  ctx.fillStyle = ACCENT;
  ctx.fillRect(w - m - 16, m - 10, 8, 8);
  ctx.restore();
}

function drawCropGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(250, 246, 238, 0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 10]);
  const inset = 48;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.beginPath();
  ctx.moveTo(w / 2, inset);
  ctx.lineTo(w / 2, h - inset);
  ctx.moveTo(inset, h / 2);
  ctx.lineTo(w - inset, h / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

async function waitFonts() {
  try {
    if (typeof document === "undefined" || !document.fonts) return;
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1200);
      }),
    ]);
  } catch {
    /* draw with fallbacks */
  }
}

async function loadEmblem(team: string) {
  const slug = team === "GOAT Five" ? "goat" : team.toLowerCase().replace(/\s+/g, "-");
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = `/emblems/${slug}.png`;
    await Promise.race([
      img.decode(),
      new Promise<void>((_, reject) => {
        window.setTimeout(() => reject(new Error("emblem")), 1500);
      }),
    ]);
    return img;
  } catch {
    return null;
  }
}

export async function renderShareCard(opts: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
  luck?: string;
  nights?: { win: boolean }[];
  ghostNights?: { win: boolean }[];
  aspect?: CardAspect;
}): Promise<Blob> {
  lastShare = opts;
  const { team, era, wins, roster, kind = "season", luck, nights, ghostNights, aspect = "plate" } = opts;
  await waitFonts();
  const pal = houseInk(team, kind === "wnba" ? "wnba" : "nba");
  const emblem = await loadEmblem(team);
  const { w, h } = frameOf(aspect);
  return withSheet(w, h, (ctx) => {
    const y = (n: number) => Math.round(n * (aspect === "og" ? 0.46 : h / 1350));
    const x = (n: number) => Math.round(n * (w / 1080));
    const og = aspect === "og";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    drawNight(ctx, w, h, pal);
    drawPrinterMarks(ctx, w, h);
    if (aspect === "story" || aspect === "square") drawCropGrid(ctx, w, h);

    ctx.fillStyle = pal.ink;
    ctx.fillRect(x(64), y(48), x(72), 6);

    if (emblem) {
      try {
        ctx.drawImage(emblem, x(64), y(72), 72, 72);
      } catch {
        if (kind !== "goat") drawCrestOps(ctx, team, x(64), y(76), 64, pal.foil);
      }
    } else if (kind !== "goat") {
      drawCrestOps(ctx, team, x(64), y(76), 64, pal.foil);
    }

    const headX = emblem || kind !== "goat" ? x(156) : x(64);
    ctx.fillStyle = ACCENT;
    ctx.font = "600 18px 'Instrument Sans', sans-serif";
    ctx.letterSpacing = "0.16em";
    ctx.fillText("FIRST BUCKET", headX, y(100));
    ctx.letterSpacing = "0px";
    ctx.fillStyle = "rgba(244, 239, 228, 0.62)";
    ctx.font = "500 22px 'Instrument Sans', sans-serif";
    ctx.fillText(
      luck ? `${team}  ·  ${eraLabel(era)}  ·  ${luck}` : `${team}  ·  ${eraLabel(era)}`,
      headX,
      y(136),
    );

    ctx.fillStyle = PAPER;
    drawFoilNum(ctx, String(wins), x(64), y(og ? 270 : 360), og ? 92 : 220);

    const lock = record(kind, wins);
    const stamp =
      kind === "goat" ? goatLabel(wins) : kind === "playoff" ? playoffLabel(wins) : winLabel(wins, nightsOf(kind));
    ctx.fillStyle = ACCENT;
    ctx.font = "600 20px 'Instrument Sans', sans-serif";
    ctx.letterSpacing = "0.18em";
    ctx.fillText(stamp.toUpperCase(), x(64), y(og ? 318 : 418));
    ctx.letterSpacing = "0px";
    ctx.fillStyle = "rgba(244, 239, 228, 0.72)";
    ctx.font = og ? "500 22px 'Instrument Sans', sans-serif" : "500 30px 'Instrument Sans', sans-serif";
    ctx.fillText(lock, x(64), y(og ? 348 : 460));

    ctx.strokeStyle = hexA(ACCENT, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x(64), y(og ? 368 : 498));
    ctx.lineTo(w - x(64), y(og ? 368 : 498));
    ctx.stroke();

    if (og) {
      const plate = 64;
      roster.forEach((p, i) => {
        const rowX = x(64) + i * 210;
        drawPlate(ctx, null, p.name, rowX, y(390), plate, p.pos);
        ctx.textAlign = "left";
        ctx.fillStyle = PAPER;
        ctx.font = "500 16px 'Instrument Sans', sans-serif";
        ctx.fillText(p.name.split(" ").slice(-1)[0] || p.name, rowX, y(390) + plate + 22);
      });
    } else {
      const inner = w - x(128);
      const gap = 18;
      const plate = Math.min(156, Math.floor((inner - gap * (roster.length - 1)) / Math.max(1, roster.length)));
      const rowW = roster.length * plate + (roster.length - 1) * gap;
      const startX = x(64) + Math.max(0, Math.floor((inner - rowW) / 2));
      const rowY = y(540);
      roster.forEach((p, i) => {
        const px = startX + i * (plate + gap);
        drawPlate(ctx, null, p.name, px, rowY, plate, p.pos);
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = PAPER;
        ctx.font = "600 18px 'Instrument Sans', sans-serif";
        const last = p.name.split(" ").slice(-1)[0] || p.name;
        ctx.fillText(last, px + plate / 2, rowY + plate + 28);
        ctx.fillStyle = "rgba(244, 239, 228, 0.4)";
        ctx.font = "500 13px 'Instrument Sans', sans-serif";
        ctx.letterSpacing = "0.1em";
        ctx.fillText(cardSerial(p.id), px + plate / 2, rowY + plate + 50);
        ctx.letterSpacing = "0px";
      });
      ctx.textAlign = "left";
    }

    if (!og && nights && nights.length > 0) {
      drawTicks(ctx, nights, x(64), h - 168, w - x(128));
    }

    const walk = walkId({ team, era, wins, roster, kind, luck });
    ctx.fillStyle = "rgba(244, 239, 228, 0.38)";
    ctx.font = "500 15px 'Instrument Sans', sans-serif";
    ctx.fillText("House job · night stock", x(64), h - 70);
    if (walk) {
      ctx.fillStyle = ACCENT;
      ctx.font = "500 14px ui-monospace, 'SF Mono', Menlo, monospace";
      ctx.fillText(walk, x(64), h - 42);
    }
    drawGrain(ctx, w, h);
  });
}

export async function renderMarkCard(opts: {
  name: string;
  mark: string;
  note: string;
  date: string;
}): Promise<Blob> {
  await waitFonts();
  const w = 1080;
  const h = 1350;
  return withSheet(w, h, (ctx) => {

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  drawPrinterMarks(ctx, w, h);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  THE TAPE", 80, 120);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, 72, { opsz: 96 });
  wrapText(ctx, opts.name, 80, 280, 920, 84);

  ctx.fillStyle = opts.mark === "UP" ? GOOD : opts.mark === "DOWN" ? WARN : PAPER;
  fraunces(ctx, 600, 160, { opsz: 144 });
  ctx.fillText(opts.mark, 80, 620);

  ctx.fillStyle = "rgba(250, 246, 238, 0.78)";
  ctx.font = "500 36px 'Instrument Sans', sans-serif";
  wrapText(ctx, opts.note, 80, 760, 920, 48);

  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Instrument Sans', sans-serif";
  ctx.fillText(opts.date, 80, 1200);
  ctx.fillText("Marks. Not a book. First Bucket Studio.", 80, 1260);

  });
}

export async function renderSlateCard(opts: {
  week: string;
  league: string;
  rows: Array<{ name: string; club: string; games: number; call: string; opp: string; home: boolean }>;
}): Promise<Blob> {
  await waitFonts();
  const w = 1080;
  const h = 1350;
  return withSheet(w, h, (ctx) => {

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  drawPrinterMarks(ctx, w, h);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  THE SLATE", 80, 110);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, 56, { opsz: 96 });
  ctx.fillText(opts.week, 80, 200);

  ctx.fillStyle = "rgba(250, 246, 238, 0.55)";
  ctx.font = "500 28px 'Instrument Sans', sans-serif";
  ctx.fillText(`${opts.league}. Editorial. Not a line.`, 80, 250);

  opts.rows.slice(0, 10).forEach((row, i) => {
    const y = 320 + i * 88;
    ctx.fillStyle = row.call === "START" ? GOOD : row.call === "SIT" ? WARN : PAPER;
    ctx.font = "600 22px 'Instrument Sans', sans-serif";
    ctx.fillText(row.call, 80, y);
    ctx.fillStyle = PAPER;
    ctx.font = "500 32px 'Instrument Sans', sans-serif";
    ctx.fillText(row.name, 220, y);
    ctx.fillStyle = "rgba(250, 246, 238, 0.5)";
    ctx.font = "500 22px 'Instrument Sans', sans-serif";
    ctx.fillText(`${row.club} ${row.home ? "vs" : "@"} ${row.opp} · ${row.games}g`, 220, y + 32);
  });

  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Instrument Sans', sans-serif";
  ctx.fillText("First Bucket Studio. Not a sportsbook.", 80, 1280);

  });
}

export async function renderGymCard(opts: {
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  quarter: string;
  clock: string;
  name: string;
  role: string;
  pts?: string;
  reb?: string;
  ast?: string;
  threes?: string;
}): Promise<Blob> {
  await waitFonts();
  const w = 1080;
  const h = 1350;
  return withSheet(w, h, (ctx) => {

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  drawPrinterMarks(ctx, w, h);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  THE GYM", 80, 110);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, 64, { opsz: 144 });
  ctx.fillText(opts.home, 80, 280);
  ctx.fillText(opts.homeScore, 720, 280);
  ctx.fillText(opts.away, 80, 380);
  ctx.fillText(opts.awayScore, 720, 380);

  ctx.fillStyle = "rgba(250, 246, 238, 0.55)";
  ctx.font = "500 32px 'Instrument Sans', sans-serif";
  ctx.fillText(`${opts.quarter}  ·  ${opts.clock}`, 80, 460);

  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, 56, { opsz: 96 });
  wrapText(ctx, opts.name || "Name", 80, 640, 920, 64);
  ctx.fillStyle = "rgba(250, 246, 238, 0.55)";
  ctx.font = "500 32px 'Instrument Sans', sans-serif";
  wrapText(ctx, opts.role || "Role", 80, 760, 920, 44);

  ctx.fillStyle = PAPER;
  ctx.font = "600 36px Fraunces, Georgia, serif";
  const stats = [
    ["PTS", opts.pts ?? ""],
    ["REB", opts.reb ?? ""],
    ["AST", opts.ast ?? ""],
    ["3s", opts.threes ?? ""],
  ].filter((row) => row[1]);
  stats.forEach((row, i) => {
    ctx.fillStyle = "rgba(250, 246, 238, 0.45)";
    ctx.font = "600 20px 'Instrument Sans', sans-serif";
    ctx.letterSpacing = "0.12em";
    ctx.fillText(row[0]!, 80 + i * 220, 980);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = PAPER;
    ctx.font = "600 48px Fraunces, Georgia, serif";
    ctx.fillText(row[1]!, 80 + i * 220, 1040);
  });

  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Instrument Sans', sans-serif";
  ctx.fillText("Overlay template. Not a broadcast.", 80, 1260);

  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  gap: number,
) {
  const words = text.split(" ");
  let line = "";
  let row = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      ctx.fillText(line, x, row);
      line = word;
      row += gap;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, row);
}

function dataUrlToBlob(data: string) {
  const comma = data.indexOf(",");
  const body = comma >= 0 ? data.slice(comma + 1) : data;
  const mime = data.match(/data:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function blobOf(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    const fallback = (err?: unknown) => {
      try {
        resolve(dataUrlToBlob(canvas.toDataURL("image/png")));
      } catch (next) {
        reject(next ?? err ?? new Error("Couldn’t encode the card"));
      }
    };
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else fallback();
      }, "image/png");
    } catch (err) {
      fallback(err);
    }
  });
}

async function withSheet(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): Promise<Blob> {
  const sheet = acquireSheet(w, h);
  try {
    draw(sheet.ctx);
    return await blobOf(sheet.canvas);
  } finally {
    releaseSheet(sheet);
  }
}

export function downloadBlob(blob: Blob, name: string) {
  presentFile(blob, name);
}

export async function shareFile(blob: Blob, name: string, text: string, href?: string) {
  const result = await nativeShare(blob, name, text);
  if (result === "shared") return "shared" as const;
  if (result === "abort") return "abort" as const;
  presentFile(blob, name, text, href);
  return "saved" as const;
}

export function cardFileName(team: string, wins: number) {
  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `first-bucket-${slug}-${wins}.png`;
}

export function canCopyPng() {
  return typeof ClipboardItem === "function" && typeof navigator.clipboard?.write === "function";
}

export async function copyPng(blob: Blob) {
  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
}

export async function renderBriefCard(opts: {
  kicker: string;
  title: string;
  week: string;
  id: string;
  houseLine: string;
  houseNames: string[];
  houseIds?: string[];
  love: Array<{ name: string }>;
}): Promise<Blob> {
  await waitFonts();
  const w = 1080;
  const h = 1350;
  return withSheet(w, h, (ctx) => {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  drawPrinterMarks(ctx, w, h);
  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  THE BRIEF", 80, 110);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "rgba(250, 246, 238, 0.55)";
  ctx.font = "500 24px 'Instrument Sans', sans-serif";
  ctx.fillText(opts.kicker, 80, 170);
  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, 64, { opsz: 96 });
  wrapText(ctx, opts.title, 80, 270, 920, 72);
  ctx.fillStyle = "rgba(250, 246, 238, 0.7)";
  ctx.font = "500 28px 'Instrument Sans', sans-serif";
  wrapText(ctx, opts.houseLine, 80, 520, 920, 40);
  const plate = 88;
  opts.houseNames.slice(0, 5).forEach((name, i) => {
    drawPlate(ctx, null, name, 80 + i * (plate + 16), 620, plate);
  });
  ctx.fillStyle = PAPER;
  ctx.font = "500 22px 'Instrument Sans', sans-serif";
  ctx.fillText(opts.houseNames.join("  ·  "), 80, 760);
  ctx.fillStyle = ACCENT;
  ctx.font = "600 18px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("LOVE", 80, 860);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = PAPER;
  ctx.font = "600 36px Fraunces, Georgia, serif";
  opts.love.slice(0, 3).forEach((row, i) => {
    ctx.fillText(row.name, 80, 930 + i * 56);
  });
  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Instrument Sans', sans-serif";
  ctx.fillText(`First Bucket · Issue ${opts.id} · ${opts.week}`, 80, 1260);
  });
}

export async function renderTradeCard(opts: {
  grade: string;
  note: string;
  you: string[];
  them: string[];
}): Promise<Blob> {
  await waitFonts();
  const w = 1080;
  const h = 1350;
  return withSheet(w, h, (ctx) => {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  drawPrinterMarks(ctx, w, h);
  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  TRADE DESK", 80, 120);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, 120, { opsz: 144 });
  ctx.fillText(opts.grade, 80, 320);
  ctx.fillStyle = "rgba(250, 246, 238, 0.7)";
  ctx.font = "500 32px 'Instrument Sans', sans-serif";
  wrapText(ctx, opts.note, 80, 420, 920, 44);
  ctx.fillStyle = ACCENT;
  ctx.font = "600 18px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.12em";
  ctx.fillText("YOU SEND", 80, 680);
  ctx.fillText("YOU GET", 80, 920);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = PAPER;
  ctx.font = "600 36px Fraunces, Georgia, serif";
  ctx.fillText(opts.you.join("  ·  ") || "—", 80, 750);
  ctx.fillText(opts.them.join("  ·  ") || "—", 80, 990);
  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Instrument Sans', sans-serif";
  ctx.fillText("Editorial grade. Not a book. First Bucket Studio.", 80, 1260);
  });
}

export async function renderKeepCard(opts: {
  week: string;
  names: string[];
  ids: string[];
  marks: string[];
}): Promise<Blob> {
  void opts.marks;
  await waitFonts();
  const w = 1080;
  const h = 1350;
  return withSheet(w, h, (ctx) => {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  drawPrinterMarks(ctx, w, h);
  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Instrument Sans', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  KEEPER DESK", 80, 110);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "rgba(250, 246, 238, 0.55)";
  ctx.font = "500 24px 'Instrument Sans', sans-serif";
  ctx.fillText(opts.week, 80, 170);
  ctx.fillStyle = PAPER;
  fraunces(ctx, 600, 64, { opsz: 96 });
  wrapText(ctx, "This week’s five.", 80, 270, 920, 72);
  const plate = 120;
  opts.names.slice(0, 5).forEach((name, i) => {
    drawPlate(ctx, null, name, 80 + i * (plate + 16), 520, plate);
  });
  ctx.fillStyle = PAPER;
  ctx.font = "600 32px Fraunces, Georgia, serif";
  opts.names.slice(0, 5).forEach((name, i) => {
    ctx.fillText(name, 80, 720 + i * 70);
  });
  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 18px 'Instrument Sans', sans-serif";
  opts.ids.slice(0, 5).forEach((id, i) => {
    ctx.fillText(cardSerial(id), 520, 720 + i * 70);
  });
  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Instrument Sans', sans-serif";
  ctx.fillText("Keep. Not a league. First Bucket Studio.", 80, 1260);
  });
}

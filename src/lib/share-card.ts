import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel, type Player } from "./nba.ts";
import { drawCrestOps } from "./crest-marks.ts";
import { encodeWalk } from "./walk.ts";

const INK = "#16140f";
const PAPER = "#faf6ee";
const ACCENT = "#8a6a3b";
const GOOD = "#1f6b45";
const WARN = "#8a5a22";

export type CardKind = "season" | "goat" | "playoff" | "mark";

function record(kind: CardKind, wins: number) {
  if (kind === "goat") return goatLabel(wins);
  if (kind === "playoff") return `${playoffLine(wins)} · ${playoffLabel(wins)}`;
  return `${recordLine(wins)} · ${winLabel(wins)}`;
}

export function cardCaption(opts: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
  luck?: string;
  walk?: string;
}) {
  const { team, era, wins, roster, kind = "season", walk } = opts;
  const names = roster.map((p) => p.name).join(", ");
  const path = walk ? ` /walk/${walk}` : "";
  if (kind === "goat") return `GOAT Five ${wins} · ${goatLabel(wins)} at First Bucket Studio: ${names}.`;
  if (kind === "playoff") {
    return `Walked a ${playoffLine(wins)} ${era} ${team} playoff run at First Bucket Studio: ${names}.`;
  }
  return `Walked a ${recordLine(wins)} ${era} ${team} at First Bucket Studio: ${names}.${path}`;
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  nights: { win: boolean }[],
  x: number,
  y: number,
  width: number,
) {
  if (nights.length === 0) return;
  const cols = 10;
  const gap = 8;
  const size = (width - gap * (cols - 1)) / cols;
  nights.forEach((night, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.beginPath();
    ctx.fillStyle = night.win ? PAPER : "rgba(250, 246, 238, 0.22)";
    ctx.arc(x + col * (size + gap) + size / 2, y + row * (size + gap) + size / 2, size / 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

export async function renderShareCard(opts: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
  luck?: string;
  nights?: { win: boolean }[];
}): Promise<Blob> {
  const { team, era, wins, roster, kind = "season", luck, nights } = opts;
  await document.fonts.ready;
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);

  if (kind !== "goat") drawCrestOps(ctx, team, 80, 80, 72, ACCENT);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Source Sans 3', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET", kind === "goat" ? 80 : 176, 108);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "rgba(250, 246, 238, 0.7)";
  ctx.font = "500 28px 'Source Sans 3', sans-serif";
  ctx.fillText(luck ? `${team}  ·  ${era}  ·  ${luck}` : `${team}  ·  ${era}`, kind === "goat" ? 80 : 176, 160);

  ctx.fillStyle = PAPER;
  ctx.font = "600 200px Fraunces, Georgia, serif";
  ctx.fillText(String(wins), 80, 420);

  ctx.font = "500 36px 'Source Sans 3', sans-serif";
  ctx.fillText(record(kind, wins), 80, 500);

  ctx.font = "500 32px 'Source Sans 3', sans-serif";
  roster.forEach((p, i) => {
    ctx.fillStyle = PAPER;
    ctx.fillText(p.name, 80, 600 + i * 48);
    ctx.fillStyle = "rgba(250, 246, 238, 0.45)";
    ctx.fillText(p.pos, 720, 600 + i * 48);
  });

  if (nights && nights.length > 0) {
    drawDots(ctx, nights, 80, 880, 920);
  }

  const walk =
    kind !== "goat" && kind !== "playoff" && luck
      ? encodeWalk({ team, era, luck, wins, ids: roster.map((p) => p.id) })
      : "";
  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 20px 'Source Sans 3', sans-serif";
  ctx.fillText("First Bucket Studio", 80, 1260);
  if (walk) ctx.fillText(`/walk/${walk}`, 80, 1298);

  return blobOf(canvas);
}

export async function renderMarkCard(opts: {
  name: string;
  mark: string;
  note: string;
  date: string;
}): Promise<Blob> {
  await document.fonts.ready;
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Source Sans 3', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  THE TAPE", 80, 120);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = PAPER;
  ctx.font = "600 72px Fraunces, Georgia, serif";
  wrapText(ctx, opts.name, 80, 280, 920, 84);

  ctx.fillStyle = opts.mark === "UP" ? GOOD : opts.mark === "DOWN" ? WARN : PAPER;
  ctx.font = "600 160px Fraunces, Georgia, serif";
  ctx.fillText(opts.mark, 80, 620);

  ctx.fillStyle = "rgba(250, 246, 238, 0.78)";
  ctx.font = "500 36px 'Source Sans 3', sans-serif";
  wrapText(ctx, opts.note, 80, 760, 920, 48);

  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Source Sans 3', sans-serif";
  ctx.fillText(opts.date, 80, 1200);
  ctx.fillText("Marks. Not a book. First Bucket Studio.", 80, 1260);

  return blobOf(canvas);
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
}): Promise<Blob> {
  await document.fonts.ready;
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 22px 'Source Sans 3', sans-serif";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("FIRST BUCKET  ·  THE GYM", 80, 110);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = PAPER;
  ctx.font = "600 64px Fraunces, Georgia, serif";
  ctx.fillText(opts.home, 80, 280);
  ctx.fillText(opts.homeScore, 720, 280);
  ctx.fillText(opts.away, 80, 380);
  ctx.fillText(opts.awayScore, 720, 380);

  ctx.fillStyle = "rgba(250, 246, 238, 0.55)";
  ctx.font = "500 32px 'Source Sans 3', sans-serif";
  ctx.fillText(`${opts.quarter}  ·  ${opts.clock}`, 80, 460);

  ctx.fillStyle = PAPER;
  ctx.font = "600 56px Fraunces, Georgia, serif";
  wrapText(ctx, opts.name || "Name", 80, 640, 920, 64);
  ctx.fillStyle = "rgba(250, 246, 238, 0.55)";
  ctx.font = "500 32px 'Source Sans 3', sans-serif";
  wrapText(ctx, opts.role || "Role", 80, 760, 920, 44);

  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Source Sans 3', sans-serif";
  ctx.fillText("Overlay template. Not a broadcast.", 80, 1260);

  return blobOf(canvas);
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

function blobOf(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Couldn’t encode the card"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function cardFileName(team: string, wins: number) {
  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `first-bucket-${slug}-${wins}.png`;
}

export async function shareFile(blob: Blob, name: string, text: string) {
  const file = new File([blob], name, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (typeof nav.share === "function") {
    const data: ShareData = { title: "First Bucket Studio", text };
    try {
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ ...data, files: [file] });
        return "shared" as const;
      }
      await nav.share(data);
      return "shared" as const;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "abort" as const;
    }
  }
  downloadBlob(blob, name);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* private mode */
  }
  return "saved" as const;
}

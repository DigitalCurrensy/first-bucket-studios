import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel, type Player } from "./nba.ts";

const INK = "#16140f";
const PAPER = "#faf6ee";
const ACCENT = "#8a6a3b";

export type CardKind = "season" | "goat" | "playoff";

function line(kind: CardKind, wins: number) {
  if (kind === "goat") return goatLabel(wins);
  if (kind === "playoff") return `${playoffLine(wins)} · ${playoffLabel(wins)}`;
  return `${recordLine(wins)} · ${winLabel(wins)}`;
}

export async function renderShareCard(opts: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
}): Promise<Blob> {
  const { team, era, wins, roster, kind = "season" } = opts;
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
  ctx.fillText("FIRST BUCKET", 80, 120);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "rgba(250, 246, 238, 0.7)";
  ctx.font = "500 28px 'Source Sans 3', sans-serif";
  ctx.fillText(`${team}  ·  ${era}`, 80, 180);

  ctx.fillStyle = PAPER;
  ctx.font = "600 200px Fraunces, Georgia, serif";
  ctx.fillText(String(wins), 80, 460);

  ctx.font = "500 36px 'Source Sans 3', sans-serif";
  ctx.fillText(line(kind, wins), 80, 540);

  ctx.font = "500 32px 'Source Sans 3', sans-serif";
  roster.forEach((p, i) => {
    ctx.fillStyle = PAPER;
    ctx.fillText(p.name, 80, 700 + i * 56);
    ctx.fillStyle = "rgba(250, 246, 238, 0.45)";
    ctx.fillText(p.pos, 720, 700 + i * 56);
  });

  ctx.fillStyle = "rgba(250, 246, 238, 0.4)";
  ctx.font = "500 22px 'Source Sans 3', sans-serif";
  ctx.fillText("First Bucket Studio", 80, 1260);

  return await new Promise((resolve, reject) => {
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

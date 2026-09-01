/** Pooled opaque 2D sheets for press cards. Pack foil is WebGPU / WebGL. */

export type Sheet = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

const pool: HTMLCanvasElement[] = [];
const MAX_POOL = 2;

const CTX_OPTS: CanvasRenderingContext2DSettings = {
  alpha: false,
  desynchronized: true,
  willReadFrequently: false,
};

export function acquireSheet(w: number, h: number): Sheet {
  const canvas = pool.pop() ?? document.createElement("canvas");
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d", CTX_OPTS);
  if (!ctx) throw new Error("No canvas");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "0px";
  const variable = ctx as CanvasRenderingContext2D & { fontVariationSettings?: string };
  if (typeof variable.fontVariationSettings === "string") variable.fontVariationSettings = "normal";
  ctx.fillStyle = "#16140f";
  ctx.fillRect(0, 0, w, h);
  return { canvas, ctx };
}

export function releaseSheet(sheet: Sheet) {
  if (pool.length >= MAX_POOL) {
    sheet.canvas.width = 1;
    sheet.canvas.height = 1;
    return;
  }
  pool.push(sheet.canvas);
}

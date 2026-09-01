/** House crests as 40×40 stroke paths. SVG and canvas share this file. Not league marks. */

export type CrestOp =
  | { t: "rect"; x: number; y: number; w: number; h: number; rx?: number }
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "path"; d: string };

export const CREST_MARKS: Record<string, CrestOp[]> = {
  Lakers: [
    { t: "rect", x: 6, y: 6, w: 28, h: 28, rx: 2 },
    { t: "path", d: "M14 28 V12 H20 L26 28" },
  ],
  Celtics: [
    { t: "circle", cx: 20, cy: 20, r: 14 },
    { t: "path", d: "M13 24 Q20 10 27 24" },
  ],
  Spurs: [{ t: "path", d: "M20 5 L24 16 L36 16 L26 23 L30 34 L20 27 L10 34 L14 23 L4 16 L16 16 Z" }],
  Bulls: [
    { t: "rect", x: 7, y: 8, w: 26, h: 24, rx: 3 },
    { t: "path", d: "M14 26 V14 H20 Q26 14 26 20 Q26 26 20 26 Z" },
  ],
  Warriors: [
    { t: "path", d: "M8 28 L14 12 L20 22 L26 12 L32 28" },
    { t: "path", d: "M10 28 H30" },
  ],
  Heat: [{ t: "path", d: "M20 8 Q12 18 14 26 Q20 32 26 26 Q28 18 20 8 Z" }],
  Pistons: [
    { t: "rect", x: 10, y: 8, w: 20, h: 24, rx: 2 },
    { t: "path", d: "M10 16 H30 M10 24 H30" },
  ],
  Knicks: [{ t: "path", d: "M8 28 V12 L20 22 L32 12 V28" }],
  Suns: [
    { t: "circle", cx: 20, cy: 20, r: 7 },
    { t: "path", d: "M20 6 V11 M20 29 V34 M6 20 H11 M29 20 H34 M9 9 L13 13 M27 27 L31 31 M31 9 L27 13 M13 27 L9 31" },
  ],
  Nuggets: [
    { t: "path", d: "M8 28 L20 8 L32 28 Z" },
    { t: "path", d: "M14 28 L20 16 L26 28" },
  ],
  Thunder: [
    { t: "path", d: "M8 14 H32" },
    { t: "path", d: "M10 20 H30" },
    { t: "path", d: "M12 26 H28" },
  ],
  Bucks: [{ t: "path", d: "M8 28 L20 8 L32 28 M14 28 L20 18 L26 28" }],
  Mavericks: [{ t: "path", d: "M8 28 V12 L20 24 L32 12 V28" }],
  "76ers": [
    { t: "circle", cx: 20, cy: 20, r: 13 },
    { t: "path", d: "M14 16 H22 M18 16 V26" },
  ],
  Cavaliers: [
    { t: "path", d: "M20 8 V32" },
    { t: "path", d: "M12 14 H28" },
    { t: "path", d: "M14 32 H26" },
  ],
  Timberwolves: [{ t: "path", d: "M20 6 L34 20 L20 34 L6 20 Z" }],
  Rockets: [{ t: "path", d: "M20 6 L32 30 H8 Z" }],
  Clippers: [
    { t: "rect", x: 9, y: 8, w: 8, h: 24, rx: 1 },
    { t: "rect", x: 23, y: 8, w: 8, h: 24, rx: 1 },
  ],
  Hawks: [{ t: "path", d: "M8 26 L20 10 L32 26 M12 26 H28" }],
  Pacers: [
    { t: "rect", x: 8, y: 8, w: 24, h: 24, rx: 2 },
    { t: "path", d: "M16 16 H24 M16 20 H24 M16 24 H24" },
  ],
  Kings: [{ t: "path", d: "M8 26 L8 16 L14 22 L20 10 L26 22 L32 16 L32 26 Z" }],
  Magic: [
    { t: "path", d: "M20 8 L22 18 L32 20 L22 22 L20 32 L18 22 L8 20 L18 18 Z" },
  ],
  Nets: [
    { t: "rect", x: 8, y: 8, w: 24, h: 24 },
    { t: "path", d: "M8 16 H32 M8 24 H32 M16 8 V32 M24 8 V32" },
  ],
  Pelicans: [
    { t: "circle", cx: 20, cy: 18, r: 8 },
    { t: "path", d: "M10 28 Q20 22 30 28" },
  ],
  Raptors: [{ t: "path", d: "M10 12 L16 28 M20 8 L20 32 M30 12 L24 28" }],
  Grizzlies: [
    { t: "rect", x: 8, y: 12, w: 24, h: 18, rx: 4 },
    { t: "path", d: "M12 12 V8 M28 12 V8" },
  ],
  Jazz: [
    { t: "circle", cx: 14, cy: 24, r: 5 },
    { t: "circle", cx: 26, cy: 20, r: 5 },
    { t: "path", d: "M19 24 V12 H31 V20" },
  ],
  "Trail Blazers": [{ t: "path", d: "M6 28 L18 8 H34 L22 28 Z" }],
  Hornets: [{ t: "path", d: "M20 6 L32 14 V26 L20 34 L8 26 V14 Z" }],
  Wizards: [{ t: "path", d: "M8 12 L14 28 L20 16 L26 28 L32 12" }],
  Aces: [
    { t: "path", d: "M20 6 L24 16 L34 16 L26 22 L29 32 L20 26 L11 32 L14 22 L6 16 L16 16 Z" },
    { t: "circle", cx: 20, cy: 20, r: 4 },
  ],
  LVA: [
    { t: "path", d: "M20 6 L24 16 L34 16 L26 22 L29 32 L20 26 L11 32 L14 22 L6 16 L16 16 Z" },
    { t: "circle", cx: 20, cy: 20, r: 4 },
  ],
  Liberty: [
    { t: "rect", x: 10, y: 8, w: 20, h: 24, rx: 2 },
    { t: "path", d: "M20 12 V28 M14 18 H26" },
  ],
  NYL: [
    { t: "rect", x: 10, y: 8, w: 20, h: 24, rx: 2 },
    { t: "path", d: "M20 12 V28 M14 18 H26" },
  ],
  Lynx: [
    { t: "path", d: "M8 28 L20 8 L32 28" },
    { t: "path", d: "M14 28 L20 16 L26 28" },
  ],
  MIN: [
    { t: "path", d: "M8 28 L20 8 L32 28" },
    { t: "path", d: "M14 28 L20 16 L26 28" },
  ],
  Fever: [{ t: "path", d: "M12 28 L20 8 L28 28 M16 22 H24" }],
  IND: [{ t: "path", d: "M12 28 L20 8 L28 28 M16 22 H24" }],
  Sun: [
    { t: "circle", cx: 20, cy: 20, r: 8 },
    { t: "path", d: "M20 6 V10 M20 30 V34 M6 20 H10 M30 20 H34 M10 10 L13 13 M27 27 L30 30 M30 10 L27 13 M13 27 L10 30" },
  ],
  CON: [
    { t: "circle", cx: 20, cy: 20, r: 8 },
    { t: "path", d: "M20 6 V10 M20 30 V34 M6 20 H10 M30 20 H34 M10 10 L13 13 M27 27 L30 30 M30 10 L27 13 M13 27 L10 30" },
  ],
  Storm: [
    { t: "path", d: "M8 16 H28 L22 22 H32 L14 32" },
    { t: "path", d: "M12 12 H24" },
  ],
  SEA: [
    { t: "path", d: "M8 16 H28 L22 22 H32 L14 32" },
    { t: "path", d: "M12 12 H24" },
  ],
  Mercury: [
    { t: "circle", cx: 20, cy: 16, r: 7 },
    { t: "path", d: "M20 23 V32 M16 28 H24" },
  ],
  PHX: [
    { t: "circle", cx: 20, cy: 16, r: 7 },
    { t: "path", d: "M20 23 V32 M16 28 H24" },
  ],
  Wings: [{ t: "path", d: "M6 22 L20 10 L34 22 M10 22 L20 32 L30 22" }],
  DAL: [{ t: "path", d: "M6 22 L20 10 L34 22 M10 22 L20 32 L30 22" }],
  Sky: [
    { t: "path", d: "M8 26 Q20 8 32 26" },
    { t: "path", d: "M12 26 H28" },
  ],
  CHI: [
    { t: "path", d: "M8 26 Q20 8 32 26" },
    { t: "path", d: "M12 26 H28" },
  ],
  Mystics: [{ t: "path", d: "M20 6 L24 16 L34 18 L24 22 L20 34 L16 22 L6 18 L16 16 Z" }],
  WAS: [{ t: "path", d: "M20 6 L24 16 L34 18 L24 22 L20 34 L16 22 L6 18 L16 16 Z" }],
  Dream: [{ t: "path", d: "M8 28 V14 L20 24 L32 14 V28" }],
  ATL: [{ t: "path", d: "M8 28 V14 L20 24 L32 14 V28" }],
  Sparks: [
    { t: "path", d: "M20 6 L22 16 L32 14 L24 20 L30 30 L20 24 L10 30 L16 20 L8 14 L18 16 Z" },
  ],
  LAS: [
    { t: "path", d: "M20 6 L22 16 L32 14 L24 20 L30 30 L20 24 L10 30 L16 20 L8 14 L18 16 Z" },
  ],
  Valkyries: [
    { t: "path", d: "M8 28 L12 12 L20 20 L28 12 L32 28" },
    { t: "path", d: "M12 28 H28" },
  ],
  GSV: [
    { t: "path", d: "M8 28 L12 12 L20 20 L28 12 L32 28" },
    { t: "path", d: "M12 28 H28" },
  ],
};

export const DEFAULT_CREST: CrestOp[] = [{ t: "rect", x: 6, y: 6, w: 28, h: 28, rx: 4 }];

export function marksFor(name: string): CrestOp[] {
  return CREST_MARKS[name] ?? DEFAULT_CREST;
}

export function drawCrestOps(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const ops = marksFor(name);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 40, size / 40);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fillStyle = "none";
  for (const op of ops) {
    ctx.beginPath();
    if (op.t === "rect") {
      if (op.rx) {
        const r = op.rx;
        ctx.moveTo(op.x + r, op.y);
        ctx.lineTo(op.x + op.w - r, op.y);
        ctx.quadraticCurveTo(op.x + op.w, op.y, op.x + op.w, op.y + r);
        ctx.lineTo(op.x + op.w, op.y + op.h - r);
        ctx.quadraticCurveTo(op.x + op.w, op.y + op.h, op.x + op.w - r, op.y + op.h);
        ctx.lineTo(op.x + r, op.y + op.h);
        ctx.quadraticCurveTo(op.x, op.y + op.h, op.x, op.y + op.h - r);
        ctx.lineTo(op.x, op.y + r);
        ctx.quadraticCurveTo(op.x, op.y, op.x + r, op.y);
      } else {
        ctx.rect(op.x, op.y, op.w, op.h);
      }
      ctx.stroke();
    } else if (op.t === "circle") {
      ctx.arc(op.cx, op.cy, op.r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.stroke(new Path2D(op.d));
    }
  }
  ctx.restore();
}

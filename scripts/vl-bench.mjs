#!/usr/bin/env node
/**
 * Visual-loop bench. Stills + tape, not VLMEvalKit.
 * Night stock must stay dark. Cream paper fails.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const STILLS = [
  ["docs/stills/01-home.jpg", 40_000],
  ["docs/stills/02-foil.jpg", 40_000],
  ["docs/stills/03-result.jpg", 40_000],
  ["docs/stills/04-tray.jpg", 20_000],
];
const TAPE = ["docs/tape/demo.mp4", 80_000];
const NIGHT_Y = 80;

function fail(msg) {
  console.error(JSON.stringify({ ok: false, error: msg }));
  process.exit(1);
}

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function meanY(file) {
  const buf = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-vf", "scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"],
    { maxBuffer: 16 },
  );
  if (buf.length < 3) throw new Error(`no pixels from ${file}`);
  return 0.2126 * buf[0] + 0.7152 * buf[1] + 0.0722 * buf[2];
}

const jpeg = (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
const ftyp = (buf) => buf.subarray(4, 8).toString("ascii") === "ftyp";

const rows = [];
for (const [rel, min] of STILLS) {
  const file = path.join(ROOT, rel);
  if (!existsSync(file)) fail(`missing ${rel}`);
  const size = statSync(file).size;
  if (size < min) fail(`${rel} too small (${size} < ${min})`);
  const head = readFileSync(file).subarray(0, 16);
  if (!jpeg(head)) fail(`${rel} is not a JPEG`);
  const row = { file: rel, size, jpeg: true };
  if (hasFfmpeg()) {
    row.y = Number(meanY(file).toFixed(1));
    if (row.y >= NIGHT_Y) fail(`${rel} is not night stock (Y ${row.y} ≥ ${NIGHT_Y}). Cream paper fails.`);
  }
  rows.push(row);
}

const tapeRel = TAPE[0];
const tapeFile = path.join(ROOT, tapeRel);
if (!existsSync(tapeFile)) fail(`missing ${tapeRel}`);
const tapeSize = statSync(tapeFile).size;
if (tapeSize < TAPE[1]) fail(`${tapeRel} too small (${tapeSize})`);
if (!ftyp(readFileSync(tapeFile).subarray(0, 12))) fail(`${tapeRel} is not mp4`);
rows.push({ file: tapeRel, size: tapeSize, mp4: true });

console.log(
  JSON.stringify(
    {
      ok: true,
      bench: "visual-loop",
      nightY: NIGHT_Y,
      ffmpeg: hasFfmpeg(),
      files: rows,
    },
    null,
    2,
  ),
);

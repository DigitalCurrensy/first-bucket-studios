import { chromium } from "playwright";
import { mkdirSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = "/workspace";
const STILLS = path.join(ROOT, "docs/stills");
const TAPE = path.join(ROOT, "docs/tape");
const TMP = "/tmp/fbs-tape";
mkdirSync(STILLS, { recursive: true });
mkdirSync(TAPE, { recursive: true });
mkdirSync(TMP, { recursive: true });

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
  recordVideo: { dir: TMP, size: { width: 1440, height: 900 } },
});
await context.route("https://grok.com/**", (route) => route.abort());
const page = await context.newPage();
page.setDefaultTimeout(25000);

async function shot(name) {
  await page.waitForTimeout(220);
  await page.screenshot({
    path: path.join(STILLS, name),
    type: "jpeg",
    quality: 86,
  });
  console.log("still", name, page.url());
}

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("text=Rip the pack. Send the card.");
await page.waitForSelector(".rip-pack");
await page.waitForTimeout(400);
await shot("01-home.jpg");

await page.goto("http://127.0.0.1:8080/games/82-0", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".rip-pack");
await page.waitForFunction(() => {
  const el = document.querySelector(".rip-pack");
  return Boolean(el && el.getAttribute("aria-label") && !/house prospect/i.test(el.getAttribute("aria-label") || ""));
});
await page.waitForTimeout(500);

await page.locator(".rip-pack").click();
await page.waitForSelector(".pack-grid button");
await page.waitForSelector(".plate-name");
await page.waitForTimeout(700);
await shot("02-foil.jpg");

const cards = page.locator(".pack-grid button");
const n = await cards.count();
console.log("cards", n);
for (let i = 0; i < Math.min(5, n); i++) {
  await cards.nth(i).click();
  await page.waitForTimeout(70);
}

await page.getByRole("button", { name: "Lock five" }).click();
const skip = page.getByRole("button", { name: /Skip to the card|The card/ });
if (await skip.first().isVisible().catch(() => false)) await skip.first().click();
await page.waitForSelector("text=Save the card");
await page.waitForSelector("text=Share");
await page.waitForTimeout(400);
await shot("03-result.jpg");

await page.getByRole("button", { name: "Share" }).click();
await page.waitForSelector("text=TikTok");
await page.waitForTimeout(400);
await shot("04-tray.jpg");

const walk = await page.locator("input[readonly]").inputValue().catch(() => "");
console.log("walk", walk);

await context.close();
await browser.close();

const videos = readdirSync(TMP).filter((f) => f.endsWith(".webm"));
if (!videos.length) throw new Error("no video");
const src = path.join(TMP, videos[0]);
const dest = path.join(TAPE, "demo.mp4");
execSync(
  `ffmpeg -y -i ${JSON.stringify(src)} -an -c:v libx264 -pix_fmt yuv420p -crf 26 -preset veryfast -movflags +faststart -vf "fps=24,scale=1280:-2" ${JSON.stringify(dest)}`,
  { stdio: "inherit" },
);
console.log("tape", dest);

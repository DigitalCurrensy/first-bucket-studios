#!/usr/bin/env node
/**
 * Demo eval. Studio must already be running.
 * Emits Stream-JSON (NDJSON) on stdout. See docs/STREAM-JSON.md.
 */
import { chromium } from "playwright";

const BASE = process.env.FBS_BASE ?? "http://127.0.0.1:8080";
const HOUSE = "v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga";
const BUDGET_MS = 120_000;

function emit(msg) {
  process.stdout.write(`${JSON.stringify(msg)}\n`);
}

async function ping() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

if (!(await ping())) {
  emit({
    type: "result",
    ok: false,
    ms: 0,
    error: `Studio is not up at ${BASE}. Start it, then npm run test:demo.`,
  });
  process.exit(1);
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
page.setDefaultTimeout(25_000);
const started = Date.now();
const seen = new Set();

async function flushBeats() {
  const demo = await page.evaluate(() => window.__fbsDemo ?? null);
  for (const event of demo?.log?.events ?? []) {
    if (seen.has(event.beat)) continue;
    seen.add(event.beat);
    emit({ type: "beat", beat: event.beat, ms: event.ms, note: event.note });
  }
  return demo;
}

emit({ type: "system", subtype: "init", version: 1, studio: "first-bucket", at: Date.now() });

try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    try {
      localStorage.removeItem("fbs.demo");
    } catch {
      /* ignore */
    }
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__fbsDemo?.funnel?.order?.includes("home"));
  await flushBeats();
  await page.locator("main").getByRole("link", { name: "Rip the pack" }).click();
  await page.waitForURL(/\/games\/82-0/);
  await flushBeats();
  await context.route("https://grok.com/**", (route) => route.abort());
  const pack = page.locator(".rip-pack");
  await pack.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const el = document.querySelector(".rip-pack");
    const label = el?.getAttribute("aria-label") || "";
    return Boolean(label) && !/house prospect/i.test(label);
  });
  await pack.click();
  const cards = page.locator(".pack-grid button");
  await cards.first().waitFor({ state: "visible" });
  await flushBeats();
  const n = await cards.count();
  if (n < 5) throw new Error(`pack dealt ${n} cards`);
  const all = page.getByRole("button", { name: "Turn them all" });
  if (await all.isEnabled().catch(() => false)) await all.click();
  for (let i = 0; i < 5; i += 1) {
    const card = cards.nth(i);
    if ((await card.getAttribute("aria-pressed")) !== "true") await card.click();
  }
  await page.getByRole("button", { name: "Lock five" }).click();
  await page.getByRole("link", { name: "Save the card" }).waitFor();
  await page.getByRole("link", { name: "Post to X" }).waitFor();
  await flushBeats();
  const walk = (await page.locator("text=/\\/walk\\/v1\\./").first().textContent()) ?? "";
  const id = walk.replace(/^[\s\S]*\/walk\//, "").trim();
  if (!id.startsWith("v1.")) throw new Error(`no walk on the card: ${walk}`);
  if (id === HOUSE) throw new Error("live pack collapsed to the house pin");
  emit({ type: "walk", id, live: true });
  const save = page.getByRole("link", { name: "Save the card" }).first();
  const href = await save.getAttribute("href");
  if (!href?.startsWith("data:image/png")) throw new Error(`save is not a png data url: ${href?.slice(0, 40)}`);
  if (!(await save.getAttribute("download"))?.endsWith(".png")) throw new Error("save has no png download name");
  const post = page.getByRole("link", { name: "Post to X" });
  const tweet = await post.getAttribute("href");
  if (!tweet?.includes("x.com/intent/tweet")) throw new Error(`post to x is not an intent: ${tweet}`);
  await page.getByRole("button", { name: "More ways to send" }).click();
  await page.getByRole("link", { name: "Save the card" }).nth(1).waitFor();
  await page.getByRole("button", { name: "Copy the walk" }).click();
  await page.waitForTimeout(250);
  const demo = await flushBeats();
  const funnel = demo?.funnel;
  const ms = Date.now() - started;
  if (ms > BUDGET_MS) throw new Error(`loop ${ms}ms over ${BUDGET_MS}ms budget`);
  if (!funnel?.order?.includes("home")) throw new Error("funnel missed home");
  if (!funnel.order.includes("rip")) throw new Error("funnel missed rip");
  if (!funnel.order.includes("card")) throw new Error("funnel missed card");
  if (!funnel.order.includes("tray")) throw new Error("funnel missed tray");
  if (!funnel.sent) throw new Error("funnel did not send");
  emit({ type: "result", ok: true, ms, walk: `/walk/${id}`, funnel });
} catch (err) {
  const ms = Date.now() - started;
  emit({
    type: "result",
    ok: false,
    ms,
    error: err instanceof Error ? err.message : String(err),
  });
  process.exitCode = 1;
} finally {
  await browser.close();
}

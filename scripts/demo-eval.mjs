#!/usr/bin/env node
/**
 * Demo eval. Studio must already be running.
 * Live pack ≠ house pin. Tray opens. Funnel reaches card.
 */
import { chromium } from "playwright";

const BASE = process.env.FBS_BASE ?? "http://127.0.0.1:8080";
const HOUSE = "v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga";
const BUDGET_MS = 120_000;

async function ping() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

if (!(await ping())) {
  console.error(`Studio is not up at ${BASE}. Start it, then npm run test:demo.`);
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
const fail = (msg) => {
  console.error(JSON.stringify({ ok: false, error: msg, ms: Date.now() - started }, null, 2));
  process.exitCode = 1;
};

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
  await page.locator("main").getByRole("link", { name: "Rip the pack" }).click();
  await page.waitForURL(/\/games\/82-0/);
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
  const n = await cards.count();
  if (n < 5) throw new Error(`pack dealt ${n} cards`);
  const all = page.getByRole("button", { name: "Turn them all" });
  if (await all.isEnabled().catch(() => false)) await all.click();
  for (let i = 0; i < 5; i += 1) {
    const card = cards.nth(i);
    if ((await card.getAttribute("aria-pressed")) !== "true") await card.click();
  }
  await page.getByRole("button", { name: "Lock five" }).click();
  await page.getByRole("button", { name: "Send the card" }).waitFor();
  const walk = (await page.locator("text=/\\/walk\\/v1\\./").first().textContent()) ?? "";
  const id = walk.replace(/^[\s\S]*\/walk\//, "").trim();
  if (!id.startsWith("v1.")) throw new Error(`no walk on the card: ${walk}`);
  if (id === HOUSE) throw new Error("live pack collapsed to the house pin");
  await page.getByRole("button", { name: "Send the card" }).click();
  await page.getByRole("link", { name: "Save the card" }).waitFor();
  await page.getByRole("button", { name: "Copy the walk" }).click();
  await page.waitForTimeout(250);
  const demo = await page.evaluate(() => window.__fbsDemo ?? null);
  const funnel = demo?.funnel;
  const ms = Date.now() - started;
  if (ms > BUDGET_MS) throw new Error(`loop ${ms}ms over ${BUDGET_MS}ms budget`);
  if (!funnel?.order?.includes("home")) throw new Error(`funnel missed home: ${JSON.stringify(funnel)}`);
  if (!funnel.order.includes("rip")) throw new Error(`funnel missed rip: ${JSON.stringify(funnel)}`);
  if (!funnel.order.includes("card")) throw new Error(`funnel missed card: ${JSON.stringify(funnel)}`);
  if (!funnel.order.includes("tray")) throw new Error(`funnel missed tray: ${JSON.stringify(funnel)}`);
  if (!funnel.sent) throw new Error(`funnel did not send: ${JSON.stringify(funnel)}`);
  console.log(
    JSON.stringify(
      {
        ok: true,
        walk: `/walk/${id}`,
        ms,
        funnel,
      },
      null,
      2,
    ),
  );
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
} finally {
  await browser.close();
}

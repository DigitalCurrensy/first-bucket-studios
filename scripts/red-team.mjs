/** Red team: 10 live packs, no house pin, real save + share. */
import { chromium } from "playwright";

const BASE = process.env.APP_URL || "http://127.0.0.1:8080";
const HOUSE = "v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga";

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(40000);

const teams = [];
const walks = [];

try {
  await page.goto(BASE + "/about", { waitUntil: "networkidle" });
  const body = await page.locator("main").innerText();
  if (/Thunder foil\. Same pack every time/i.test(body)) throw new Error("about still teaches the house pack");
  if (/certifcate/i.test(body)) throw new Error("typo: certifcate");
  const pinned = await page.getByText("Pinned walk").count();
  if (pinned) throw new Error("Thunder house widget is still on the rail");

  await page.goto(BASE + "/games/82-0", { waitUntil: "networkidle" });

  for (let i = 0; i < 10; i += 1) {
    if (i > 0) {
      const again = page.getByRole("button", { name: /Rip again|Pull again/ });
      if (await again.count()) await again.first().click();
      else await page.goto(BASE + "/games/82-0", { waitUntil: "networkidle" });
    }
    const pack = page.locator(".rip-pack");
    await pack.waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const el = document.querySelector(".rip-pack");
      const label = el?.getAttribute("aria-label") || "";
      return Boolean(label) && !/house prospect/i.test(label);
    });
    const label = (await pack.getAttribute("aria-label")) || "";
    const team = /Rip the (.+) prospect pack/.exec(label)?.[1] || "";
    if (!team) throw new Error(`pack ${i + 1} has no franchise`);
    teams.push(team);
    await pack.click();
    const cards = page.locator(".pack-grid button");
    await cards.first().waitFor({ state: "visible" });
    const n = await cards.count();
    if (n !== 10) throw new Error(`${team} dealt ${n} cards`);
    const stacked = await page.locator(".card-face.is-down").count();
    if (stacked > 0) throw new Error(`${team} stacked faces`);
    for (let c = 0; c < 5; c += 1) await cards.nth(c).click();
    await page.getByRole("button", { name: "Lock five" }).click();
    const skip = page.getByRole("button", { name: /Skip to the card|The card/ });
    if (await skip.first().isVisible().catch(() => false)) await skip.first().click();
    await page.getByRole("link", { name: "Save the card" }).waitFor();
    const href = await page.getByRole("link", { name: "Save the card" }).first().getAttribute("href");
    if (!href?.startsWith("data:image/png")) throw new Error(`${team} save is not a png`);
    await page.getByRole("button", { name: "Share" }).click();
    await page.getByRole("link", { name: "X" }).waitFor();
    await page.getByRole("button", { name: "TikTok" }).waitFor();
    await page.getByRole("button", { name: "Discord" }).waitFor();
    const tweet = await page.getByRole("link", { name: "X" }).getAttribute("href");
    if (!tweet?.includes("x.com/intent/tweet")) throw new Error(`${team} X is not an intent`);
    const walk = (await page.locator("text=/\\/walk\\/v1\\./").first().textContent()) ?? "";
    const id = walk.replace(/^[\s\S]*\/walk\//, "").trim();
    if (!id.startsWith("v1.")) throw new Error(`${team} has no walk`);
    if (id === HOUSE) throw new Error(`${team} collapsed to the house pin`);
    walks.push(id);
    await page.keyboard.press("Escape");
    console.log(JSON.stringify({ i: i + 1, team, walk: id }));
  }

  const unique = new Set(teams);
  if (unique.size < 4) throw new Error(`only ${unique.size} franchises in 10 pulls: ${[...unique].join(", ")}`);
  if (teams.every((t) => t === "Thunder")) throw new Error("all 10 packs were Thunder");
  if (new Set(walks).size !== walks.length) throw new Error("duplicate walks — mixer stuck");
  console.log(JSON.stringify({ ok: true, teams, unique: unique.size, walks: walks.length }));
} catch (err) {
  console.error("RED TEAM FAIL", err);
  await page.screenshot({ path: "/tmp/fbs-red-fail.png", fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}

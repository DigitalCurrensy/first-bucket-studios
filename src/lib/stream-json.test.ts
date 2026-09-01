import assert from "node:assert/strict";
import { test } from "node:test";
import { foldFunnel, type DemoLog } from "./demo-funnel.ts";
import {
  HOUSE_WALK_ID,
  decodeLine,
  decodeStream,
  encodeLine,
  streamFromLog,
} from "./stream-json.ts";

test("each stream line is one JSON object, no pretty indent", () => {
  const line = encodeLine({
    type: "system",
    subtype: "init",
    version: 1,
    studio: "first-bucket",
    at: 1,
  });
  assert.equal(line.includes("\n"), false);
  assert.equal(decodeLine(line)?.type, "system");
});

test("garbage and foreign studios fail closed", () => {
  assert.equal(decodeLine(""), null);
  assert.equal(decodeLine("{"), null);
  assert.equal(decodeLine(JSON.stringify({ type: "assistant", text: "hi" })), null);
  assert.equal(
    decodeLine(JSON.stringify({ type: "system", subtype: "init", studio: "claude", version: 1, at: 1 })),
    null,
  );
});

test("a live log streams init, first beats, a live walk, then result", () => {
  const log: DemoLog = {
    version: 1,
    started: 1000,
    events: [
      { beat: "home", at: 1000, ms: 0 },
      { beat: "rip", at: 1400, ms: 400 },
      { beat: "rip", at: 1500, ms: 500 },
      { beat: "card", at: 8000, ms: 7000, note: "v1.LAC.04-defense.even.17.coulibaly~daniels~hartenstein~risacher~zion" },
      { beat: "tray", at: 8300, ms: 7300 },
      { beat: "copy", at: 8600, ms: 7600 },
    ],
  };
  const stream = streamFromLog(log, { ms: 8200, ok: true });
  const text = stream.map(encodeLine).join("\n");
  const back = decodeStream(text);
  assert.equal(back[0]?.type, "system");
  assert.equal(back.filter((m) => m.type === "beat" && m.beat === "rip").length, 1);
  const walk = back.find((m) => m.type === "walk");
  assert.equal(walk && walk.type === "walk" && walk.live, true);
  assert.notEqual(walk && walk.type === "walk" ? walk.id : "", HOUSE_WALK_ID);
  const result = back.at(-1);
  assert.equal(result?.type, "result");
  if (result?.type === "result") {
    assert.equal(result.ok, true);
    assert.equal(result.funnel?.sent, true);
    assert.deepEqual(result.funnel, foldFunnel(log.events));
  }
});

test("house pin is flagged not-live", () => {
  const log: DemoLog = {
    version: 1,
    started: 1,
    events: [{ beat: "card", at: 1, ms: 0, note: HOUSE_WALK_ID }],
  };
  const walk = streamFromLog(log).find((m) => m.type === "walk");
  assert.equal(walk && walk.type === "walk" && walk.live, false);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_BEATS, emptyDemoLog, foldFunnel, type DemoEvent } from "./demo-funnel.ts";

function ev(beat: DemoEvent["beat"], at: number, note?: string): DemoEvent {
  return { beat, at, ms: at - 1000, note };
}

test("empty log folds to a full missing list", () => {
  const folded = foldFunnel(emptyDemoLog().events);
  assert.deepEqual(folded.order, []);
  assert.deepEqual(folded.missing, [...DEMO_BEATS]);
  assert.equal(folded.sent, false);
  assert.equal(folded.toCardMs, null);
});

test("first hit of each beat is the funnel, repeats do not move it", () => {
  const folded = foldFunnel([
    ev("home", 1000),
    ev("rip", 1400),
    ev("rip", 1500),
    ev("room", 2200, "Rockets"),
    ev("foil", 2800),
    ev("lock", 6000),
    ev("card", 9000, "v1.HOU.90s-east.grit.22.booker~eason~fox~franz~jalenw"),
    ev("tray", 9800),
    ev("copy", 10200),
  ]);
  assert.deepEqual(folded.order, ["home", "rip", "room", "foil", "lock", "card", "tray", "copy"]);
  assert.deepEqual(folded.missing, ["save", "open"]);
  assert.equal(folded.toCardMs, 8000);
  assert.equal(folded.toTrayMs, 8800);
  assert.equal(folded.toSendMs, 9200);
  assert.equal(folded.sent, true);
});

test("save or copy both count as a send", () => {
  assert.equal(foldFunnel([ev("home", 1), ev("save", 50)]).sent, true);
  assert.equal(foldFunnel([ev("home", 1), ev("copy", 50)]).sent, true);
  assert.equal(foldFunnel([ev("home", 1), ev("card", 50)]).sent, false);
});

test("a 90-second booth wants the card inside 90s", () => {
  const folded = foldFunnel([ev("home", 0), ev("card", 54_000), ev("tray", 58_000), ev("save", 61_000)]);
  assert.ok((folded.toCardMs ?? 1e9) < 90_000);
  assert.ok((folded.toSendMs ?? 1e9) < 90_000);
});

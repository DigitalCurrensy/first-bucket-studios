import assert from "node:assert/strict";
import { test } from "node:test";
import { luckShift } from "./luck.ts";

test("hot lifts, thin taxes, even is zero", () => {
  assert.equal(luckShift("Even"), 0);
  assert.ok(luckShift("Hot") > 0);
  assert.ok(luckShift("Thin") < 0);
  assert.ok(luckShift("Steel") > 0);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { FOIL_GL_ATTRS, foilGpuAllowed, foilGlSupported, foilNestedFrame } from "./foil-gl.ts";

test("foil stays synced to the compositor", () => {
  assert.equal(FOIL_GL_ATTRS.desynchronized, false);
  assert.equal(FOIL_GL_ATTRS.failIfMajorPerformanceCaveat, true);
  assert.equal(FOIL_GL_ATTRS.powerPreference, "low-power");
  assert.equal(FOIL_GL_ATTRS.preserveDrawingBuffer, false);
});

test("node has no frame, no GPU probe, and no foil canvas", () => {
  assert.equal(foilNestedFrame(), false);
  assert.equal(foilGpuAllowed(), false);
  assert.equal(foilGlSupported(), false);
});

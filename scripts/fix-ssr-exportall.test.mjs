import { test } from "node:test";
import assert from "node:assert/strict";
import { rewriteExportAllImports } from "./fix-ssr-exportall.mjs";

test("rewrites sibling __exportAll import to runtime", () => {
  const src = `import { i as __toESM } from "../_runtime.mjs";
import { A as __exportAll, B as WNBA } from "./router-abc.mjs";
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
`;
  const out = rewriteExportAllImports(src, "../_runtime.mjs");
  assert.ok(out);
  assert.equal(out.includes("A as __exportAll"), false);
  assert.match(out, /n as __exportAll/);
  assert.match(out, /from "\.\.\/_runtime\.mjs"/);
  assert.match(out, /B as WNBA/);
  assert.match(out, /__exportAll\(\{/);
});

test("leaves chunks that define the helper alone", () => {
  const src = `var __exportAll = (all, no_symbols) => { return {}; };
var x = __exportAll({ a: () => 1 });
`;
  assert.equal(rewriteExportAllImports(src, "../_runtime.mjs"), null);
});

test("leaves runtime imports alone", () => {
  const src = `import { n as __exportAll } from "../_runtime.mjs";
var ssr_exports = /* @__PURE__ */ __exportAll({ default: () => d });
`;
  assert.equal(rewriteExportAllImports(src, "../_runtime.mjs"), null);
});

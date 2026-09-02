#!/usr/bin/env node
/**
 * Rolldown sometimes copies `__exportAll` into an app chunk and then a sibling
 * chunk imports that copy. Those two files import each other, so when Nitro
 * loads the parent first the helper is still `undefined` — Vercel 500s with
 * `__exportAll is not a function`.
 *
 * Rewrite those imports to the real helper in `_runtime.mjs`, which has no
 * cycle.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function vercelFuncDir(root = ROOT) {
  return join(root, ".vercel/output/functions/__server.func");
}

function walkMjs(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walkMjs(p, out);
    else if (ent.name.endsWith(".mjs")) out.push(p);
  }
  return out;
}

function findRuntime(funcDir) {
  const p = join(funcDir, "_runtime.mjs");
  return existsSync(p) ? p : null;
}

/** Strip `Foo as __exportAll` / `__exportAll` from an `import { … }` spec list. */
function stripExportAllSpec(spec) {
  const kept = spec
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s !== "__exportAll" && !/\bas\s+__exportAll$/.test(s));
  return kept;
}

/**
 * Merge `n as __exportAll` into an existing `_runtime.mjs` import, or prepend
 * a new one. Returns the patched source, or null if nothing changed.
 */
export function rewriteExportAllImports(code, runtimeSpecifier) {
  if (!code.includes("__exportAll(")) return null;
  if (/var __exportAll\s*=/.test(code) || /function __exportAll\s*\(/.test(code)) return null;

  let stripped = false;
  let next = code.replace(
    /import\s*\{([^}]*)\}\s*from\s*(["'])([^"']+)\2;?/g,
    (full, spec, quote, from) => {
      if (!spec.includes("__exportAll")) return full;
      if (from.includes("_runtime")) return full;
      const kept = stripExportAllSpec(spec);
      stripped = true;
      if (kept.length === 0) return "";
      return `import { ${kept.join(", ")} } from ${quote}${from}${quote};`;
    },
  );
  if (!stripped) return null;

  if (
    /from\s*(["'])[^"']*_runtime[^"']*\1/.test(next) &&
    /as\s+__exportAll/.test(
      next.match(/import\s*\{([^}]*)\}\s*from\s*["'][^"']*_runtime[^"']*["']/)?.[1] ?? "",
    )
  ) {
    return next;
  }

  const runtimeImport = `import { n as __exportAll } from ${JSON.stringify(runtimeSpecifier)};`;
  const runtimeRe = /import\s*\{([^}]*)\}\s*from\s*(["'])([^"']*_runtime[^"']*)\2;?/;
  if (runtimeRe.test(next)) {
    next = next.replace(runtimeRe, (full, spec, quote, from) => {
      if (spec.includes("__exportAll")) return full;
      const specs = spec
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      specs.push("n as __exportAll");
      return `import { ${specs.join(", ")} } from ${quote}${from}${quote};`;
    });
    return next;
  }

  const firstImport = next.search(/^import\s/m);
  if (firstImport === -1) return `${runtimeImport}\n${next}`;
  return `${next.slice(0, firstImport)}${runtimeImport}\n${next.slice(firstImport)}`;
}

export function patchFuncDir(funcDir) {
  const runtime = findRuntime(funcDir);
  if (!runtime) return [];
  const patched = [];
  for (const file of walkMjs(funcDir)) {
    const before = readFileSync(file, "utf8");
    const rel = relative(dirname(file), runtime).replaceAll("\\", "/");
    const specifier = rel.startsWith(".") ? rel : `./${rel}`;
    const after = rewriteExportAllImports(before, specifier);
    if (after && after !== before) {
      writeFileSync(file, after);
      patched.push(relative(funcDir, file));
    }
  }
  return patched;
}

export function patchWorkspace(root = ROOT) {
  return patchFuncDir(vercelFuncDir(root));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const patched = patchWorkspace();
  if (patched.length === 0) {
    console.log("[fix-ssr-exportall] nothing to patch");
  } else {
    for (const f of patched) console.log(`[fix-ssr-exportall] ${f}`);
  }
}

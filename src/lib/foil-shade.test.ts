import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FILM_ABBE_VD,
  FILM_CAUCHY_A,
  FILM_CAUCHY_B,
  FILM_CAUCHY_C,
  FILM_FINESSE_MAX,
  FILM_LAMBDA,
  FILM_LAMBDA_C,
  FILM_LAMBDA_D,
  FILM_LAMBDA_F,
  FILM_N,
  FILM_N_D,
  FILM_R_ABSORBER,
  FILM_R_ABSORBER_RGB,
  FILM_R_METAL,
  FILM_R_METAL_RGB,
  FILM_THICK_MAX,
  FILM_THICK_MIN,
  FLAKE_MAP,
  FOIL_GLSL1_FS,
  FOIL_GLSL3_FS,
  FOIL_WGSL,
  FOIL_WGSL_CS,
  airyCoefficients,
  bakeFlakeMap,
  bakeFlakePixel,
  cauchyFromAbbe,
  coatingFinesse,
  filmIndex,
  filmOrder,
  filmPeakThickness,
  hash2u,
  hexRgb,
  clcRgb,
  clcRgbMono,
  clcPitch,
  clcPitchField,
  clcBraggPeak,
  clcGapHalf,
  flakeGlint,
  flakeKind,
  structuralRgb,
  thinFilmRgb,
  twoBeamRgb,
  CLC_CHIRP,
  CLC_DN,
  CLC_N,
  CLC_PITCH_MAX,
  CLC_PITCH_MIN,
} from "./foil-shade.ts";

test("hexRgb reads club inks", () => {
  assert.deepEqual(hexRgb("#ff0000"), [1, 0, 0]);
  assert.deepEqual(hexRgb("#00FF00"), [0, 1, 0]);
  assert.deepEqual(hexRgb("#fff"), [1, 1, 1]);
  const gold = hexRgb("#C5A059");
  assert.ok(gold[0]! > gold[2]!);
  assert.deepEqual(hexRgb("nope"), [0.85, 0.75, 0.5]);
});

test("thin-film rgb stays in 0..1 and shifts with thickness and angle", () => {
  assert.ok(FILM_N > 1.51 && FILM_N < 1.54);
  assert.deepEqual([...FILM_LAMBDA], [650, 550, 450]);

  const face = thinFilmRgb(400, 1);
  const glance = thinFilmRgb(400, 0.2);
  const thin = thinFilmRgb(FILM_THICK_MIN, 1);
  const thick = thinFilmRgb(FILM_THICK_MAX, 1);
  const again = thinFilmRgb(400, 1);

  for (const rgb of [face, glance, thin, thick]) {
    assert.equal(rgb.length, 3);
    for (const c of rgb) {
      assert.ok(c >= 0 && c <= 1);
      assert.ok(Number.isFinite(c));
    }
  }
  assert.deepEqual(face, again);
  assert.notDeepEqual(face, glance);
  assert.notDeepEqual(thin, thick);
});

test("Cauchy A/B come from n_d and Abbe Vd; blue is slower than red", () => {
  assert.equal(FILM_N_D, 1.52);
  assert.equal(FILM_ABBE_VD, 42);
  assert.equal(FILM_CAUCHY_C, 0);
  const fit = cauchyFromAbbe(FILM_N_D, FILM_ABBE_VD, 0);
  assert.equal(FILM_CAUCHY_A, fit.a);
  assert.equal(FILM_CAUCHY_B, fit.b);
  assert.ok(fit.b > 0.005 && fit.b < 0.008);

  const nC = filmIndex(FILM_LAMBDA_C);
  const nD = filmIndex(FILM_LAMBDA_D);
  const nF = filmIndex(FILM_LAMBDA_F);
  assert.ok(Math.abs(nD - FILM_N_D) < 1e-10);
  const vd = (nD - 1) / (nF - nC);
  assert.ok(Math.abs(vd - FILM_ABBE_VD) < 0.05, `Abbe ${vd}`);

  const nR = filmIndex(FILM_LAMBDA[0]);
  const nG = filmIndex(FILM_LAMBDA[1]);
  const nB = filmIndex(FILM_LAMBDA[2]);
  assert.ok(Math.abs(nG - FILM_N) < 1e-12);
  assert.ok(nB > nG && nG > nR, `n ${nB} > ${nG} > ${nR}`);
  assert.ok(nB - nR > 0.012);
});

test("thin-film orders 1 and 2 sit on the pack", () => {
  const d1 = filmPeakThickness(1, FILM_LAMBDA[1]!);
  const d2 = filmPeakThickness(2, FILM_LAMBDA[1]!);
  assert.ok(d1 >= FILM_THICK_MIN - 2 && d1 < d2);
  assert.ok(d2 <= FILM_THICK_MAX);
  assert.ok(Math.abs(filmOrder(d1, FILM_LAMBDA[1]!) - 1) < 1e-6);
  assert.ok(Math.abs(filmOrder(d2, FILM_LAMBDA[1]!) - 2) < 1e-6);
  const first = thinFilmRgb(d1, 1);
  const second = thinFilmRgb(d2, 1);
  assert.ok(first[1]! > 0.95);
  assert.ok(second[1]! > 0.95);
  assert.ok(filmOrder(FILM_THICK_MIN, FILM_LAMBDA[1]!) < 1.2);
  assert.ok(filmOrder(FILM_THICK_MAX, FILM_LAMBDA[1]!) > 2.4);
});

test("Airy coefficients derive F from Cr/Al per channel", () => {
  assert.equal(FILM_R_ABSORBER, 0.38);
  assert.equal(FILM_R_METAL, 0.92);
  assert.deepEqual([...FILM_R_ABSORBER_RGB], [0.42, 0.38, 0.34]);
  assert.deepEqual([...FILM_R_METAL_RGB], [0.905, 0.92, 0.928]);

  const green = airyCoefficients(1, 550);
  assert.equal(coatingFinesse(1), green.F);
  assert.ok(green.F > 8 && green.F <= FILM_FINESSE_MAX);
  assert.ok(Math.abs(green.imin - 1 / (1 + green.F)) < 1e-12);
  assert.equal(green.imax, 1);
  assert.ok(green.rho > 0 && green.rho < 1);
  assert.ok(green.r1 > 0 && green.r1 < green.r2);

  const red = airyCoefficients(1, 650);
  const blue = airyCoefficients(1, 450);
  assert.ok(red.F > blue.F, `red F ${red.F} vs blue ${blue.F}`);
  assert.ok(coatingFinesse(0.15) > green.F);

  const glance = airyCoefficients(0.15, 550);
  assert.ok(glance.r1 > green.r1);
});

test("multi-beam Airy is sharper than two-beam and peaks at the same orders", () => {
  const nG = filmIndex(FILM_LAMBDA[1]);
  const F = coatingFinesse(1);
  const peakD = FILM_LAMBDA[1]! / nG;
  const multiPeak = thinFilmRgb(peakD, 1);
  const twoPeak = twoBeamRgb(peakD, 1);
  assert.ok(Math.abs(multiPeak[1]! - 1) < 0.02);
  assert.ok(Math.abs(twoPeak[1]! - 1) < 0.02);
  const floor = 1 / (1 + F);
  const troughD = 0.75 * FILM_LAMBDA[1]! / nG;
  assert.ok(Math.abs(thinFilmRgb(troughD, 1)[1]! - floor) < 0.02);
  assert.ok(multiPeak[0]! < 0.95 || multiPeak[2]! < 0.95);

  let twoHi = 0;
  let multiHi = 0;
  let twoMid = 0;
  let multiMid = 0;
  for (let d = FILM_THICK_MIN; d <= FILM_THICK_MAX; d += 2) {
    const two = twoBeamRgb(d, 1)[1]!;
    const multi = thinFilmRgb(d, 1)[1]!;
    if (two > 0.65) twoHi += 1;
    if (multi > 0.65) multiHi += 1;
    twoMid += two;
    multiMid += multi;
  }
  assert.ok(multiHi < twoHi, `Airy peaks ${multiHi} vs two-beam ${twoHi}`);
  assert.ok(multiMid < twoMid, "Airy sits darker between orders");
});

test("cholesteric pitch is a photonic stop-band that blue-shifts", () => {
  assert.equal(CLC_N, 1.55);
  assert.equal(CLC_DN, 0.24);
  assert.equal(CLC_PITCH_MIN, 300);
  assert.equal(CLC_PITCH_MAX, 470);
  assert.equal(CLC_CHIRP, 0.12);
  assert.equal(clcPitch(0), CLC_PITCH_MIN);
  assert.equal(clcPitch(1), CLC_PITCH_MAX);
  assert.ok(Math.abs(clcBraggPeak(400, 1) - CLC_N * 400) < 1e-9);

  const half = clcGapHalf(400);
  const u = 0.45;
  const gap = Math.exp(-(u ** 4));
  const lorentz = 1 / (1 + u * u);
  assert.ok(gap > lorentz, "stop-band stays high in the gap");

  const face = clcRgb(400, 1);
  const mid = clcRgb(400, 0.7);
  const glance = clcRgb(400, 0.2);
  for (const rgb of [face, mid, glance]) {
    for (const c of rgb) {
      assert.ok(c >= 0 && c <= 1);
    }
  }
  assert.ok(face[0]! > face[1]! && face[0]! > face[2]!, "face is gold/red");
  assert.ok(mid[1]! > mid[0]! && mid[1]! > mid[2]!, "mid tilt is green");
  assert.ok(glance[2]! > glance[0]! && glance[2]! > glance[1]!, "glance is blue");
  const hue = (rgb: [number, number, number]) =>
    (650 * rgb[0] + 550 * rgb[1] + 450 * rgb[2]) / (rgb[0] + rgb[1] + rgb[2] + 1e-6);
  assert.ok(hue(face) > hue(mid) && hue(mid) > hue(glance));

  const mono = clcRgbMono(400, 1);
  assert.deepEqual(clcRgb(400, 1, 0), mono);
  assert.ok(face[1]! > mono[1]!, "chirp fills beetle gold");
  assert.ok(hue(clcRgb(clcPitch(0), 1)) < hue(clcRgb(clcPitch(1), 1)), "short pitch is greener");
  const left = clcRgb(clcPitchField(0, 0.5), 1);
  const midField = clcRgb(clcPitchField(0.5, 0.5), 1);
  assert.ok(Math.abs(hue(left) - hue(midField)) > 8, "pitch field travels across the plate");
});

test("structural color splits CLC flakes from metal-film flakes", () => {
  assert.equal(flakeKind(0.2), 0);
  assert.equal(flakeKind(0.8), 1);
  assert.deepEqual(structuralRgb(400, 400, 1, 0), thinFilmRgb(400, 1));
  assert.deepEqual(structuralRgb(400, 400, 1, 1), clcRgb(400, 1));
});

test("platelet glint is face-on and masked by spark", () => {
  const headOn = flakeGlint(0.5, 0.5, 1, 0, 0);
  const tossed = flakeGlint(0.5, 0.5, 1, 1, 1);
  assert.ok(headOn > 0.95);
  assert.ok(tossed < 0.05);
  assert.equal(flakeGlint(0.5, 0.5, 0, 0, 0), 0);
  assert.ok(flakeGlint(0.2, 0.8, 1, 0, 0) < headOn);
});

test("flake map bakes thickness spark bump phase", () => {
  const pixel = bakeFlakePixel(12, 40);
  assert.ok(pixel[0] >= 0.12 && pixel[0] <= 0.92);
  assert.ok(pixel[1] === 0 || pixel[1] === 1);
  assert.ok(pixel[2] >= 0 && pixel[2] < 1);
  assert.ok(pixel[3] >= 0 && pixel[3] < 1);
  assert.deepEqual(bakeFlakePixel(12, 40), pixel);

  const h = hash2u(3, 11);
  assert.ok(h >= 0 && h < 1);

  const map = bakeFlakeMap();
  assert.equal(map.length, FLAKE_MAP * FLAKE_MAP * 4);
  let sparks = 0;
  for (let i = 1; i < map.length; i += 4) {
    if (map[i]! > 200) sparks += 1;
  }
  assert.ok(sparks > 80 && sparks < 12000);
});

test("glsl foil dialects share the same shade contract", () => {
  for (const src of [FOIL_GLSL1_FS, FOIL_GLSL3_FS]) {
    assert.match(src, /hash21/);
    assert.match(src, /thinFilm/);
    assert.match(src, /opd/);
    assert.match(src, /650\.0/);
    assert.match(src, /1000\.0 \/ lambda/);
    assert.match(src, new RegExp(`mix\\(${FILM_THICK_MIN}\\.0, ${FILM_THICK_MAX}\\.0`));
    assert.ok(src.includes(FILM_CAUCHY_A.toFixed(6)));
    assert.ok(src.includes(FILM_CAUCHY_B.toFixed(6)));
    assert.match(src, /0\.42, 0\.38, 0\.34/);
    assert.match(src, /0\.905, 0\.92, 0\.928/);
    assert.match(src, /1\.0 \+ F \* \(1\.0 - s2\)/);
    assert.match(src, /clcBragg/);
    assert.match(src, /clcStack\(pitch, ndv, chirp\)/);
    assert.match(src, /uv\.x \* 2\.0/);
    assert.match(src, /step\(0\.34/);
    assert.match(src, /0\.86, 0\.58, 0\.16/);
    assert.match(src, /flakeGlint/);
    assert.match(src, /x2 \* x2/);
    assert.match(src, new RegExp(`mix\\(${CLC_PITCH_MIN}\\.0, ${CLC_PITCH_MAX}\\.0`));
    assert.match(src, /foil/);
    assert.match(src, /flare/);
    assert.match(src, /ink/);
  }
  assert.match(FOIL_GLSL3_FS, /^#version 300 es/m);
});

test("wgsl render and compute stay on separate modules", () => {
  assert.match(FOIL_WGSL, /@fragment/);
  assert.match(FOIL_WGSL, /var<uniform>/);
  assert.match(FOIL_WGSL, /thinFilm/);
  assert.match(FOIL_WGSL, /opd/);
  assert.match(FOIL_WGSL, /650\.0/);
  assert.match(FOIL_WGSL, /1000\.0 \/ lambda/);
  assert.match(FOIL_WGSL, new RegExp(`mix\\(${FILM_THICK_MIN}\\.0, ${FILM_THICK_MAX}\\.0`));
  assert.ok(FOIL_WGSL.includes(FILM_CAUCHY_A.toFixed(6)));
  assert.ok(FOIL_WGSL.includes(FILM_CAUCHY_B.toFixed(6)));
  assert.match(FOIL_WGSL, /0\.42, 0\.38, 0\.34/);
  assert.match(FOIL_WGSL, /0\.905, 0\.92, 0\.928/);
  assert.match(FOIL_WGSL, /1\.0 \+ F \* \(1\.0 - s2\)/);
  assert.match(FOIL_WGSL, /clcBragg/);
  assert.match(FOIL_WGSL, /clcStack\(pitch, ndv, chirp\)/);
  assert.match(FOIL_WGSL, /uv\.x \* 2\.0/);
  assert.match(FOIL_WGSL, /step\(0\.34/);
  assert.match(FOIL_WGSL, /0\.86, 0\.58, 0\.16/);
  assert.match(FOIL_WGSL, /flakeGlint/);
  assert.match(FOIL_WGSL, /x2 \* x2/);
  assert.match(FOIL_WGSL, new RegExp(`mix\\(${CLC_PITCH_MIN}\\.0, ${CLC_PITCH_MAX}\\.0`));
  assert.doesNotMatch(FOIL_WGSL, /@compute/);
  assert.doesNotMatch(FOIL_WGSL, /texture_storage_2d/);

  assert.match(FOIL_WGSL_CS, /@compute/);
  assert.match(FOIL_WGSL_CS, /texture_storage_2d<rgba8unorm, write>/);
  assert.match(FOIL_WGSL_CS, /@workgroup_size\(8, 8\)/);
  assert.match(FOIL_WGSL_CS, /textureStore/);
  assert.match(FOIL_WGSL_CS, /@group\(0\) @binding\(0\)/);
  assert.doesNotMatch(FOIL_WGSL_CS, /var<uniform>/);
});

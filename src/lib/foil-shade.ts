/** Shared foil shading. WebGPU / WebGL2 / WebGL1 all run this look. */

export type FoilHandle = {
  setTilt: (x: number, y: number) => void;
  setColors: (foil: string, flare: string, ink?: string) => void;
  resize: () => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

export function hexRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const h =
    raw.length === 3
      ? `${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`
      : raw.slice(0, 6).padEnd(6, "0");
  const n = Number.parseInt(h, 16);
  if (!Number.isFinite(n)) return [0.85, 0.75, 0.5];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function clamp01(n: number, fallback: number) {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
}

export function reducedMotion() {
  try {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** Fraunhofer lines used to fit the lacquer, nanometres. */
export const FILM_LAMBDA_C = 656.3;
export const FILM_LAMBDA_D = 587.6;
export const FILM_LAMBDA_F = 486.1;
/** Helium d-line index. Cellulose-acetate / UV lacquer on card foil. */
export const FILM_N_D = 1.52;
/** Abbe Vd = (n_d − 1) / (n_F − n_C). Flint-ish lacquer, not silica. */
export const FILM_ABBE_VD = 42;
/** Peak photopic RGB, nanometres. */
export const FILM_LAMBDA = [650, 550, 450] as const;
/** 1st-order color-shift through 2nd-order rainbow, nanometres. */
export const FILM_THICK_MIN = 180;
export const FILM_THICK_MAX = 540;
export const FLAKE_MAP = 256;
export const FLAKE_WORKGROUP = 8;
/** Cr absorber at 550 nm, ~8 nm. Color-shift ink, ChromaFlair, OVI. */
export const FILM_R_ABSORBER = 0.38;
/** Cr R(λ): more reflective toward red. */
export const FILM_R_ABSORBER_RGB = [0.42, 0.38, 0.34] as const;
/** Opaque aluminum under the spacer, 550 nm. */
export const FILM_R_METAL = 0.92;
/** Al R(λ) in the visible. Slightly lower in red. */
export const FILM_R_METAL_RGB = [0.905, 0.92, 0.928] as const;
/** Clamp so RGB samples do not collapse to a spike. */
export const FILM_FINESSE_MAX = 18;
/** Cholesteric mean index (n_o + n_e) / 2. */
export const CLC_N = 1.55;
/** Birefringence Δn. Sets Bragg bandwidth Δλ ≈ Δn P. */
export const CLC_DN = 0.24;
/** Helical pitch range, nanometres. Beetle gold through green. */
export const CLC_PITCH_MIN = 300;
export const CLC_PITCH_MAX = 470;
/** Pitch chirp through the helix, like a scarab cuticle. Broadens the gold. */
export const CLC_CHIRP = 0.12;
/** Super-Gaussian order of the photonic stop-band. 4 = flat gap, steep walls. */
export const CLC_GAP_ORDER = 4;

/**
 * Two-term Cauchy from n_d and Vd.
 * n = A + B/λ² + C/λ⁴, λ in micrometres.
 * B = (n_d − 1) / (Vd (λ_F⁻² − λ_C⁻²)). A holds n_d.
 */
export function cauchyFromAbbe(nd: number, vd: number, c = 0) {
  const inv2 = (nm: number) => {
    const um = nm / 1000;
    return 1 / (um * um);
  };
  const dFC = inv2(FILM_LAMBDA_F) - inv2(FILM_LAMBDA_C);
  const b = (nd - 1) / (vd * dFC);
  const a = nd - b * inv2(FILM_LAMBDA_D) - c * inv2(FILM_LAMBDA_D) ** 2;
  return { a, b, c };
}

const CAUCHY = cauchyFromAbbe(FILM_N_D, FILM_ABBE_VD, 0);
export const FILM_CAUCHY_A = CAUCHY.a;
export const FILM_CAUCHY_B = CAUCHY.b;
export const FILM_CAUCHY_C = CAUCHY.c;

export type AiryCoeffs = {
  n: number;
  r1: number;
  r2: number;
  rho: number;
  F: number;
  imax: number;
  imin: number;
};

/** Spacer index. Normal dispersion: blue runs slower than red. */
export function filmIndex(lambdaNm: number): number {
  const um = lambdaNm / 1000;
  const inv2 = 1 / (um * um);
  return FILM_CAUCHY_A + FILM_CAUCHY_B * inv2 + FILM_CAUCHY_C * inv2 * inv2;
}

/** n at 550 nm, derived from the d-line fit. */
export const FILM_N = filmIndex(550);

function glf(n: number) {
  return Number.isInteger(n) ? n.toFixed(1) : n.toFixed(6);
}

function channelOf(lambdaNm: number): number {
  const i = FILM_LAMBDA.indexOf(lambdaNm as (typeof FILM_LAMBDA)[number]);
  return i < 0 ? 1 : i;
}

/**
 * Airy coefficients at one wavelength.
 * ρ = √(R1 R2). F = 4ρ / (1−ρ)². Imin = 1 / (1+F) for the peaked form.
 * R1 is the Cr absorber, lifted toward 1 at grazing (Schlick).
 */
export function airyCoefficients(cosIncident: number, lambdaNm: number): AiryCoeffs {
  const ci = Math.min(1, Math.max(0.05, cosIncident));
  const ch = channelOf(lambdaNm);
  const rAbs = FILM_R_ABSORBER_RGB[ch]!;
  const r2 = FILM_R_METAL_RGB[ch]!;
  const r1 = Math.min(0.82, rAbs + (1 - rAbs) * (1 - ci) ** 5);
  const rho = Math.sqrt(r1 * r2);
  const F = Math.min(FILM_FINESSE_MAX, (4 * rho) / Math.max((1 - rho) ** 2, 0.05));
  return { n: filmIndex(lambdaNm), r1, r2, rho, F, imax: 1, imin: 1 / (1 + F) };
}

/** Green-channel finesse. Packs that only need a scalar still call this. */
export function coatingFinesse(cosIncident: number): number {
  return airyCoefficients(cosIncident, FILM_LAMBDA[1]).F;
}

function filmOpd(thicknessNm: number, cosIncident: number, n: number) {
  const ci = Math.min(1, Math.max(0.05, cosIncident));
  const sin2t = (1 - ci * ci) / (n * n);
  const cosT = Math.sqrt(Math.max(0, 1 - sin2t));
  return { ci, opd: 2 * n * thicknessNm * cosT };
}

/** Interference order m = 2 n(λ) d cos θt / λ. Peaks sit on integers. */
export function filmOrder(thicknessNm: number, lambdaNm: number, cosIncident = 1): number {
  const { opd } = filmOpd(thicknessNm, cosIncident, filmIndex(lambdaNm));
  return opd / lambdaNm;
}

/** Physical thickness at order m, face-on. */
export function filmPeakThickness(order: number, lambdaNm: number): number {
  return (order * lambdaNm) / (2 * filmIndex(lambdaNm));
}

/** Two-beam limit (F → 0): sin²(δ/2). Same dispersed OPD, no multiple bounces. */
export function twoBeamRgb(thicknessNm: number, cosIncident: number): [number, number, number] {
  return FILM_LAMBDA.map((lambda) => {
    const { opd } = filmOpd(thicknessNm, cosIncident, filmIndex(lambda));
    const delta = (2 * Math.PI * opd) / lambda + Math.PI;
    return 0.5 - 0.5 * Math.cos(delta);
  }) as [number, number, number];
}

/**
 * Multi-beam Airy reflectance for a metal-dielectric-metal coating.
 * Per-channel F from Cr/Al. Per-channel n from Cauchy.
 * R = 1 / (1 + F (1 − sin²(δ/2))). Narrower than two-beam, same zeros.
 * OPD = 2 n(λ) d cos θt. Half-wave loss on the metal.
 * Returns 0..1 per channel. Same numbers the shaders use.
 */
export function thinFilmRgb(thicknessNm: number, cosIncident: number): [number, number, number] {
  const ci = Math.min(1, Math.max(0.05, cosIncident));
  return FILM_LAMBDA.map((lambda) => {
    const { F, n } = airyCoefficients(ci, lambda);
    const { opd } = filmOpd(thicknessNm, ci, n);
    const delta = (2 * Math.PI * opd) / lambda + Math.PI;
    const s = Math.sin(delta * 0.5);
    return 1 / (1 + F * (1 - s * s));
  }) as [number, number, number];
}

/**
 * Cholesteric helix is a 1D photonic crystal. Pitch P is the lattice.
 * Stop-band center λ_B = n P cos θt. Gap width Δλ = Δn P.
 * Super-Gaussian envelope: flat in the gap, steep at the edge — not a Lorentzian spike.
 */
export function clcPitch(phase: number): number {
  const t = Math.min(1, Math.max(0, phase));
  return CLC_PITCH_MIN + (CLC_PITCH_MAX - CLC_PITCH_MIN) * t;
}

/** Elytron-style field. Pitch walks across the surface, then chirp walks the helix. */
export function clcPitchField(u: number, v: number): number {
  const uu = Math.min(1, Math.max(0, u));
  const vv = Math.min(1, Math.max(0, v));
  const wave = 0.5 + 0.5 * Math.sin((uu * 2.0 + vv * 0.4) * Math.PI);
  return clcPitch(wave);
}

export function clcBraggPeak(pitchNm: number, cosIncident: number): number {
  const n = CLC_N;
  const ci = Math.min(1, Math.max(0.05, cosIncident));
  const sin2t = (1 - ci * ci) / (n * n);
  const cosT = Math.sqrt(Math.max(0, 1 - sin2t));
  return n * pitchNm * cosT;
}

export function clcGapHalf(pitchNm: number): number {
  return 0.5 * CLC_DN * pitchNm;
}

export function clcRgbMono(pitchNm: number, cosIncident: number): [number, number, number] {
  const peak = clcBraggPeak(pitchNm, cosIncident);
  const half = clcGapHalf(pitchNm);
  return FILM_LAMBDA.map((lambda) => {
    const x = (lambda - peak) / half;
    const x2 = x * x;
    return Math.exp(-(x2 * x2));
  }) as [number, number, number];
}

/** Chirped helix: three pitches around P. chirp=0 is a saturated beetle; chirp fills gold. */
export function clcRgb(pitchNm: number, cosIncident: number, chirp = CLC_CHIRP): [number, number, number] {
  const c = Math.min(0.35, Math.max(0, chirp));
  const stack = [1 - c, 1, 1 + c];
  const acc: [number, number, number] = [0, 0, 0];
  for (const scale of stack) {
    const rgb = clcRgbMono(pitchNm * scale, cosIncident);
    acc[0] += rgb[0]!;
    acc[1] += rgb[1]!;
    acc[2] += rgb[2]!;
  }
  return [acc[0] / 3, acc[1] / 3, acc[2] / 3];
}

/** 1 = cholesteric stop-band flake, 0 = metal-dielectric-metal flake. */
export function flakeKind(phase: number): number {
  return phase >= 0.5 ? 1 : 0;
}

/** Two structural-color mechanisms. Kind picks the lattice. */
export function structuralRgb(
  thicknessNm: number,
  pitchNm: number,
  cosIncident: number,
  kind: number,
): [number, number, number] {
  const k = kind >= 0.5 ? 1 : 0;
  const film = thinFilmRgb(thicknessNm, cosIncident);
  const clc = clcRgb(pitchNm, cosIncident);
  return [film[0]! * (1 - k) + clc[0]! * k, film[1]! * (1 - k) + clc[1]! * k, film[2]! * (1 - k) + clc[2]! * k];
}

/**
 * Leafing platelet glint. Flake normal from bump/phase, spark mask from the map.
 * Face-on flakes flash hard; tilted flakes drop off as ndv^40.
 */
export function flakeGlint(bump: number, phase: number, spark: number, tiltX: number, tiltY: number): number {
  const nx = (bump - 0.5) * 0.7 + tiltX * 0.35;
  const ny = (phase - 0.5) * 0.55 + tiltY * 0.35;
  const ndv = 1 / Math.hypot(nx, ny, 1);
  return spark * ndv ** 40;
}

/** PCG hash matching the WGSL bake. Unsigned 32-bit. */
export function pcgU32(n: number): number {
  let h = (Math.imul(n, 747796405) + 2891336453) >>> 0;
  h = Math.imul((h >>> ((h >>> 28) + 4)) ^ h, 277803737) >>> 0;
  return ((h >>> 22) ^ h) >>> 0;
}

export function hash2u(x: number, y: number): number {
  const n = (Math.imul(x >>> 0, 1597334677) + Math.imul(y >>> 0, 3812015801)) >>> 0;
  return pcgU32(n) / 4294967296;
}

/** One texel of the flake map: thickness, spark, bump, phase. 0..1. */
export function bakeFlakePixel(x: number, y: number): [number, number, number, number] {
  const cellX = Math.floor(x / 6);
  const cellY = Math.floor(y / 6);
  const thickMix = hash2u(cellX, cellY) * 0.55 + hash2u(cellX + 19, cellY + 7) * 0.45;
  const thick = 0.12 + 0.8 * thickMix;
  const flake = hash2u(x, y) >= 0.91 ? 1 : 0;
  const bump = hash2u(x + 3, y + 11);
  const phase = hash2u(x + 29, y + 5);
  return [thick, flake, bump, phase];
}

export function bakeFlakeMap(): Uint8Array {
  const n = FLAKE_MAP;
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const [t, f, b, p] = bakeFlakePixel(x, y);
      const i = (y * n + x) * 4;
      data[i] = Math.round(t * 255);
      data[i + 1] = Math.round(f * 255);
      data[i + 2] = Math.round(b * 255);
      data[i + 3] = Math.round(p * 255);
    }
  }
  return data;
}

/** Multi-beam Airy coating + anisotropic grain + sparkle. Premultiplied out. */
export const FOIL_GLSL_MATH = `
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 thinFilm(float thickNm, float ndv) {
  vec3 lambda = vec3(650.0, 550.0, 450.0);
  vec3 invUm = 1000.0 / lambda;
  vec3 inv2 = invUm * invUm;
  vec3 n = vec3(${glf(FILM_CAUCHY_A)}) + ${glf(FILM_CAUCHY_B)} * inv2 + ${glf(FILM_CAUCHY_C)} * inv2 * inv2;
  vec3 sin2t = vec3(1.0 - ndv * ndv) / (n * n);
  vec3 cosT = sqrt(max(vec3(0.0), vec3(1.0) - sin2t));
  vec3 opd = 2.0 * n * thickNm * cosT;
  vec3 delta = 6.283185 * opd / lambda + 3.141593;
  vec3 rAbs = vec3(0.42, 0.38, 0.34);
  vec3 rMet = vec3(0.905, 0.92, 0.928);
  float lift = pow(1.0 - ndv, 5.0);
  vec3 r1 = min(vec3(0.82), rAbs + (vec3(1.0) - rAbs) * lift);
  vec3 rho = sqrt(r1 * rMet);
  vec3 oneMinus = vec3(1.0) - rho;
  vec3 F = min(vec3(18.0), 4.0 * rho / max(oneMinus * oneMinus, vec3(0.05)));
  vec3 s = sin(delta * 0.5);
  vec3 s2 = s * s;
  return 1.0 / (1.0 + F * (1.0 - s2));
}

vec3 clcBragg(float pitchNm, float ndv) {
  float n = ${glf(CLC_N)};
  float sin2t = (1.0 - ndv * ndv) / (n * n);
  float cosT = sqrt(max(0.0, 1.0 - sin2t));
  float peak = n * pitchNm * cosT;
  float halfW = 0.5 * ${glf(CLC_DN)} * pitchNm;
  vec3 lambda = vec3(650.0, 550.0, 450.0);
  vec3 x = (lambda - vec3(peak)) / halfW;
  vec3 x2 = x * x;
  return exp(-(x2 * x2));
}

vec3 clcStack(float pitchNm, float ndv, float chirp) {
  float c = clamp(chirp, 0.0, 0.35);
  return (clcBragg(pitchNm * (1.0 - c), ndv) + clcBragg(pitchNm, ndv) + clcBragg(pitchNm * (1.0 + c), ndv)) / 3.0;
}

float flakeGlint(float bump, float phase, float spark, vec2 tilt) {
  vec3 fnm = normalize(vec3((bump - 0.5) * 0.70 + tilt.x * 0.35, (phase - 0.5) * 0.55 + tilt.y * 0.35, 1.0));
  return spark * pow(clamp(fnm.z, 0.0, 1.0), 40.0);
}

vec4 foilShade(vec2 frag, vec2 res, vec2 tiltUv, float time, vec3 foil, vec3 flare, vec3 ink) {
  vec2 uv = frag / max(res, vec2(1.0));
  vec2 tilt = tiltUv * 2.0 - 1.0;
  float bump01 = hash21(floor(uv * 64.0));
  float bump = bump01 * 0.14;
  vec3 N = normalize(vec3(tilt.x * 1.45 + bump, tilt.y * 1.1, 1.0));
  float ndv = clamp(N.z, 0.05, 1.0);
  float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);

  float thick = mix(${glf(FILM_THICK_MIN)}, ${glf(FILM_THICK_MAX)}, hash21(floor(uv * 48.0 + tilt * 2.0)));
  vec3 film = thinFilm(thick, ndv);
  float field = 0.5 + 0.5 * sin((uv.x * 2.0 + uv.y * 0.4) * 3.141593);
  float t = mix(field, hash21(floor(uv * 8.0)), 0.22);
  float pitch = mix(${glf(CLC_PITCH_MIN)}, ${glf(CLC_PITCH_MAX)}, t);
  float chirp = ${glf(CLC_CHIRP)} * (0.25 + 0.75 * field);
  vec3 clc = clcStack(pitch, ndv, chirp);
  float kind = step(0.34, hash21(floor(uv * 22.0 + vec2(9.0, 3.0))));
  vec3 coat = mix(film, clc, kind);

  vec2 cell = floor(uv * vec2(72.0, 110.0) + vec2(tilt.x * 3.5, time * 0.7));
  float sparkMask = step(0.938, hash21(cell));
  float glint = flakeGlint(bump01, hash21(cell + vec2(3.1, 8.7)), sparkMask, tilt);

  vec3 irid = foil + (flare - foil) * coat;
  irid = mix(irid, ink, 0.14 * mix(film.g, clc.g, kind));
  irid = mix(irid, vec3(0.86, 0.58, 0.16), 0.28 * clc.r * kind);
  irid = mix(irid, vec3(0.16, 0.64, 0.30), 0.26 * clc.g * kind);
  irid = mix(irid, vec3(0.16, 0.36, 0.78), 0.30 * clc.b * kind);
  irid = mix(irid, vec3(0.96, 0.88, 0.48), 0.32 * glint * kind);

  float grain = sin((uv.x * 38.0 - uv.y * 9.0 + tilt.x * 6.0 - time * 0.32) * 6.283185);
  float aniso = pow(0.5 + 0.5 * grain, 11.0);

  float sweepX = 0.28 + tiltUv.x * 0.44 + 0.10 * sin(time * 1.35);
  float flash = smoothstep(0.26, 0.0, abs(uv.x - sweepX));

  float clcWash = (clc.r + clc.g + clc.b) / 3.0;
  float filmWash = (film.r + film.g + film.b) / 3.0;
  float coatWash = mix(filmWash, clcWash, kind);

  float wash = 0.06 + 0.22 * flash + 0.09 * aniso + 0.20 * fres + 0.22 * glint + 0.10 * clcWash * kind;
  wash = clamp(wash * (0.60 + 0.50 * coatWash), 0.0, 0.70);
  return vec4(irid * wash, wash);
}
`;

export const FOIL_GLSL1_VS = `#version 100
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const FOIL_GLSL1_FS = `#version 100
precision mediump float;
uniform vec2 u_res;
uniform vec2 u_tilt;
uniform float u_time;
uniform vec3 u_foil;
uniform vec3 u_flare;
uniform vec3 u_ink;
${FOIL_GLSL_MATH}
void main() {
  gl_FragColor = foilShade(gl_FragCoord.xy, u_res, u_tilt, u_time, u_foil, u_flare, u_ink);
}
`;

export const FOIL_GLSL3_VS = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const FOIL_GLSL3_FS = `#version 300 es
precision mediump float;
uniform vec2 u_res;
uniform vec2 u_tilt;
uniform float u_time;
uniform vec3 u_foil;
uniform vec3 u_flare;
uniform vec3 u_ink;
out vec4 fragColor;
${FOIL_GLSL_MATH}
void main() {
  fragColor = foilShade(gl_FragCoord.xy, u_res, u_tilt, u_time, u_foil, u_flare, u_ink);
}
`;

/** Render module only. Compute lives in FOIL_WGSL_CS so group 0 bindings do not collide. */
export const FOIL_WGSL = `
struct Uniforms {
  res: vec2f,
  tilt: vec2f,
  time: f32,
  _p0: f32,
  _p1: f32,
  _p2: f32,
  foil: vec4f,
  flare: vec4f,
  ink: vec4f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var flakes: texture_2d<f32>;
@group(0) @binding(2) var flakesSamp: sampler;

fn thinFilm(thickNm: f32, ndv: f32) -> vec3f {
  let lambda = vec3f(650.0, 550.0, 450.0);
  let invUm = 1000.0 / lambda;
  let inv2 = invUm * invUm;
  let n = vec3f(${glf(FILM_CAUCHY_A)}) + ${glf(FILM_CAUCHY_B)} * inv2 + ${glf(FILM_CAUCHY_C)} * inv2 * inv2;
  let sin2t = vec3f(1.0 - ndv * ndv) / (n * n);
  let cosT = sqrt(max(vec3f(0.0), vec3f(1.0) - sin2t));
  let opd = 2.0 * n * thickNm * cosT;
  let delta = 6.283185 * opd / lambda + 3.141593;
  let rAbs = vec3f(0.42, 0.38, 0.34);
  let rMet = vec3f(0.905, 0.92, 0.928);
  let lift = pow(1.0 - ndv, 5.0);
  let r1 = min(vec3f(0.82), rAbs + (vec3f(1.0) - rAbs) * lift);
  let rho = sqrt(r1 * rMet);
  let oneMinus = vec3f(1.0) - rho;
  let F = min(vec3f(18.0), 4.0 * rho / max(oneMinus * oneMinus, vec3f(0.05)));
  let s = sin(delta * 0.5);
  let s2 = s * s;
  return 1.0 / (1.0 + F * (1.0 - s2));
}

fn clcBragg(pitchNm: f32, ndv: f32) -> vec3f {
  let n = ${glf(CLC_N)};
  let sin2t = (1.0 - ndv * ndv) / (n * n);
  let cosT = sqrt(max(0.0, 1.0 - sin2t));
  let peak = n * pitchNm * cosT;
  let halfW = 0.5 * ${glf(CLC_DN)} * pitchNm;
  let lambda = vec3f(650.0, 550.0, 450.0);
  let x = (lambda - vec3f(peak)) / halfW;
  let x2 = x * x;
  return exp(-(x2 * x2));
}

fn clcStack(pitchNm: f32, ndv: f32, chirp: f32) -> vec3f {
  let c = clamp(chirp, 0.0, 0.35);
  return (clcBragg(pitchNm * (1.0 - c), ndv) + clcBragg(pitchNm, ndv) + clcBragg(pitchNm * (1.0 + c), ndv)) / 3.0;
}

fn flakeGlint(bump: f32, phase: f32, spark: f32, tilt: vec2f) -> f32 {
  let fnm = normalize(vec3f((bump - 0.5) * 0.70 + tilt.x * 0.35, (phase - 0.5) * 0.55 + tilt.y * 0.35, 1.0));
  return spark * pow(clamp(fnm.z, 0.0, 1.0), 40.0);
}

fn foilShade(frag: vec2f) -> vec4f {
  let uv = frag / max(u.res, vec2f(1.0));
  let tilt = u.tilt * 2.0 - vec2f(1.0);
  let map = textureSampleLevel(flakes, flakesSamp, uv, 0.0);
  let bump = map.b * 0.14;
  let N = normalize(vec3f(tilt.x * 1.45 + bump, tilt.y * 1.1, 1.0));
  let ndv = clamp(N.z, 0.05, 1.0);
  let fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  let thick = mix(${glf(FILM_THICK_MIN)}, ${glf(FILM_THICK_MAX)}, map.r);
  let film = thinFilm(thick, ndv);
  let field = 0.5 + 0.5 * sin((uv.x * 2.0 + uv.y * 0.4) * 3.141593);
  let t = mix(field, map.a, 0.22);
  let pitch = mix(${glf(CLC_PITCH_MIN)}, ${glf(CLC_PITCH_MAX)}, t);
  let chirp = ${glf(CLC_CHIRP)} * (0.25 + 0.75 * field);
  let clc = clcStack(pitch, ndv, chirp);
  let kind = step(0.34, map.b);
  let coat = mix(film, clc, kind);
  let glint = flakeGlint(map.b, map.a, map.g, tilt);
  var irid = u.foil.xyz + (u.flare.xyz - u.foil.xyz) * coat;
  irid = mix(irid, u.ink.xyz, 0.14 * mix(film.g, clc.g, kind));
  irid = mix(irid, vec3f(0.86, 0.58, 0.16), 0.28 * clc.r * kind);
  irid = mix(irid, vec3f(0.16, 0.64, 0.30), 0.26 * clc.g * kind);
  irid = mix(irid, vec3f(0.16, 0.36, 0.78), 0.30 * clc.b * kind);
  irid = mix(irid, vec3f(0.96, 0.88, 0.48), 0.32 * glint * kind);
  let grain = sin((uv.x * 38.0 - uv.y * 9.0 + tilt.x * 6.0 - u.time * 0.32) * 6.283185);
  let aniso = pow(0.5 + 0.5 * grain, 11.0);
  let sweepX = 0.28 + u.tilt.x * 0.44 + 0.10 * sin(u.time * 1.35);
  let flash = smoothstep(0.26, 0.0, abs(uv.x - sweepX));
  let clcWash = (clc.r + clc.g + clc.b) / 3.0;
  let filmWash = (film.r + film.g + film.b) / 3.0;
  let coatWash = mix(filmWash, clcWash, kind);
  var wash = 0.06 + 0.22 * flash + 0.09 * aniso + 0.20 * fres + 0.22 * glint + 0.10 * clcWash * kind;
  wash = clamp(wash * (0.60 + 0.50 * coatWash), 0.0, 0.70);
  return vec4f(irid * wash, wash);
}

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[i], 0.0, 1.0);
}

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  return foilShade(pos.xy);
}
`;

/** One-shot 256² flake map. Thickness R, spark G, bump B, phase A. */
export const FOIL_WGSL_CS = `
fn pcg(n: u32) -> u32 {
  var h = n * 747796405u + 2891336453u;
  h = ((h >> ((h >> 28u) + 4u)) ^ h) * 277803737u;
  return (h >> 22u) ^ h;
}

fn hash2(p: vec2u) -> f32 {
  return f32(pcg(p.x * 1597334677u + p.y * 3812015801u)) * (1.0 / 4294967296.0);
}

@group(0) @binding(0) var flakeOut: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn cs(@builtin(global_invocation_id) id: vec3u) {
  let dim = textureDimensions(flakeOut);
  if (id.x >= dim.x || id.y >= dim.y) { return; }
  let cell = id.xy / 6u;
  let thick = mix(0.12, 0.92, hash2(cell) * 0.55 + hash2(cell + vec2u(19u, 7u)) * 0.45);
  let flake = step(0.91, hash2(id.xy));
  let bump = hash2(id.xy + vec2u(3u, 11u));
  let phase = hash2(id.xy + vec2u(29u, 5u));
  textureStore(flakeOut, id.xy, vec4f(thick, flake, bump, phase));
}
`;

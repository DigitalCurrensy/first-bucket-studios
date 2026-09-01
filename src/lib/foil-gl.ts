/** Pack foil. WebGPU first, then WebGL2, then WebGL1. CSS hologram is the fallback. */

import { foilGpuOffered, mountFoilGpu } from "./foil-gpu.ts";
import {
  FOIL_GLSL1_FS,
  FOIL_GLSL1_VS,
  FOIL_GLSL3_FS,
  FOIL_GLSL3_VS,
  clamp01,
  hexRgb,
  reducedMotion,
  type FoilHandle,
} from "./foil-shade.ts";

export type { FoilHandle } from "./foil-shade.ts";

const GL_ATTRS: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  powerPreference: "low-power",
  failIfMajorPerformanceCaveat: true,
  desynchronized: true,
};

let probed: boolean | null = null;

export function foilGlSupported() {
  if (probed != null) return probed;
  if (typeof document === "undefined") return false;
  if (reducedMotion()) {
    probed = false;
    return false;
  }
  if (foilGpuOffered()) {
    probed = true;
    return true;
  }
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", GL_ATTRS) || canvas.getContext("webgl", GL_ATTRS);
    probed = Boolean(gl);
    if (gl && typeof gl.getExtension === "function") {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    probed = false;
  }
  return probed;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  return { prog, vs, fs };
}

function mountFoilGl(
  canvas: HTMLCanvasElement,
  foil: string,
  flare: string,
  ink: string,
  getTilt?: () => { x: number; y: number },
): FoilHandle | null {
  let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  let webgl2 = false;
  try {
    gl = canvas.getContext("webgl2", GL_ATTRS) as WebGL2RenderingContext | null;
    webgl2 = Boolean(gl);
    if (!gl) gl = canvas.getContext("webgl", GL_ATTRS);
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const linked = webgl2
    ? (link(gl, FOIL_GLSL3_VS, FOIL_GLSL3_FS) ?? link(gl, FOIL_GLSL1_VS, FOIL_GLSL1_FS))
    : link(gl, FOIL_GLSL1_VS, FOIL_GLSL1_FS);
  if (!linked) return null;
  const { prog, vs, fs } = linked;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  if (!buf) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  if (loc < 0) return null;
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_res");
  const uTilt = gl.getUniformLocation(prog, "u_tilt");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uFoil = gl.getUniformLocation(prog, "u_foil");
  const uFlare = gl.getUniformLocation(prog, "u_flare");
  const uInk = gl.getUniformLocation(prog, "u_ink");

  let tiltX = 0.5;
  let tiltY = 0.4;
  let foilRgb = hexRgb(foil);
  let flareRgb = hexRgb(flare);
  let inkRgb = hexRgb(ink);
  let raf = 0;
  let live = false;
  const quiet = reducedMotion();

  const draw = (time: number) => {
    if (!gl) return;
    if (getTilt) {
      const nextTilt = getTilt();
      tiltX = clamp01(nextTilt.x, tiltX);
      tiltY = clamp01(nextTilt.y, tiltY);
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uTilt, tiltX, tiltY);
    gl.uniform1f(uTime, quiet ? 0 : time * 0.001);
    gl.uniform3f(uFoil, foilRgb[0], foilRgb[1], foilRgb[2]);
    gl.uniform3f(uFlare, flareRgb[0], flareRgb[1], flareRgb[2]);
    gl.uniform3f(uInk, inkRgb[0], inkRgb[1], inkRgb[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const tick = (time: number) => {
    draw(time);
    if (live && !quiet) raf = window.requestAnimationFrame(tick);
  };

  const resize = () => {
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || canvas.clientWidth || 1;
    const h = parent?.clientHeight || canvas.clientHeight || 1;
    const dpr = Math.min(1.25, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const tw = Math.max(1, Math.round(w * dpr));
    const th = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== tw) canvas.width = tw;
    if (canvas.height !== th) canvas.height = th;
    if (!live) draw(0);
  };

  const onLost = (event: Event) => {
    event.preventDefault();
    live = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  };
  canvas.addEventListener("webglcontextlost", onLost, false);

  return {
    setTilt(x, y) {
      tiltX = clamp01(x, 0.5);
      tiltY = clamp01(y, 0.4);
    },
    setColors(nextFoil, nextFlare, nextInk) {
      foilRgb = hexRgb(nextFoil);
      flareRgb = hexRgb(nextFlare);
      if (nextInk) inkRgb = hexRgb(nextInk);
    },
    resize,
    start() {
      if (live) return;
      live = true;
      resize();
      if (quiet) {
        draw(0);
        return;
      }
      raf = window.requestAnimationFrame(tick);
    },
    stop() {
      live = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    },
    dispose() {
      live = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      canvas.removeEventListener("webglcontextlost", onLost, false);
      if (!gl) return;
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export async function mountFoil(
  canvas: HTMLCanvasElement,
  foil: string,
  flare: string,
  ink: string,
  getTilt?: () => { x: number; y: number },
): Promise<FoilHandle | null> {
  try {
    const gpu = await mountFoilGpu(canvas, foil, flare, ink, getTilt);
    if (gpu) return gpu;
  } catch {
    /* WebGL next. Never leave a rejected GPU probe in the way. */
  }
  return mountFoilGl(canvas, foil, flare, ink, getTilt);
}

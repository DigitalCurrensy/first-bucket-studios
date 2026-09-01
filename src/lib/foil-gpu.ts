/** WebGPU foil. Compute bakes the flake map once. Falls back in foil-gl.ts. */

import {
  FLAKE_MAP,
  FLAKE_WORKGROUP,
  FOIL_WGSL,
  FOIL_WGSL_CS,
  bakeFlakeMap,
  clamp01,
  hexRgb,
  reducedMotion,
  type FoilHandle,
} from "./foil-shade.ts";

const UNIFORM_FLOATS = 20; // 80 bytes: res, tilt, time+pads, foil, flare, ink
const GPU_STEP_MS = 900;

function gpuNav() {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { gpu?: GPU }).gpu;
}

export function foilGpuOffered() {
  return Boolean(gpuNav());
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("gpu-timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

async function shaderOk(device: GPUDevice, code: string) {
  const module = device.createShaderModule({ code });
  if (typeof module.getCompilationInfo === "function") {
    const info = await withTimeout(module.getCompilationInfo(), GPU_STEP_MS);
    if (info.messages.some((row) => row.type === "error")) return null;
  }
  return module;
}

function makeFlakes(device: GPUDevice, storage: boolean) {
  return device.createTexture({
    size: [FLAKE_MAP, FLAKE_MAP],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      (storage ? GPUTextureUsage.STORAGE_BINDING : 0),
  });
}

function uploadCpuMap(device: GPUDevice, flakes: GPUTexture) {
  const data = bakeFlakeMap();
  device.queue.writeTexture(
    { texture: flakes },
    data,
    { bytesPerRow: FLAKE_MAP * 4 },
    { width: FLAKE_MAP, height: FLAKE_MAP },
  );
}

const PIPE_BLEND = {
  color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
  alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
};

export async function mountFoilGpu(
  canvas: HTMLCanvasElement,
  foil: string,
  flare: string,
  ink: string,
  getTilt?: () => { x: number; y: number },
): Promise<FoilHandle | null> {
  const gpu = gpuNav();
  if (!gpu) return null;

  let adapter: GPUAdapter | null = null;
  try {
    adapter = await withTimeout(gpu.requestAdapter({ powerPreference: "low-power" }), GPU_STEP_MS);
  } catch {
    return null;
  }
  if (!adapter || adapter.isFallbackAdapter) return null;

  let device: GPUDevice;
  try {
    device = await withTimeout(adapter.requestDevice(), GPU_STEP_MS);
  } catch {
    return null;
  }

  const drop = () => {
    try {
      device.destroy();
    } catch {
      /* already lost */
    }
  };

  const format = gpu.getPreferredCanvasFormat();
  let vsModule: GPUShaderModule | null = null;
  try {
    vsModule = await shaderOk(device, FOIL_WGSL);
  } catch {
    drop();
    return null;
  }
  if (!vsModule) {
    drop();
    return null;
  }

  const pipeDesc = {
    layout: "auto",
    vertex: { module: vsModule, entryPoint: "vs" },
    fragment: {
      module: vsModule,
      entryPoint: "fs",
      targets: [{ format, blend: PIPE_BLEND }],
    },
    primitive: { topology: "triangle-list" },
  };

  let pipeline: GPURenderPipeline;
  try {
    pipeline = await withTimeout(
      device.createRenderPipelineAsync
        ? device.createRenderPipelineAsync(pipeDesc)
        : Promise.resolve(device.createRenderPipeline(pipeDesc)),
      GPU_STEP_MS,
    );
  } catch {
    drop();
    return null;
  }

  let flakes: GPUTexture | null = null;
  let baked = false;

  try {
    const csModule = await shaderOk(device, FOIL_WGSL_CS);
    if (csModule) {
      const compute = await withTimeout(
        device.createComputePipelineAsync
          ? device.createComputePipelineAsync({
              layout: "auto",
              compute: { module: csModule, entryPoint: "cs" },
            })
          : Promise.resolve(
              device.createComputePipeline({
                layout: "auto",
                compute: { module: csModule, entryPoint: "cs" },
              }),
            ),
        GPU_STEP_MS,
      );
      flakes = makeFlakes(device, true);
      const computeBind = device.createBindGroup({
        layout: compute.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: flakes.createView() }],
      });
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(compute);
      pass.setBindGroup(0, computeBind);
      const groups = FLAKE_MAP / FLAKE_WORKGROUP;
      pass.dispatchWorkgroups(groups, groups);
      pass.end();
      device.queue.submit([encoder.finish()]);
      baked = true;
    }
  } catch {
    flakes?.destroy();
    flakes = null;
    baked = false;
  }

  if (!baked || !flakes) {
    try {
      flakes?.destroy();
      flakes = makeFlakes(device, false);
      uploadCpuMap(device, flakes);
    } catch {
      flakes?.destroy();
      drop();
      return null;
    }
  }

  if (!flakes) {
    drop();
    return null;
  }

  let ubo: GPUBuffer;
  let sampler: GPUSampler;
  let bindGroup: GPUBindGroup;
  try {
    ubo = device.createBuffer({
      size: UNIFORM_FLOATS * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    sampler = device.createSampler({ magFilter: "linear", minFilter: "linear" });
    bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: ubo } },
        { binding: 1, resource: flakes.createView() },
        { binding: 2, resource: sampler },
      ],
    });
  } catch {
    flakes.destroy();
    drop();
    return null;
  }

  // Bind the canvas only after pipelines, the flake map, and the bind group exist.
  let context: GPUCanvasContext | null = null;
  try {
    context = canvas.getContext("webgpu");
  } catch {
    context = null;
  }
  if (!context) {
    ubo.destroy();
    flakes.destroy();
    drop();
    return null;
  }

  const configure = () => {
    context!.configure({
      device,
      format,
      alphaMode: "premultiplied",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  };
  try {
    configure();
  } catch {
    ubo.destroy();
    flakes.destroy();
    drop();
    return null;
  }

  const uniforms = new Float32Array(UNIFORM_FLOATS);
  const flakeTex = flakes;

  let tiltX = 0.5;
  let tiltY = 0.4;
  let foilRgb = hexRgb(foil);
  let flareRgb = hexRgb(flare);
  let inkRgb = hexRgb(ink);
  let raf = 0;
  let live = false;
  const quiet = reducedMotion();

  const packUniforms = (time: number) => {
    uniforms[0] = canvas.width;
    uniforms[1] = canvas.height;
    uniforms[2] = tiltX;
    uniforms[3] = tiltY;
    uniforms[4] = quiet ? 0 : time;
    uniforms[8] = foilRgb[0];
    uniforms[9] = foilRgb[1];
    uniforms[10] = foilRgb[2];
    uniforms[12] = flareRgb[0];
    uniforms[13] = flareRgb[1];
    uniforms[14] = flareRgb[2];
    uniforms[16] = inkRgb[0];
    uniforms[17] = inkRgb[1];
    uniforms[18] = inkRgb[2];
    device.queue.writeBuffer(ubo, 0, uniforms);
  };

  const draw = (stamp: number) => {
    if (getTilt) {
      const next = getTilt();
      tiltX = clamp01(next.x, tiltX);
      tiltY = clamp01(next.y, tiltY);
    }
    packUniforms(stamp * 0.001);
    let view: GPUTextureView;
    try {
      view = context!.getCurrentTexture().createView();
    } catch {
      return;
    }
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
  };

  const tick = (stamp: number) => {
    draw(stamp);
    if (live && !quiet) raf = window.requestAnimationFrame(tick);
  };

  const resize = () => {
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || canvas.clientWidth || 1;
    const h = parent?.clientHeight || canvas.clientHeight || 1;
    const dpr = Math.min(1.25, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const tw = Math.max(1, Math.round(w * dpr));
    const th = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== tw || canvas.height !== th) {
      canvas.width = tw;
      canvas.height = th;
      try {
        configure();
      } catch {
        /* keep last config */
      }
    }
    if (!live) draw(0);
  };

  void device.lost.then(() => {
    live = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  });

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
      ubo.destroy();
      flakeTex.destroy();
      device.destroy();
    },
  };
}

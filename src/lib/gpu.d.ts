/** Minimal WebGPU types. The TS DOM lib in this workspace does not ship them. */

type GPUTextureFormat = string;

interface GPU {
  requestAdapter(options?: { powerPreference?: "low-power" | "high-performance" }): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): GPUTextureFormat;
}

interface GPUAdapter {
  readonly isFallbackAdapter?: boolean;
  requestDevice(): Promise<GPUDevice>;
}

interface GPUShaderModule {
  getCompilationInfo(): Promise<{ messages: Array<{ type: string; message: string }> }>;
}
interface GPUBindGroupLayout {}
interface GPUBindGroup {}
interface GPUBuffer {
  destroy(): void;
}
interface GPUCommandBuffer {}
interface GPUTextureView {}

interface GPURenderPipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUComputePipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUTexture {
  createView(): GPUTextureView;
  destroy(): void;
}

interface GPUSampler {}

interface GPUComputePassEncoder {
  setPipeline(pipeline: GPUComputePipeline): void;
  setBindGroup(index: number, group: GPUBindGroup): void;
  dispatchWorkgroups(x: number, y?: number, z?: number): void;
  end(): void;
}

interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, group: GPUBindGroup): void;
  draw(vertexCount: number): void;
  end(): void;
}

interface GPUCommandEncoder {
  beginComputePass(): GPUComputePassEncoder;
  beginRenderPass(desc: {
    colorAttachments: Array<{
      view: GPUTextureView;
      clearValue?: { r: number; g: number; b: number; a: number };
      loadOp: "clear" | "load";
      storeOp: "store" | "discard";
    }>;
  }): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}

interface GPUQueue {
  writeBuffer(buffer: GPUBuffer, offset: number, data: BufferSource): void;
  writeTexture(
    dest: { texture: GPUTexture },
    data: Uint8Array,
    layout: { bytesPerRow: number },
    size: { width: number; height: number },
  ): void;
  submit(buffers: GPUCommandBuffer[]): void;
}

interface GPUDevice {
  readonly queue: GPUQueue;
  readonly lost: Promise<unknown>;
  createShaderModule(desc: { code: string }): GPUShaderModule;
  createRenderPipeline(desc: Record<string, unknown>): GPURenderPipeline;
  createRenderPipelineAsync?(desc: Record<string, unknown>): Promise<GPURenderPipeline>;
  createComputePipeline(desc: Record<string, unknown>): GPUComputePipeline;
  createComputePipelineAsync?(desc: Record<string, unknown>): Promise<GPUComputePipeline>;
  createBuffer(desc: { size: number; usage: number }): GPUBuffer;
  createTexture(desc: Record<string, unknown>): GPUTexture;
  createSampler(desc?: Record<string, unknown>): GPUSampler;
  createBindGroup(desc: Record<string, unknown>): GPUBindGroup;
  createCommandEncoder(): GPUCommandEncoder;
  destroy(): void;
}

interface GPUCanvasContext {
  configure(desc: {
    device: GPUDevice;
    format: GPUTextureFormat;
    alphaMode?: "opaque" | "premultiplied";
    usage?: number;
  }): void;
  getCurrentTexture(): { createView(): GPUTextureView };
}

interface GPUTextureUsage {
  RENDER_ATTACHMENT: number;
  STORAGE_BINDING: number;
  TEXTURE_BINDING: number;
  COPY_DST: number;
  COPY_SRC: number;
}
interface GPUBufferUsage {
  UNIFORM: number;
  COPY_DST: number;
}

declare const GPUTextureUsage: GPUTextureUsage;
declare const GPUBufferUsage: GPUBufferUsage;

interface Navigator {
  readonly gpu?: GPU;
}

interface HTMLCanvasElement {
  getContext(contextId: "webgpu"): GPUCanvasContext | null;
}

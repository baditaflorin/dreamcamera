import { DreamcameraError } from "../../lib/errors";
import type { DreamRenderer, FrameSettings } from "./types";
import { dreamShader } from "./shaderSource";

const styleIndex = {
  dream: 0,
  charcoal: 1,
  albumen: 2,
} as const;

export class WebGpuDreamRenderer implements DreamRenderer {
  readonly kind = "webgpu" as const;
  private width = 1;
  private height = 1;

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly device: GPUDevice,
    private readonly context: GPUCanvasContext,
    private readonly format: GPUTextureFormat,
    private readonly sampler: GPUSampler,
    private readonly uniformBuffer: GPUBuffer,
    private readonly pipeline: GPURenderPipeline,
  ) {}

  static async create(canvas: HTMLCanvasElement): Promise<WebGpuDreamRenderer> {
    if (!navigator.gpu) {
      throw new DreamcameraError("WebGPU is not available in this browser.");
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });

    if (!adapter) {
      throw new DreamcameraError("No WebGPU adapter was found.");
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");

    if (!context) {
      throw new DreamcameraError("Could not create a WebGPU canvas context.");
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format,
      alphaMode: "premultiplied",
    });

    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });
    const uniformBuffer = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const module = device.createShaderModule({
      label: "dreamcamera shader",
      code: dreamShader,
    });
    const pipeline = device.createRenderPipeline({
      label: "dreamcamera render pipeline",
      layout: "auto",
      vertex: {
        module,
        entryPoint: "vertexMain",
      },
      fragment: {
        module,
        entryPoint: "fragmentMain",
        targets: [{ format }],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    return new WebGpuDreamRenderer(
      canvas,
      device,
      context,
      format,
      sampler,
      uniformBuffer,
      pipeline,
    );
  }

  resize(width: number, height: number, dpr: number): void {
    const nextWidth = Math.max(1, Math.floor(width * dpr));
    const nextHeight = Math.max(1, Math.floor(height * dpr));

    if (nextWidth === this.width && nextHeight === this.height) {
      return;
    }

    this.width = nextWidth;
    this.height = nextHeight;
    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "premultiplied",
    });
  }

  draw(video: HTMLVideoElement, settings: FrameSettings): void {
    const uniformData = new Float32Array([
      styleIndex[settings.style],
      settings.intensity,
      settings.time,
      settings.segmentationStrength,
      this.width,
      this.height,
      video.videoWidth,
      video.videoHeight,
    ]);

    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: this.device.importExternalTexture({ source: video }),
        },
        {
          binding: 1,
          resource: this.sampler,
        },
        {
          binding: 2,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
      ],
    });

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.06, g: 0.06, b: 0.055, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  dispose(): void {
    this.uniformBuffer.destroy();
  }
}

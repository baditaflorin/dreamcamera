import { messageFromError } from "../../lib/errors";
import { CanvasDreamRenderer } from "./canvasRenderer";
import type { DreamRenderer } from "./types";
import { WebGpuDreamRenderer } from "./webgpuRenderer";

export async function createDreamRenderer(
  canvas: HTMLCanvasElement,
): Promise<DreamRenderer> {
  if (window.isSecureContext && navigator.gpu) {
    try {
      return await WebGpuDreamRenderer.create(canvas);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`WebGPU fallback: ${messageFromError(error)}`);
      }
    }
  }

  return new CanvasDreamRenderer(canvas);
}

export function featureSummary(): string {
  if (!window.isSecureContext) {
    return "HTTPS required";
  }
  return navigator.gpu ? "WebGPU available" : "Canvas fallback";
}

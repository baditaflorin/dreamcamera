import { DreamcameraError } from "../../lib/errors";
import type { TurboManifest } from "./turboManifest";

export type TurboRuntimeInfo = {
  provider: "webgpu" | "wasm";
  manifest?: TurboManifest;
  modelName?: string;
};

export async function warmTurboRuntime(): Promise<TurboRuntimeInfo> {
  const ort = await import("onnxruntime-web/webgpu");
  ort.env.wasm.wasmPaths =
    "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.25.1/dist/";
  return {
    provider: navigator.gpu ? "webgpu" : "wasm",
  };
}

export async function loadSingleOnnxStylizer(
  file: File,
): Promise<TurboRuntimeInfo> {
  const ort = await import("onnxruntime-web/webgpu");
  ort.env.wasm.wasmPaths =
    "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.25.1/dist/";
  const bytes = await file.arrayBuffer();

  try {
    await ort.InferenceSession.create(bytes, {
      executionProviders: navigator.gpu ? ["webgpu", "wasm"] : ["wasm"],
      graphOptimizationLevel: "all",
    });
  } catch (error) {
    throw new DreamcameraError(
      "The selected ONNX file could not be initialized in the browser.",
      error,
    );
  }

  return {
    provider: navigator.gpu ? "webgpu" : "wasm",
    modelName: file.name,
  };
}

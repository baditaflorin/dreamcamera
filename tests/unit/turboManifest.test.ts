import { describe, expect, it } from "vitest";
import { parseTurboManifest } from "../../src/features/onnx/turboManifest";

describe("parseTurboManifest", () => {
  it("accepts the v1 ONNX model-pack contract", () => {
    const manifest = parseTurboManifest({
      schemaVersion: 1,
      kind: "sd-turbo-img2img",
      name: "Local pack",
      input: {
        width: 256,
        height: 256,
        channels: 3,
        format: "float32-nchw",
        range: [-1, 1],
      },
      models: {
        unet: "unet/model.onnx",
        vaeDecoder: "vae_decoder/model.onnx",
      },
    });

    expect(manifest.name).toBe("Local pack");
    expect(manifest.models.unet).toBe("unet/model.onnx");
  });

  it("rejects unversioned manifests", () => {
    expect(() =>
      parseTurboManifest({
        kind: "image-stylizer",
        name: "Missing schema",
        input: {
          width: 256,
          height: 256,
          channels: 3,
          format: "float32-nchw",
          range: [-1, 1],
        },
        models: {
          stylizer: "model.onnx",
        },
      }),
    ).toThrow();
  });
});

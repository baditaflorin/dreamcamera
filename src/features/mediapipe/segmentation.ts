export type SegmenterState = {
  strength: number;
  backend: "mediapipe";
};

type VisionModule = typeof import("@mediapipe/tasks-vision");

const wasmRoot =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const selfieModel =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

export class MediaPipeSegmenter {
  private smoothedStrength = 0;

  private constructor(
    private readonly segmenter: Awaited<
      ReturnType<VisionModule["ImageSegmenter"]["createFromOptions"]>
    >,
  ) {}

  static async create(): Promise<MediaPipeSegmenter> {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(wasmRoot);
    const segmenter = await vision.ImageSegmenter.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: selfieModel,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      outputCategoryMask: true,
    });

    return new MediaPipeSegmenter(segmenter);
  }

  segment(video: HTMLVideoElement, now: number): SegmenterState {
    try {
      const result = this.segmenter.segmentForVideo(video, now);
      const mask = result.categoryMask;
      if (!mask) {
        return { strength: this.smoothedStrength, backend: "mediapipe" };
      }

      const data = mask.getAsFloat32Array();
      let foreground = 0;
      const stride = Math.max(1, Math.floor(data.length / 2048));
      let count = 0;

      for (let index = 0; index < data.length; index += stride) {
        foreground += data[index] > 0.2 ? 1 : 0;
        count += 1;
      }

      mask.close();
      const strength = count > 0 ? foreground / count : 0;
      this.smoothedStrength = this.smoothedStrength * 0.82 + strength * 0.18;
      return {
        strength: this.smoothedStrength,
        backend: "mediapipe",
      };
    } catch {
      return {
        strength: this.smoothedStrength,
        backend: "mediapipe",
      };
    }
  }

  close(): void {
    this.segmenter.close();
  }
}

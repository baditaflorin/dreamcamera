import type { DreamStyle } from "./types";

export type FrameMood = {
  luminance: number;
  motion: number;
  style: DreamStyle;
  intensity: number;
};

export class FrameAnalyzer {
  private readonly canvas = document.createElement("canvas");
  private readonly context = this.canvas.getContext("2d", {
    willReadFrequently: true,
  });
  private previous: Uint8ClampedArray | null = null;
  private last = 0;

  constructor() {
    this.canvas.width = 32;
    this.canvas.height = 18;
  }

  sample(
    video: HTMLVideoElement,
    style: DreamStyle,
    intensity: number,
    now: number,
  ): FrameMood | null {
    if (
      !this.context ||
      now - this.last < 180 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return null;
    }

    this.last = now;
    this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
    const data = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    ).data;
    let luminance = 0;
    let motion = 0;

    for (let index = 0; index < data.length; index += 4) {
      const value =
        (data[index] * 0.2126 +
          data[index + 1] * 0.7152 +
          data[index + 2] * 0.0722) /
        255;
      luminance += value;
      if (this.previous) {
        const previousValue =
          (this.previous[index] * 0.2126 +
            this.previous[index + 1] * 0.7152 +
            this.previous[index + 2] * 0.0722) /
          255;
        motion += Math.abs(value - previousValue);
      }
    }

    this.previous = new Uint8ClampedArray(data);
    const pixels = data.length / 4;

    return {
      luminance: luminance / pixels,
      motion: Math.min(1, motion / pixels / 0.18),
      style,
      intensity,
    };
  }
}

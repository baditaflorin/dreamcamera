import type { DreamRenderer, FrameSettings } from "./types";

export class CanvasDreamRenderer implements DreamRenderer {
  readonly kind = "canvas2d" as const;
  private readonly context: CanvasRenderingContext2D;
  private readonly source = document.createElement("canvas");
  private readonly sourceContext = this.source.getContext("2d", {
    willReadFrequently: true,
  });

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });
    if (!context) {
      throw new Error("Could not create a Canvas 2D renderer.");
    }
    this.context = context;
  }

  resize(width: number, height: number, dpr: number): void {
    const nextWidth = Math.max(1, Math.floor(width * dpr));
    const nextHeight = Math.max(1, Math.floor(height * dpr));

    if (this.canvas.width !== nextWidth) {
      this.canvas.width = nextWidth;
    }
    if (this.canvas.height !== nextHeight) {
      this.canvas.height = nextHeight;
    }
    this.source.width = Math.min(640, nextWidth);
    this.source.height = Math.max(
      1,
      Math.round((this.source.width / nextWidth) * nextHeight),
    );
  }

  draw(video: HTMLVideoElement, settings: FrameSettings): void {
    if (
      !this.sourceContext ||
      this.source.width === 0 ||
      this.source.height === 0
    ) {
      return;
    }

    this.sourceContext.drawImage(
      video,
      0,
      0,
      this.source.width,
      this.source.height,
    );
    const image = this.sourceContext.getImageData(
      0,
      0,
      this.source.width,
      this.source.height,
    );
    const data = image.data;

    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const gray = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      const grain =
        ((index * 17 + Math.floor(settings.time * 60) * 31) % 41) - 20;

      if (settings.style === "charcoal") {
        const mark = gray < 150 ? 28 + grain : 222 + grain;
        data[index] = mark;
        data[index + 1] = mark * 0.96;
        data[index + 2] = mark * 0.88;
      } else if (settings.style === "albumen") {
        data[index] = clamp(gray * 1.12 + grain * 0.6);
        data[index + 1] = clamp(gray * 0.9 + grain * 0.4);
        data[index + 2] = clamp(gray * 0.62 + grain * 0.25);
      } else {
        data[index] = clamp(
          red * (1 - settings.intensity * 0.16) +
            42 * settings.intensity +
            grain * 0.18,
        );
        data[index + 1] = clamp(
          green * (1 + settings.intensity * 0.08) + 22 * settings.intensity,
        );
        data[index + 2] = clamp(
          blue * (1 + settings.intensity * 0.18) + 34 * settings.intensity,
        );
      }
    }

    this.sourceContext.putImageData(image, 0, 0);
    this.context.imageSmoothingEnabled = true;
    this.context.filter =
      settings.style === "dream"
        ? `blur(${settings.intensity * 1.6}px) saturate(1.18)`
        : "none";
    this.context.drawImage(
      this.source,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
    this.context.filter = "none";
  }

  dispose(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

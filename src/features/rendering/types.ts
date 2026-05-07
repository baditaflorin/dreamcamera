import type { DreamStyle, RendererKind } from "../camera/types";

export type FrameSettings = {
  style: DreamStyle;
  intensity: number;
  time: number;
  segmentationStrength: number;
};

export type DreamRenderer = {
  readonly kind: RendererKind;
  resize: (width: number, height: number, dpr: number) => void;
  draw: (video: HTMLVideoElement, settings: FrameSettings) => void;
  dispose: () => void;
};

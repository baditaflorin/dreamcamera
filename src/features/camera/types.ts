export type DreamStyle = "dream" | "charcoal" | "albumen";

export type RendererKind = "webgpu" | "canvas2d";

export type RuntimeState = "idle" | "loading" | "ready" | "error";

export type CameraPreferences = {
  style: DreamStyle;
  intensity: number;
  ambience: boolean;
  segmentation: boolean;
};

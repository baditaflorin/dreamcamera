import type { CameraPreferences, DreamStyle } from "./types";

const key = "dreamcamera.preferences.v1";

const styles = new Set<DreamStyle>(["dream", "charcoal", "albumen"]);

export const defaultPreferences: CameraPreferences = {
  style: "dream",
  intensity: 0.72,
  ambience: false,
  segmentation: false,
};

export function loadPreferences(): CameraPreferences {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return defaultPreferences;
    }
    const parsed = JSON.parse(stored) as Partial<CameraPreferences>;
    return {
      style:
        parsed.style && styles.has(parsed.style)
          ? parsed.style
          : defaultPreferences.style,
      intensity:
        typeof parsed.intensity === "number"
          ? clamp(parsed.intensity, 0, 1)
          : defaultPreferences.intensity,
      ambience: Boolean(parsed.ambience),
      segmentation: Boolean(parsed.segmentation),
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: CameraPreferences): void {
  localStorage.setItem(key, JSON.stringify(preferences));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

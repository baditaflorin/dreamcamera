import { beforeEach, describe, expect, it } from "vitest";
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
} from "../../src/features/camera/preferences";

describe("camera preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults without stored values", () => {
    expect(loadPreferences()).toEqual(defaultPreferences);
  });

  it("persists known preferences", () => {
    savePreferences({
      style: "charcoal",
      intensity: 0.4,
      ambience: true,
      segmentation: true,
    });

    expect(loadPreferences()).toEqual({
      style: "charcoal",
      intensity: 0.4,
      ambience: true,
      segmentation: true,
    });
  });

  it("repairs invalid stored values", () => {
    localStorage.setItem(
      "dreamcamera.preferences.v1",
      JSON.stringify({
        style: "bad",
        intensity: 20,
      }),
    );

    expect(loadPreferences()).toMatchObject({
      style: "dream",
      intensity: 1,
    });
  });
});

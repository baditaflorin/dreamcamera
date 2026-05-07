# 0002 - Architecture overview and module boundaries

## Status

Accepted

## Context

Dreamcamera needs a responsive UI, a live camera loop, GPU rendering, optional segmentation, optional ONNX execution, local settings, and installable static deployment.

## Decision

Use a feature-oriented frontend:

- `features/camera`: camera permission, stream lifecycle, frame loop, and user controls.
- `features/rendering`: WebGPU renderer plus Canvas fallback renderer.
- `features/mediapipe`: lazy MediaPipe Tasks Vision segmentation adapter.
- `features/onnx`: lazy ONNX Runtime WebGPU model-pack adapter.
- `features/audio`: local Web Audio ambience.
- `features/version`: build metadata rendered in the UI.
- `components` and `app`: shared UI, error boundary, and toast plumbing.

## Consequences

Module boundaries are explicit and each expensive runtime is lazy-loaded behind user interaction. The initial bundle remains small and camera privacy stays easy to audit.

## Alternatives considered

A single large camera component was rejected because it would mix permission state, rendering, model loading, and UI concerns.

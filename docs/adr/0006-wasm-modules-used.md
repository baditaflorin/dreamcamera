# 0006 - WASM modules used

## Status

Accepted

## Context

ONNX Runtime Web and MediaPipe Tasks Vision use WASM assets and can also use WebGPU where available. GitHub Pages cannot configure arbitrary COOP/COEP response headers.

## Decision

Lazy-load WASM-backed modules after camera start:

- `onnxruntime-web` for optional ONNX/WebGPU model-pack execution.
- `@mediapipe/tasks-vision` for optional selfie segmentation.

Avoid SharedArrayBuffer-required paths in v1. The app prefers WebGPU and falls back to Canvas rendering if WebGPU is missing.

## Consequences

The app remains static-hostable. Some high-performance threading modes are not enabled on GitHub Pages until a future isolation strategy is introduced.

## Alternatives considered

A backend inference server was rejected because camera frames should remain local. A service-worker header shim was deferred because it adds complexity and is not needed for the shader-first v1 path.


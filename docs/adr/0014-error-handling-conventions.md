# 0014 - Error handling conventions

## Status

Accepted

## Context

Camera, WebGPU, MediaPipe, and ONNX APIs can fail for browser, permission, or hardware reasons.

## Decision

Return typed results or throw explicit `DreamcameraError` instances from adapters. UI code catches recoverable failures, shows a concise toast, and leaves the app in a usable fallback state.

## Consequences

Users can continue with Canvas fallback if WebGPU is unavailable. Model-loading errors do not crash the camera loop.

## Alternatives considered

Letting browser exceptions bubble to the console was rejected because failures need visible recovery paths.

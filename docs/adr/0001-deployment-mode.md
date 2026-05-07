# 0001 - Deployment mode

## Status

Accepted

## Context

Dreamcamera needs live camera access, local visual rendering, MediaPipe segmentation, WebGPU shaders, and ONNX Runtime Web. The product intent is private, immediate, and playful; sending camera frames to a server would add operational risk and weaken the privacy promise.

## Decision

Use Mode A: Pure GitHub Pages.

The app ships as static HTML, CSS, JavaScript, WASM assets, and optional model manifests. Runtime computation happens in the browser using WebGPU, Canvas fallback paths, MediaPipe Tasks Vision, Web Audio, IndexedDB or OPFS, and ONNX Runtime Web's WebGPU execution provider.

## Consequences

- Camera frames remain on-device.
- No runtime backend, Docker image, server database, or server secrets are required for v1.
- GitHub Pages cannot set arbitrary COOP/COEP headers, so SharedArrayBuffer-dependent paths are avoided unless a future service worker isolation strategy is added.
- Large AI model packs must be lazy-loaded, user-provided, or externally hosted with compatible CORS and licenses.

## Alternatives considered

- Mode B: rejected because there is no static dataset to generate.
- Mode C: rejected because no runtime API, authentication, mutation, or secret-backed workflow is required.


# Postmortem

## What was built

Dreamcamera v0.1.0 is a static GitHub Pages app with a live camera surface, WebGPU shader renderer, Canvas fallback, MediaPipe segmentation toggle, ONNX Runtime WebGPU warm/load path, local Web Audio ambience, repo and PayPal links, visible version and commit metadata, local hooks, unit tests, and Playwright smoke tests.

## Was Mode A correct?

Yes. The app did not need server auth, secrets, runtime writes, or cross-device state. Keeping camera frames in the browser is the right privacy and deployment choice for v1.

## What worked

- GitHub Pages was enough for the full public surface.
- WebGPU shaders made the core experience immediate without bundling model weights.
- Lazy MediaPipe and ONNX imports kept the initial app payload under budget.

## What did not work

- Shipping full Stable Diffusion Turbo ONNX weights in-repo is not practical for v1 because of size, browser memory pressure, CORS, and redistribution terms.
- Browser smoke testing cannot verify real camera permission or GPU hardware in a deterministic way.

## Surprises

- ONNX Runtime Web contributes a large WASM artifact even when the runtime is lazy-loaded.
- Serving GitHub Pages locally needs a small mount-path-aware static server because project pages live below `/dreamcamera/`.

## Accepted tech debt

- The ONNX path initializes model files but does not yet run a full SD Turbo image-to-image diffusion loop.
- MediaPipe segmentation currently feeds a smoothed foreground strength into the renderer rather than a full per-pixel WebGPU mask.
- The service worker is a conservative shell/runtime cache rather than a complete precache manifest.

## Next improvements

1. Add a licensed browser-ready SD Turbo pack with resumable OPFS caching.
2. Promote the MediaPipe mask into a WebGPU texture for person-aware background hallucination.
3. Add a benchmark panel for frame time, dropped frames, memory, and backend selection.

## Time spent vs estimate

Estimated: 6-8 hours for a careful v1 scaffold and static deployment.

Actual: one implementation pass in this Codex session, with the largest compromises around model-weight packaging and hardware-dependent verification.

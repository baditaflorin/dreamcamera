# Model Packs

Dreamcamera v1 includes the browser-side ONNX Runtime WebGPU loading path, but does not redistribute Stable Diffusion Turbo weights.

## Why weights are not committed

Stable Diffusion Turbo ONNX packs are large and license-sensitive. Committing them would also make the first clone and the Pages deployment heavy for everyone.

## Example manifest

`https://github.com/baditaflorin/dreamcamera/blob/main/public/models/dreamcamera-turbo.manifest.example.json`

## Current v1 behavior

- The live app can warm ONNX Runtime Web with WebGPU or WASM.
- Users can select a local `.onnx` or `.ort` file to verify browser-local initialization.
- The real-time camera experience works immediately through WebGPU shaders and Canvas fallback.
- A future release can add a complete multi-file SD Turbo image-to-image pack once the model licensing, file sizes, CORS, and browser memory budget are proven.

## Manifest versioning

Breaking changes bump `schemaVersion`. Non-breaking additions keep `schemaVersion: 1`.

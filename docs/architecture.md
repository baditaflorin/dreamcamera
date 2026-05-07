# Architecture

Dreamcamera is a Mode A GitHub Pages application. It has no runtime backend.

## Context

```mermaid
flowchart LR
  Person["Person with camera"] --> Browser["Browser"]
  Browser --> Pages["GitHub Pages\nhttps://baditaflorin.github.io/dreamcamera/"]
  Browser --> Camera["MediaDevices camera API"]
  Browser --> Storage["localStorage\nfuture IndexedDB / OPFS"]
  Browser --> PublicAssets["Public WASM/model assets"]
```

## Container

```mermaid
flowchart TB
  subgraph Pages["GitHub Pages static boundary"]
    App["React app shell"]
    Docs["Project docs and ADRs"]
    Static["Hashed assets, manifest, service worker"]
  end

  subgraph Browser["User browser"]
    CameraLoop["Camera frame loop"]
    WebGPU["WebGPU shader renderer"]
    Canvas["Canvas fallback renderer"]
    MediaPipe["MediaPipe segmentation adapter"]
    ONNX["ONNX Runtime WebGPU adapter"]
    Audio["Web Audio ambience"]
  end

  App --> CameraLoop
  CameraLoop --> WebGPU
  CameraLoop --> Canvas
  CameraLoop --> MediaPipe
  CameraLoop --> ONNX
  CameraLoop --> Audio
```

## Boundaries

- Camera frames are read from `navigator.mediaDevices.getUserMedia`.
- The main renderer prefers WebGPU and falls back to Canvas 2D.
- MediaPipe and ONNX Runtime Web are dynamically imported after user action.
- No server receives camera frames, generated frames, model inputs, or settings.
- GitHub Pages serves `docs/` from `main`.

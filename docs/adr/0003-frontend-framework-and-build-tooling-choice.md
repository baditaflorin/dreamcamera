# 0003 - Frontend framework and build tooling choice

## Status

Accepted

## Context

The app needs TypeScript strictness, ergonomic interactive UI, fast local development, and a build output that can be committed to GitHub Pages.

## Decision

Use React, TypeScript, Vite, Tailwind CSS, and lucide-react.

Vite builds into `docs/` with `base: "/dreamcamera/"`. Expensive runtime libraries such as ONNX Runtime Web and MediaPipe are imported dynamically after the user starts the app.

## Consequences

The UI remains maintainable and the build is fast. React and lucide add some initial payload, so the app keeps other dependencies out of the critical path.

## Alternatives considered

Vanilla TypeScript was rejected because the controls, errors, and state transitions are rich enough to benefit from React. Next.js was rejected because server rendering is unnecessary for GitHub Pages v1.

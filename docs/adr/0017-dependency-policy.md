# 0017 - Dependency policy

## Status

Accepted

## Context

Dreamcamera depends on fast-moving browser AI and graphics libraries.

## Decision

Use production-ready, pinned npm dependencies with clear purposes:

- React and Vite for app shell and build.
- Tailwind CSS for styling.
- lucide-react for icons.
- zod for manifest validation.
- ONNX Runtime Web for optional ONNX/WebGPU execution.
- MediaPipe Tasks Vision for optional segmentation.
- Vitest, ESLint, Prettier, and Playwright for local quality gates.

## Consequences

Dependencies are auditable and version-pinned through `package-lock.json`. `npm audit` runs as part of linting.

## Alternatives considered

Experimental or unmaintained visual AI wrappers were rejected. Custom ML runtimes were rejected because browser inference should rely on battle-tested libraries.

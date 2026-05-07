# 0013 - Testing strategy

## Status

Accepted

## Context

The critical risks are broken static builds, bad configuration, and regressions in browser feature detection or manifest validation.

## Decision

Use:

- Vitest for TypeScript logic tests.
- Playwright for a static smoke test.
- `scripts/smoke.sh` to build, serve `docs/`, and run Playwright.
- `make test`, `make lint`, `make build`, and `make smoke` as local quality gates.

## Consequences

Camera hardware and WebGPU availability are not required in CI-like local smoke runs. The smoke test verifies page load, core controls, and metadata rendering.

## Alternatives considered

Full visual regression testing was deferred because camera output is hardware-dependent.

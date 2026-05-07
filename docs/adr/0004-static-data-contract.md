# 0004 - Static data contract

## Status

Accepted

## Context

Mode A has no backend and no generated dataset. It still needs static metadata for model-pack examples and app build identity.

## Decision

Use only static JSON files in `public/` for optional contracts:

- `/models/dreamcamera-turbo.manifest.example.json`: documents the ONNX model-pack shape.
- Build metadata is compiled into the app from package version and git commit at build time.

## Consequences

There is no freshness cadence or server API. Any future breaking model-pack manifest change will bump `schemaVersion`.

## Alternatives considered

Committed model weights were rejected for v1 because Stable Diffusion Turbo ONNX assets are large and license-sensitive.


# 0007 - Data generation pipeline

## Status

Not applicable

## Context

Mode B would require an offline data-generation pipeline. Dreamcamera v1 is Mode A and has no generated dataset.

## Decision

Do not create a data pipeline in v1.

## Consequences

`make data` is omitted. Static example manifests are hand-maintained and versioned.

## Alternatives considered

Precomputing image assets was rejected because the core value is live camera transformation.


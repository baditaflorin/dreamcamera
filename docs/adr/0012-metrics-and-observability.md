# 0012 - Metrics and observability

## Status

Accepted

## Context

The default for Mode A/B is no analytics. Dreamcamera processes camera frames, so privacy expectations are high.

## Decision

Ship no analytics in v1.

Local status indicators show renderer backend, frame rate estimate, camera state, MediaPipe state, ONNX state, version, and commit.

## Consequences

There is no usage dashboard. Users get useful local observability without network beacons.

## Alternatives considered

Plausible or a custom beacon were rejected because usage insight is not necessary for v1.


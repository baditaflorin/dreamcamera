# 0008 - Go backend project layout

## Status

Not applicable

## Context

Mode A does not need a Go backend, runtime API, Docker image, or offline data generator.

## Decision

Skip Go backend scaffolding in v1.

## Consequences

No `cmd/`, `internal/`, `pkg/`, `api/`, `configs/`, or Go-specific build targets are created.

## Alternatives considered

A Go API was rejected because no secret-backed or server-side workflow is required.

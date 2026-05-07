# 0011 - Logging strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser console noise can hide real problems.

## Decision

Keep production console output minimal. User-facing errors appear in the UI through a toast and error boundary. Development-only diagnostics may use console warnings.

## Consequences

Production builds should have no routine console errors. Recoverable runtime problems are visible to users without leaking frames or private data.

## Alternatives considered

Client log shipping was rejected because v1 has no analytics or backend.

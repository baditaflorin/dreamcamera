# 0005 - Client-side storage strategy

## Status

Accepted

## Context

The app needs to remember lightweight preferences and may cache user-provided model metadata. Cross-device sync is not a v1 requirement.

## Decision

Use `localStorage` for simple UI preferences. Use IndexedDB or OPFS only for future large user-provided model packs.

## Consequences

The storage surface is small and user-removable through browser site settings. No server persistence or authentication is needed.

## Alternatives considered

Server-side persistence was rejected because it would require Mode C without adding v1 value.

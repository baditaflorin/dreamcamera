# 0015 - Deployment topology

## Status

Accepted

## Context

Mode A uses GitHub Pages only.

## Decision

Deploy only the committed `docs/` directory from `main` through GitHub Pages.

There is no `deploy/` directory, Docker Compose stack, nginx config, TLS termination layer, or Prometheus instance in v1.

## Consequences

Operations are limited to static publishing and rollback through git. GitHub provides HTTPS for the Pages URL.

## Alternatives considered

A server deployment was rejected because it would not improve the local camera experience.

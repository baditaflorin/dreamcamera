# 0009 - Configuration and secrets management

## Status

Accepted

## Context

Static frontend deployments must never contain secrets. The app still needs public links and build metadata.

## Decision

Compile only public constants into the frontend:

- GitHub repository URL.
- PayPal support URL.
- App version.
- Git commit.

The repository includes `.env.example` with non-secret optional build overrides. Real `.env*` files are gitignored.

## Consequences

The frontend has no credentials. Gitleaks runs in local hooks to catch accidental secrets before commit.

## Alternatives considered

Encrypted frontend secrets were rejected because obfuscation is not security.


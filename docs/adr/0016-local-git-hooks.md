# 0016 - Local git hooks

## Status

Accepted

## Context

The project explicitly avoids GitHub Actions. Checks must run locally before commits and pushes.

## Decision

Use plain `.githooks/` wired by `make install-hooks`.

Hooks:

- `pre-commit`: formatting checks, lint, typecheck, and gitleaks staged scan.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: tests, build, and smoke test.
- `post-merge` and `post-checkout`: dependency/install hints only.

## Consequences

Contributors opt in by running one make target. Hooks are idempotent and the same underlying commands can be run manually.

## Alternatives considered

Lefthook was rejected to keep the hook system dependency-free.

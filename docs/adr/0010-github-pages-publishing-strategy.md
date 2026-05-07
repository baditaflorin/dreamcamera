# 0010 - GitHub Pages publishing strategy

## Status

Accepted

## Context

The live URL must work from the first public push. The repository also needs durable project documentation under `docs/`.

## Decision

Publish from the `main` branch and the `/docs` folder.

Vite builds the app into `docs/` while preserving Markdown documentation and ADRs. Static app assets live under `docs/assets/`, with hashed filenames. `docs/404.html` mirrors the built app shell so client-side routes can recover on GitHub Pages.

The Vite `base` path is `/dreamcamera/`, matching:

`https://baditaflorin.github.io/dreamcamera/`

## Consequences

- The Pages output directory is committed and is not gitignored.
- Documentation and published assets coexist in `docs/`.
- Build scripts clean only generated app files, not project documentation.
- A custom domain can be added later with `docs/CNAME`.

## Alternatives considered

- `gh-pages` branch: rejected to keep source and published output visible in one branch.
- `main` root: rejected because source files and package metadata would be exposed as the Pages document root.


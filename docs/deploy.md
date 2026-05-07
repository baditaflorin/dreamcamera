# Deployment

Dreamcamera is deployed as a pure static GitHub Pages site.

Live URL:

`https://baditaflorin.github.io/dreamcamera/`

Repository:

`https://github.com/baditaflorin/dreamcamera`

## Publish

GitHub Pages is configured to serve the `docs/` directory from the `main` branch.

```sh
make build
git add docs
git commit -m "chore: publish pages build"
git push origin main
```

## Rollback

Revert the publishing commit that changed `docs/`, then push `main`.

```sh
git revert <commit>
git push origin main
```

## Custom domain

No custom domain is configured for v1. If one is added later, create `docs/CNAME`, configure DNS to point at GitHub Pages, and update ADR 0010.

# Contributing

Thanks for improving Dreamcamera.

## Local setup

```sh
npm install
make install-hooks
make dev
```

## Commit style

Use Conventional Commits:

- `feat: add camera renderer`
- `fix: handle WebGPU adapter failure`
- `docs: update deployment notes`
- `test: cover manifest validation`

## Checks

Run these before pushing:

```sh
make fmt
make lint
make test
make build
make smoke
```

Do not commit secrets, real `.env` files, private keys, or model files with unclear licenses.


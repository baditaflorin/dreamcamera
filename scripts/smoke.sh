#!/usr/bin/env bash
set -euo pipefail

npm run build

PORT="${PORT:-$(node scripts/free-port.mjs)}"
export PORT
node scripts/pages-server.mjs &
server_pid="$!"

cleanup() {
  kill "$server_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 0.2
if ! kill -0 "$server_pid" >/dev/null 2>&1; then
  wait "$server_pid"
  exit 1
fi

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${PORT}/dreamcamera/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

npm run test:e2e

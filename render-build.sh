#!/usr/bin/env bash
set -o errexit
set -o pipefail

restore_next_cache() {
  if [[ -d "${XDG_CACHE_HOME:-}/next-cache" ]]; then
    mkdir -p .next
    rsync -a "${XDG_CACHE_HOME}/next-cache/" .next/cache/ || true
  fi
}

save_next_cache() {
  if [[ -d ".next/cache" ]]; then
    mkdir -p "${XDG_CACHE_HOME}/next-cache"
    rsync -a .next/cache/ "${XDG_CACHE_HOME}/next-cache/"
  fi
}

npm ci --no-audit --no-fund

restore_next_cache
npm run build
save_next_cache


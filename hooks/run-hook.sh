#!/bin/bash
# Safely delegates to a bun-based TypeScript hook.
# Emits structured JSON even when bun is missing.

HOOK_SCRIPT="$1"; shift

if ! command -v bun >/dev/null 2>&1; then
  echo '{"systemMessage":"[standards-body-__NAME__] bun not found - cannot run TypeScript hooks"}'
  exit 0
fi

exec bun "$HOOK_SCRIPT" "$@"

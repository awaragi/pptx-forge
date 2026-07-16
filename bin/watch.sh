#!/usr/bin/env sh
# Poll a workspace with the `watch` command and trigger snapshot+open only when
# source inputs change.

ws_arg="$1"
if [ "$ws_arg" = "--help" ] || [ "$ws_arg" = "-h" ]; then
  echo "Usage: npm run watch -- <workspace>"
  exit 0
fi

if [ -z "$ws_arg" ]; then
  echo "Usage: npm run watch -- <workspace>"
  exit 1
fi

if command -v watch >/dev/null 2>&1; then
  :
else
  echo "Error: 'watch' command not found in PATH"
  exit 1
fi

if [ -d "$ws_arg" ]; then
  ws_dir="$ws_arg"
else
  ws_dir="workspaces/$ws_arg"
fi

if [ ! -d "$ws_dir" ]; then
  echo "Error: workspace not found: $ws_arg"
  exit 1
fi

ws_slug="$(basename "$ws_dir")"
state_file="$ws_dir/.watch-hash"

WS="$ws_slug" STATE="$state_file" watch -n 1 'new=$(find "workspaces/$WS/slides" -type f -name "*.js" -print 2>/dev/null | sort | xargs shasum 2>/dev/null; cat "workspaces/$WS/theme.js" "workspaces/$WS/masters.js" 2>/dev/null | shasum 2>/dev/null); hash=$(printf "%s" "$new" | shasum | awk "{print \$1}"); old=$(cat "$STATE" 2>/dev/null || true); if [ "$hash" != "$old" ]; then echo "$hash" > "$STATE"; npm run forge "$WS" -- --snapshot --open; fi'

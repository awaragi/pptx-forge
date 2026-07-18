#!/usr/bin/env sh
# Poll a workspace with the `watch` command and re-run forge with whatever
# options were passed (e.g. --snapshot, --open, --images, --preview) each
# time a watched source file changes. Nothing is forced — pass exactly the
# forge options you want applied to each triggered rebuild.

ws_arg=""
forge_args=""

for arg in "$@"; do
  case "$arg" in
    --help|-h)
      echo "Usage: npm run watch -- <workspace> [forge options]"
      echo
      echo "Options are forwarded as-is to forge on every triggered rebuild:"
      echo "  -o, --open      Open the generated file after each rebuild"
      echo "  -v, --preview   Preview the generated file in QuickLook (macOS only)"
      echo "  -t, --snapshot  Write a timestamped file each rebuild instead of overwriting"
      echo "  -i, --images    Export every slide as a PNG on each rebuild"
      echo
      echo "Examples:"
      echo "  npm run watch -- my-deck --snapshot"
      echo "  npm run watch -- my-deck --images"
      echo "  npm run watch -- my-deck --snapshot --open"
      exit 0
      ;;
    -*)
      forge_args="$forge_args $arg"
      ;;
    *)
      if [ -z "$ws_arg" ]; then
        ws_arg="$arg"
      fi
      ;;
  esac
done

if [ -z "$ws_arg" ]; then
  echo "Usage: npm run watch -- <workspace> [forge options]"
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

WS="$ws_slug" STATE="$state_file" FORGE_ARGS="$forge_args" watch -n 1 'new=$(find "workspaces/$WS/slides" -type f -name "*.js" -print 2>/dev/null | sort | xargs shasum 2>/dev/null; cat "workspaces/$WS/theme.js" "workspaces/$WS/masters.js" 2>/dev/null | shasum 2>/dev/null); hash=$(printf "%s" "$new" | shasum | awk "{print \$1}"); old=$(cat "$STATE" 2>/dev/null || true); if [ "$hash" != "$old" ]; then echo "$hash" > "$STATE"; npm run forge "$WS" -- $FORGE_ARGS; fi'

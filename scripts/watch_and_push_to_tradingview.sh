#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUSH_SCRIPT="$ROOT/scripts/push_to_tradingview.sh"
PINE_FILE="$ROOT/trading-setups/nifty_pro_decision_map_v2_indicator.pine"

poll_interval="2"
debounce_delay="0.75"
initial_push=true
push_args=(--auto --no-open)

usage() {
  cat <<'USAGE'
Usage: scripts/watch_and_push_to_tradingview.sh [options]

Fully automated macOS workflow for the main Pine script:
  1. Watches the Pine file for changes.
  2. Copies the latest file to the clipboard.
  3. Activates TradingView.
  4. Pastes, saves, and applies using scripts/push_to_tradingview.sh --auto.

Keep TradingView open. For best results, keep the Pine Editor focused, or pass
--editor-click X,Y so the watcher can click the editor before every paste.

Options:
  --file PATH                 Pine file to watch. Defaults to the main indicator.
  --interval SECONDS          Poll interval when fswatch is unavailable. Default: 2.
  --debounce SECONDS          Wait after a file event before pushing. Default: 0.75.
  --no-initial-push           Watch only; do not push once at startup.
  --open                      Open TradingView/chart URL before each push.
  --no-open                   Activate the already-running TradingView app only.
  --editor-click X,Y          Click screen coordinate before pasting.
  --open-editor-shortcut KEYS Send shortcut before paste, e.g. option+p.
  --save-shortcut KEYS        Defaults to command+s in the push helper.
  --apply-shortcut KEYS       Defaults to command+return in the push helper.
  --activate-delay SECONDS    Delay after activating TradingView.
  --post-paste-delay SECONDS  Delay after paste before save/apply.
  --skip-check                Skip scripts/check_codebase.sh before each push.
  -h, --help                  Show this help.

Examples:
  scripts/watch_and_push_to_tradingview.sh
  scripts/watch_and_push_to_tradingview.sh --editor-click 720,820
  scripts/watch_and_push_to_tradingview.sh --open-editor-shortcut option+p
USAGE
}

need_value() {
  local option="$1"
  local value="${2:-}"
  if [[ -z "$value" || "$value" == --* ]]; then
    echo "$option requires a value." >&2
    usage >&2
    exit 2
  fi
}

file_hash() {
  shasum -a 256 "$PINE_FILE" | awk '{print $1}'
}

run_push() {
  if [[ ! -x "$PUSH_SCRIPT" ]]; then
    echo "Push helper is missing or not executable: ${PUSH_SCRIPT#$ROOT/}" >&2
    exit 1
  fi

  if [[ ! -f "$PINE_FILE" ]]; then
    echo "Watched Pine file not found: $PINE_FILE" >&2
    exit 1
  fi

  echo
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pushing ${PINE_FILE#$ROOT/} to TradingView..."
  "$PUSH_SCRIPT" --file "$PINE_FILE" "${push_args[@]}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file)
      need_value "$1" "${2:-}"
      PINE_FILE="${2:-}"
      shift 2
      ;;
    --interval)
      need_value "$1" "${2:-}"
      poll_interval="${2:-}"
      shift 2
      ;;
    --debounce)
      need_value "$1" "${2:-}"
      debounce_delay="${2:-}"
      shift 2
      ;;
    --no-initial-push)
      initial_push=false
      shift
      ;;
    --open|--no-open|--skip-check)
      push_args+=("$1")
      shift
      ;;
    --editor-click|--open-editor-shortcut|--save-shortcut|--apply-shortcut|--activate-delay|--post-paste-delay)
      need_value "$1" "${2:-}"
      push_args+=("$1" "${2:-}")
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! -f "$PINE_FILE" ]]; then
  echo "Watched Pine file not found: $PINE_FILE" >&2
  exit 1
fi

if [[ "$initial_push" == true ]]; then
  run_push
fi

echo
echo "Watching ${PINE_FILE#$ROOT/} for changes. Press Ctrl+C to stop."

if command -v fswatch >/dev/null 2>&1; then
  fswatch -0 "$PINE_FILE" | while IFS= read -r -d '' _event; do
    sleep "$debounce_delay"
    run_push
  done
else
  last_hash="$(file_hash)"
  while true; do
    sleep "$poll_interval"
    current_hash="$(file_hash)"
    if [[ "$current_hash" != "$last_hash" ]]; then
      sleep "$debounce_delay"
      current_hash="$(file_hash)"
      last_hash="$current_hash"
      run_push
    fi
  done
fi

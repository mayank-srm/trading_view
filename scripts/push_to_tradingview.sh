#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_FILE="$ROOT/trading-setups/nifty_pro_decision_map_v2_indicator.pine"
DEFAULT_CHART_URL="https://www.tradingview.com/chart/"

pine_file="$DEFAULT_FILE"
chart_url="$DEFAULT_CHART_URL"
app_name="TradingView"
open_app=true
paste_into_editor=false
skip_check=false

usage() {
  cat <<'USAGE'
Usage: scripts/push_to_tradingview.sh [options]

Copies the Pine Script indicator to the clipboard and opens TradingView.
Use --paste only after the TradingView Pine Editor is open and you are ready
for the script to select the editor contents and paste from the clipboard.

Options:
  --file PATH        Pine file to copy. Defaults to the main indicator.
  --chart-url URL    TradingView chart URL to open. Defaults to /chart/.
  --app-name NAME    macOS app name. Defaults to TradingView.
  --paste            Prompt, then paste into the focused Pine Editor.
  --no-open          Copy only; do not open TradingView.
  --skip-check       Skip scripts/check_codebase.sh before copying.
  -h, --help         Show this help.

Examples:
  scripts/push_to_tradingview.sh
  scripts/push_to_tradingview.sh --paste
  scripts/push_to_tradingview.sh --chart-url "https://www.tradingview.com/chart/abc123/"
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file)
      need_value "$1" "${2:-}"
      pine_file="${2:-}"
      shift 2
      ;;
    --chart-url)
      need_value "$1" "${2:-}"
      chart_url="${2:-}"
      shift 2
      ;;
    --app-name)
      need_value "$1" "${2:-}"
      app_name="${2:-}"
      shift 2
      ;;
    --paste)
      paste_into_editor=true
      shift
      ;;
    --no-open)
      open_app=false
      shift
      ;;
    --skip-check)
      skip_check=true
      shift
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

if [[ -z "$pine_file" || ! -f "$pine_file" ]]; then
  echo "Pine file not found: $pine_file" >&2
  exit 1
fi

if ! grep -Fq -- '//@version=' "$pine_file"; then
  echo "File does not look like a Pine Script file: $pine_file" >&2
  exit 1
fi

if [[ "$skip_check" == false && -f "$ROOT/scripts/check_codebase.sh" ]]; then
  bash "$ROOT/scripts/check_codebase.sh"
fi

if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < "$pine_file"
elif command -v wl-copy >/dev/null 2>&1; then
  wl-copy < "$pine_file"
elif command -v xclip >/dev/null 2>&1; then
  xclip -selection clipboard < "$pine_file"
else
  echo "No clipboard command found. Install pbcopy, wl-copy, or xclip." >&2
  exit 1
fi

echo "Copied Pine Script to clipboard: ${pine_file#$ROOT/}"

if [[ "$open_app" == true ]]; then
  if [[ "$(uname -s)" == "Darwin" ]]; then
    if ! open -a "$app_name" "$chart_url" 2>/dev/null; then
      echo "Could not open '$app_name'; opening chart URL with the default browser."
      open "$chart_url"
    fi
  else
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "$chart_url" >/dev/null 2>&1 || true
    else
      echo "Open this URL manually: $chart_url"
    fi
  fi
fi

if [[ "$paste_into_editor" == true ]]; then
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "--paste currently supports macOS only. Clipboard copy completed." >&2
    exit 1
  fi

  cat <<'PROMPT'

TradingView is open. Before continuing:
1. Open the Pine Editor.
2. Click inside the editor text area.
3. Press Enter here to select all and paste the clipboard contents.

PROMPT
  read -r _

  osascript <<'APPLESCRIPT'
tell application "System Events"
  keystroke "a" using command down
  delay 0.2
  keystroke "v" using command down
end tell
APPLESCRIPT
  echo "Pasted into the focused Pine Editor. Save/apply it in TradingView."
else
  echo "Open Pine Editor in TradingView and paste with Cmd+V/Ctrl+V."
fi

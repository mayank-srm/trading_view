#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_FILE="$ROOT/trading-setups/nifty_pro_decision_map_v2_indicator.pine"
DEFAULT_CHART_URL="https://www.tradingview.com/chart/"

pine_file="$DEFAULT_FILE"
chart_url="$DEFAULT_CHART_URL"
app_name="TradingView"
open_app=true
open_app_set=false
paste_into_editor=false
auto_mode=false
prompt_before_paste=true
save_after_paste=false
apply_after_paste=false
skip_check=false
editor_click=""
open_editor_shortcut=""
save_shortcut="command+s"
apply_shortcut="command+return"
activate_delay="1.0"
post_paste_delay="0.5"

usage() {
  cat <<'USAGE'
Usage: scripts/push_to_tradingview.sh [options]

Copies the Pine Script indicator to the clipboard and opens or activates
TradingView. Use --auto for a no-prompt paste/save/apply flow when the
TradingView Pine Editor is already focused or can be focused by options.

Options:
  --file PATH                 Pine file to copy. Defaults to the main indicator.
  --chart-url URL             TradingView chart URL to open. Defaults to /chart/.
  --app-name NAME             macOS app name. Defaults to TradingView.
  --paste                     Prompt, then paste into the focused Pine Editor.
  --auto                      No-prompt paste, save, and apply flow.
  --open                      Open TradingView/chart URL before paste.
  --no-open                   Do not open a chart URL; activate existing app only.
  --editor-click X,Y          Click screen coordinate before pasting.
  --open-editor-shortcut KEYS Send shortcut before paste, e.g. option+p.
  --save                      Send save shortcut after paste.
  --no-save                   Do not save after paste.
  --apply                     Send apply/add-to-chart shortcut after paste.
  --no-apply                  Do not apply after paste.
  --save-shortcut KEYS        Defaults to command+s.
  --apply-shortcut KEYS       Defaults to command+return.
  --activate-delay SECONDS    Delay after activating TradingView. Default: 1.0.
  --post-paste-delay SECONDS  Delay after paste before save/apply. Default: 0.5.
  --skip-check                Skip scripts/check_codebase.sh before copying.
  -h, --help                  Show this help.

Examples:
  scripts/push_to_tradingview.sh
  scripts/push_to_tradingview.sh --paste
  scripts/push_to_tradingview.sh --auto
  scripts/push_to_tradingview.sh --auto --open
  scripts/push_to_tradingview.sh --auto --editor-click 720,820
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

validate_screen_point() {
  local point="$1"
  local x="${point%,*}"
  local y="${point#*,}"
  if [[ -z "$x" || -z "$y" || "$x" == "$point" || ! "$x" =~ ^[0-9]+$ || ! "$y" =~ ^[0-9]+$ ]]; then
    echo "--editor-click must be in X,Y screen-coordinate format." >&2
    exit 2
  fi
}

send_shortcut() {
  local shortcut="$1"
  [[ -z "$shortcut" || "$shortcut" == "none" ]] && return 0

  local normalized="${shortcut// /}"
  local IFS="+"
  local -a parts
  read -r -a parts <<< "$normalized"
  local key="${parts[$((${#parts[@]} - 1))]}"
  local key_lc
  key_lc="$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')"

  local modifiers=""
  local separator=""
  local i part part_lc
  for ((i = 0; i < ${#parts[@]} - 1; i++)); do
    part="${parts[$i]}"
    part_lc="$(printf '%s' "$part" | tr '[:upper:]' '[:lower:]')"
    case "$part_lc" in
      command|cmd|meta)
        modifiers="${modifiers}${separator}command down"
        ;;
      option|alt)
        modifiers="${modifiers}${separator}option down"
        ;;
      control|ctrl)
        modifiers="${modifiers}${separator}control down"
        ;;
      shift)
        modifiers="${modifiers}${separator}shift down"
        ;;
      *)
        echo "Unsupported shortcut modifier '$part' in '$shortcut'." >&2
        exit 2
        ;;
    esac
    separator=", "
  done

  local using_clause=""
  if [[ -n "$modifiers" ]]; then
    using_clause=" using {$modifiers}"
  fi

  case "$key_lc" in
    return|enter)
      osascript <<APPLESCRIPT
tell application "System Events"
  key code 36$using_clause
end tell
APPLESCRIPT
      ;;
    tab)
      osascript <<APPLESCRIPT
tell application "System Events"
  key code 48$using_clause
end tell
APPLESCRIPT
      ;;
    escape|esc)
      osascript <<APPLESCRIPT
tell application "System Events"
  key code 53$using_clause
end tell
APPLESCRIPT
      ;;
    space)
      osascript <<APPLESCRIPT
tell application "System Events"
  keystroke " "$using_clause
end tell
APPLESCRIPT
      ;;
    ?)
      osascript <<APPLESCRIPT
tell application "System Events"
  keystroke "$key"$using_clause
end tell
APPLESCRIPT
      ;;
    *)
      echo "Unsupported shortcut key '$key' in '$shortcut'. Use a single character, return, tab, escape, or space." >&2
      exit 2
      ;;
  esac
}

click_screen_point() {
  local point="$1"
  validate_screen_point "$point"
  local x="${point%,*}"
  local y="${point#*,}"

  if command -v cliclick >/dev/null 2>&1; then
    cliclick "c:${x},${y}"
  else
    osascript <<APPLESCRIPT
tell application "System Events"
  click at {$x, $y}
end tell
APPLESCRIPT
  fi
}

activate_tradingview() {
  osascript <<APPLESCRIPT
tell application "$app_name"
  activate
end tell
APPLESCRIPT
  sleep "$activate_delay"
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
    --auto)
      auto_mode=true
      paste_into_editor=true
      prompt_before_paste=false
      save_after_paste=true
      apply_after_paste=true
      if [[ "$open_app_set" == false ]]; then
        open_app=false
      fi
      shift
      ;;
    --open)
      open_app=true
      open_app_set=true
      shift
      ;;
    --no-open)
      open_app=false
      open_app_set=true
      shift
      ;;
    --editor-click)
      need_value "$1" "${2:-}"
      editor_click="${2:-}"
      shift 2
      ;;
    --open-editor-shortcut)
      need_value "$1" "${2:-}"
      open_editor_shortcut="${2:-}"
      shift 2
      ;;
    --save)
      save_after_paste=true
      shift
      ;;
    --no-save)
      save_after_paste=false
      shift
      ;;
    --apply)
      apply_after_paste=true
      shift
      ;;
    --no-apply)
      apply_after_paste=false
      shift
      ;;
    --save-shortcut)
      need_value "$1" "${2:-}"
      save_shortcut="${2:-}"
      shift 2
      ;;
    --apply-shortcut)
      need_value "$1" "${2:-}"
      apply_shortcut="${2:-}"
      shift 2
      ;;
    --activate-delay)
      need_value "$1" "${2:-}"
      activate_delay="${2:-}"
      shift 2
      ;;
    --post-paste-delay)
      need_value "$1" "${2:-}"
      post_paste_delay="${2:-}"
      shift 2
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

if [[ -n "$editor_click" ]]; then
  validate_screen_point "$editor_click"
fi

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

  activate_tradingview

  if [[ -n "$open_editor_shortcut" ]]; then
    send_shortcut "$open_editor_shortcut"
    sleep "$post_paste_delay"
  fi

  if [[ -n "$editor_click" ]]; then
    click_screen_point "$editor_click"
    sleep "$post_paste_delay"
  fi

  if [[ "$prompt_before_paste" == true ]]; then
    cat <<'PROMPT'

TradingView is open. Before continuing:
1. Open the Pine Editor.
2. Click inside the editor text area.
3. Press Enter here to select all and paste the clipboard contents.

PROMPT
    read -r _
  fi

  send_shortcut "command+a"
  sleep 0.2
  send_shortcut "command+v"
  sleep "$post_paste_delay"

  if [[ "$save_after_paste" == true ]]; then
    send_shortcut "$save_shortcut"
    sleep "$post_paste_delay"
  fi

  if [[ "$apply_after_paste" == true ]]; then
    send_shortcut "$apply_shortcut"
    sleep "$post_paste_delay"
  fi

  if [[ "$auto_mode" == true ]]; then
    echo "Automated TradingView paste flow completed. If TradingView asked to confirm, approve it in the app."
  else
    echo "Pasted into the focused Pine Editor. Save/apply it in TradingView."
  fi
else
  echo "Open Pine Editor in TradingView and paste with Cmd+V/Ctrl+V."
fi

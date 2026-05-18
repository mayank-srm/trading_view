#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDICATOR="$ROOT/trading-setups/nifty_pro_decision_map_v2_indicator.pine"
IMAGE="$ROOT/trading-setups/nifty_decision_map.png"
README="$ROOT/README.md"
TRADINGVIEW_PUSH="$ROOT/scripts/push_to_tradingview.sh"
TRADINGVIEW_WATCH="$ROOT/scripts/watch_and_push_to_tradingview.sh"

require_literal() {
  local file="$1"
  local literal="$2"
  if ! grep -Fq -- "$literal" "$file"; then
    echo "Missing expected text in ${file#$ROOT/}: $literal" >&2
    exit 1
  fi
}

reject_literal() {
  local file="$1"
  local literal="$2"
  if grep -Fq -- "$literal" "$file"; then
    echo "Unexpected text in ${file#$ROOT/}: $literal" >&2
    exit 1
  fi
}

reject_line_contains() {
  local file="$1"
  local line_prefix="$2"
  local forbidden="$3"
  if grep -F "$line_prefix" "$file" | grep -Fq "$forbidden"; then
    echo "Unexpected text on ${line_prefix} line in ${file#$ROOT/}: $forbidden" >&2
    exit 1
  fi
}

setup_file_list="$(find "$ROOT/trading-setups" -maxdepth 1 -type f | sort)"
if [[ ! -f "$IMAGE" ]]; then
  echo "Missing expected image asset: ${IMAGE#$ROOT/}" >&2
  exit 1
fi

while IFS= read -r setup_file; do
  [[ -z "$setup_file" ]] && continue
  case "$setup_file" in
    "$INDICATOR"|*.png|*.jpg|*.jpeg|*.webp) ;;
    *)
      echo "Unexpected non-image asset in trading-setups: ${setup_file#$ROOT/}" >&2
      exit 1
      ;;
  esac
done <<< "$setup_file_list"

pine_list="$(find "$ROOT/trading-setups" -maxdepth 1 -type f -name '*.pine' | sort)"
pine_count="$(printf '%s\n' "$pine_list" | sed '/^$/d' | wc -l | tr -d ' ')"
if [[ "$pine_count" != "1" || "$pine_list" != "$INDICATOR" ]]; then
  echo "Expected exactly one Pine script: trading-setups/nifty_pro_decision_map_v2_indicator.pine" >&2
  printf 'Found:\n' >&2
  printf '%s\n' "$pine_list" | sed "s#^$ROOT/#  #" >&2
  exit 1
fi

require_literal "$INDICATOR" 'sessionBlock = not inCashSession'
require_literal "$INDICATOR" 'noTradeOverride = sessionBlock or eventMode'
require_literal "$INDICATOR" 'riskText = f_reasons(vwapExtended, "Extended"'
require_literal "$INDICATOR" 'hardBlockText = f_reasons(sessionBlock or eventMode or newsBlock'
require_literal "$INDICATOR" 'callSessionTarget = not newCashSession ? sessionHigh[1] : na'
require_literal "$INDICATOR" 'putSessionTarget = not newCashSession ? sessionLow[1] : na'
require_literal "$INDICATOR" 'callReadyAlert = stateChanged and state == "CALL READY"'
require_literal "$INDICATOR" 'putReadyAlert = stateChanged and state == "PUT READY"'
require_literal "$INDICATOR" 'callReadyTransition = showTransitionMarkers and callReadyAlert'
require_literal "$INDICATOR" 'putReadyTransition = showTransitionMarkers and putReadyAlert'
require_literal "$INDICATOR" 'alertcondition(callReadyAlert, "NIFTY v2.3 CALL READY"'
require_literal "$INDICATOR" 'alertcondition(putReadyAlert, "NIFTY v2.3 PUT READY"'
reject_literal "$INDICATOR" 'f_rr_points'
reject_literal "$INDICATOR" 'vwapDistanceAtr'
reject_literal "$INDICATOR" 'emaSpreadAtr'
reject_literal "$INDICATOR" 'adxPulse'
reject_literal "$INDICATOR" 'atrRatio'
reject_literal "$INDICATOR" 'conflict ='
reject_line_contains "$INDICATOR" 'noTradeOverride =' 'vwapExtended'
reject_line_contains "$INDICATOR" 'noTradeOverride =' 'vixSpikeRisk'
reject_line_contains "$INDICATOR" 'noTradeOverride =' 'vixLowRisk'
reject_line_contains "$INDICATOR" 'blockText =' 'vwapExtended'
reject_line_contains "$INDICATOR" 'blockText =' 'volumeUsable and not volumeSpike'

require_literal "$README" 'trading-setups/nifty_pro_decision_map_v2_indicator.pine'
require_literal "$README" 'trading-setups/nifty_decision_map.png'
require_literal "$README" 'scripts/push_to_tradingview.sh'
require_literal "$README" 'scripts/push_to_tradingview.sh --auto'
require_literal "$README" 'scripts/watch_and_push_to_tradingview.sh'
require_literal "$README" 'static historical level-map reference'
require_literal "$README" 'not automatic `NO TRADE` blockers'
require_literal "$TRADINGVIEW_PUSH" 'pbcopy'
require_literal "$TRADINGVIEW_PUSH" '--paste'
require_literal "$TRADINGVIEW_PUSH" '--auto'
require_literal "$TRADINGVIEW_PUSH" '--editor-click'
require_literal "$TRADINGVIEW_PUSH" 'send_shortcut'
require_literal "$TRADINGVIEW_PUSH" 'Pine Editor'
if [[ ! -x "$TRADINGVIEW_PUSH" ]]; then
  echo "TradingView push helper must be executable: ${TRADINGVIEW_PUSH#$ROOT/}" >&2
  exit 1
fi
require_literal "$TRADINGVIEW_WATCH" 'scripts/push_to_tradingview.sh --auto'
require_literal "$TRADINGVIEW_WATCH" 'fswatch'
require_literal "$TRADINGVIEW_WATCH" '--editor-click'
if [[ ! -x "$TRADINGVIEW_WATCH" ]]; then
  echo "TradingView watch helper must be executable: ${TRADINGVIEW_WATCH#$ROOT/}" >&2
  exit 1
fi
readme_setup_refs="$(grep -o 'trading-setups/[^`[:space:])]*' "$README" | sort -u || true)"
while IFS= read -r readme_ref; do
  [[ -z "$readme_ref" ]] && continue
  readme_ref_file="$ROOT/$readme_ref"
  case "$readme_ref_file" in
    "$INDICATOR"|*.png|*.jpg|*.jpeg|*.webp) ;;
    *)
      echo "README references an unsupported trading-setups file: $readme_ref" >&2
      exit 1
      ;;
  esac
  if [[ ! -f "$readme_ref_file" ]]; then
    echo "README references a missing file: $readme_ref" >&2
    exit 1
  fi
done <<< "$readme_setup_refs"

echo "Codebase checks passed."

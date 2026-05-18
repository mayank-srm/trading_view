#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDICATOR="$ROOT/trading-setups/nifty_pro_decision_map_v2_indicator.pine"
README="$ROOT/README.md"

require_literal() {
  local file="$1"
  local literal="$2"
  if ! grep -Fq "$literal" "$file"; then
    echo "Missing expected text in ${file#$ROOT/}: $literal" >&2
    exit 1
  fi
}

reject_literal() {
  local file="$1"
  local literal="$2"
  if grep -Fq "$literal" "$file"; then
    echo "Unexpected text in ${file#$ROOT/}: $literal" >&2
    exit 1
  fi
}

setup_file_list="$(find "$ROOT/trading-setups" -maxdepth 1 -type f | sort)"
setup_file_count="$(printf '%s\n' "$setup_file_list" | sed '/^$/d' | wc -l | tr -d ' ')"
if [[ "$setup_file_count" != "1" || "$setup_file_list" != "$INDICATOR" ]]; then
  echo "Expected trading-setups to contain only: trading-setups/nifty_pro_decision_map_v2_indicator.pine" >&2
  printf 'Found:\n' >&2
  printf '%s\n' "$setup_file_list" | sed "s#^$ROOT/#  #" >&2
  exit 1
fi

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

require_literal "$README" 'trading-setups/nifty_pro_decision_map_v2_indicator.pine'
readme_setup_refs="$(grep -o 'trading-setups/[^`[:space:])]*' "$README" | sort -u || true)"
if [[ "$readme_setup_refs" != "trading-setups/nifty_pro_decision_map_v2_indicator.pine" ]]; then
  echo "README should reference only the kept TradingView script." >&2
  printf 'Found README trading-setups references:\n' >&2
  printf '%s\n' "$readme_setup_refs" | sed 's/^/  /' >&2
  exit 1
fi

echo "Codebase checks passed."

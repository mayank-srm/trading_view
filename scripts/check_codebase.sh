#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDICATOR="$ROOT/trading-setups/nifty_pro_decision_map_v2_indicator.pine"
MINIMAL="$ROOT/trading-setups/nifty_best_setup_minimal.pine"
STRATEGY="$ROOT/trading-setups/nifty_pro_decision_map_v2_strategy.pine"
BEST_CALL="$ROOT/trading-setups/nifty_best_call_setup.pine"

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

for file in "$INDICATOR" "$MINIMAL"; do
  require_literal "$file" 'sessionBlock = not inCashSession'
  require_literal "$file" 'noTradeOverride = sessionBlock or eventMode'
  require_literal "$file" 'callReadyAlert = stateChanged and state == "CALL READY"'
  require_literal "$file" 'putReadyAlert = stateChanged and state == "PUT READY"'
  require_literal "$file" 'callReadyTransition = showTransitionMarkers and callReadyAlert'
  require_literal "$file" 'putReadyTransition = showTransitionMarkers and putReadyAlert'
  require_literal "$file" 'alertcondition(callReadyAlert, "NIFTY v2.3 CALL READY"'
  require_literal "$file" 'alertcondition(putReadyAlert, "NIFTY v2.3 PUT READY"'
  reject_literal "$file" 'f_rr_points'
  reject_literal "$file" 'vwapDistanceAtr'
  reject_literal "$file" 'emaSpreadAtr'
  reject_literal "$file" 'adxPulse'
  reject_literal "$file" 'atrRatio'
  reject_literal "$file" 'conflict ='
done

require_literal "$STRATEGY" 'strongAdx = input.float(25.0, "Strong ADX"'
require_literal "$STRATEGY" 'sessionBlock = not inCashSession'
require_literal "$STRATEGY" 'noTradeOverride = sessionBlock or eventMode'
require_literal "$STRATEGY" 'adxStrength = f_clamp((adx - adxHardMin) / math.max(strongAdx - adxHardMin, 1.0), 0.0, 1.0)'
reject_literal "$STRATEGY" 'math.max(25.0 - adxHardMin, 1.0)'
reject_literal "$STRATEGY" 'f_rr_points'
reject_literal "$STRATEGY" 'vwapDistanceAtr'
reject_literal "$STRATEGY" 'emaSpreadAtr'
reject_literal "$STRATEGY" 'adxPulse'
reject_literal "$STRATEGY" 'atrRatio'

require_literal "$BEST_CALL" 'earlyCallAlert = confirmed and earlyCall and not earlyCall[1]'
require_literal "$BEST_CALL" 'strongCallAlert = confirmed and callConfirm and not callConfirm[1]'
require_literal "$BEST_CALL" 'putBreakAlert = confirmed and putBreak and not putBreak[1]'
require_literal "$BEST_CALL" 'rejectCallAlert = confirmed and rejectCallZone and not rejectCallZone[1]'
require_literal "$BEST_CALL" 'alertcondition(earlyCallAlert, "NIFTY early CALL"'
require_literal "$BEST_CALL" 'alertcondition(strongCallAlert, "NIFTY strong CALL"'
require_literal "$BEST_CALL" 'alertcondition(putBreakAlert, "NIFTY PUT breakdown"'
require_literal "$BEST_CALL" 'alertcondition(rejectCallAlert, "NIFTY rejection PUT scalp"'

echo "Codebase checks passed."

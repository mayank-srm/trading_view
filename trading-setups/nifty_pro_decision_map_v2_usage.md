# NIFTY Pro Decision Map v2.3

This pack is a decision-support setup for NIFTY intraday trading. It is not a trade automation system and it is not financial advice.

## Files

- `nifty_pro_decision_map_v2_indicator.pine`: main chart dashboard and alerts.
- `nifty_pro_decision_map_v2_strategy.pine`: Strategy Tester version using the same confirmed CALL/PUT logic.
- `nifty_best_setup_minimal.pine`: older chart-workflow file. Only copy v2 into it after the v2 indicator compiles.

## Dashboard States

- `CALL READY`: bullish bias, trend, value, volume/volatility, key level, and reward/risk are aligned.
- `PUT READY`: bearish bias, trend, value, volume/volatility, key level, and reward/risk are aligned.
- `WAIT`: mixed or incomplete conditions. This should be the most common state.
- `NO TRADE`: hard risk block. It overrides every CALL/PUT condition.

## Trader Dashboard

The dashboard separates market quality from directional edge:

- `CHECK`: one-place final reading. It compresses the state, active side, RR, or main block into the first dashboard row.
- `MARKET`: `Tradable`, `Risky`, or `Poor`.
- `EDGE`: `CALL`, `PUT`, or `None`.
- `NEWS`: manual news/event impact from the slider. Default display is `0 Neutral idle`, so the row is visible even before you assign impact.
- `BLOCK`: the top risk blockers, capped at three reasons.
- `CALL` / `PUT`: only the locked active side shows score and RR. Inactive sides show `Blocked` or `Inactive`, so a high RR cannot look tradable without directional edge.

## Default Logic

- VWAP is the main intraday value line.
- EMA 9/21 tracks short momentum.
- EMA 99/200 tracks higher intraday trend.
- ADX/DMI gates trend strength and direction.
- ATR controls stop, targets, dead-volatility checks, and no-chase distance from VWAP.
- Volume spike defaults to chart volume, with optional external volume source.
- India VIX is requested from the configurable VIX symbol when TradingView data is available.
- POC, VAH, VAL, Call OI wall, Put OI wall, and Max Pain are manual v2 inputs.
- News is manual in v2.3. Pine can request market and economic/security data, but it cannot automatically read arbitrary live news headlines from websites inside the script.

## One-Place Trading Check

All fast manual context inputs are grouped under `One-place trading check` in the indicator settings:

- Manual POC
- Manual VAH
- Manual VAL
- Major Call OI resistance
- Major Put OI support
- Max Pain
- OI wall near distance
- Event mode
- Expiry day mode
- News impact slider
- News bias
- News risk/block thresholds

In TradingView, right-click the indicator, open settings, and update this one group before or during the session. The dashboard `CHECK` row is the matching one-place readout on the chart.

## News Impact Slider

Use the `News impact` settings when a headline, RBI/Fed event, election update, budget item, war/geopolitical event, large global index move, or important macro release is actively affecting NIFTY.

- `Use news impact slider`: turns the module on. It is enabled by default with impact `0`, which means visible but not affecting signals.
- `News impact 0-100`: trader-assigned severity.
- `News bias`: `Neutral`, `Bullish`, or `Bearish`.
- `Risky above impact`: default `40`; dashboard moves toward risky conditions.
- `NO TRADE above impact`: default `70`; hard blocks fresh trades.
- `Max news edge points`: default `5`; small bias adjustment only, never a standalone signal.

Suggested use:

- `0-20`: ignore or very low impact.
- `20-39`: show as watch only.
- `40-69`: risky market; bullish news can support CALL edge and block PUTs, bearish news can support PUT edge and block CALLs.
- `70-100`: headline risk is too high; system shows `NO TRADE`.

## Score And Edge Behavior

Scores now combine `Market Quality` and side-specific `Directional Edge`. Market quality can help both sides, but only a side with enough score separation can become active.

Default edge gap is `20`, and each side must also have at least `35` side-edge points before it can become active. If CALL and PUT are close, the dashboard shows `EDGE: None`; this means no directional edge, not a slightly better CALL or PUT. A score below `60` is below watch level and hides RR.

The hard state gates still control entries. `CALL READY` or `PUT READY` requires candle-close confirmation, active edge, score >= `80`, score gap >= `20`, key level behavior, volume/volatility, reward/risk, and no-wall checks.

## Manual Inputs To Update

Update these before the trading session or when option-chain structure changes:

- Manual POC
- Manual VAH
- Manual VAL
- Major Call OI resistance
- Major Put OI support
- Max Pain
- Event mode
- Expiry day mode
- News impact slider
- News bias

Use `0` to disable any manual level.

## Volume Source

Default volume source is the chart. If chart volume is missing or unreliable, set `External volume source` to a liquid related symbol, such as the active NIFTY futures symbol available in your TradingView data plan.

If volume is unavailable, the dashboard shows `VOLUME: N/A`. The script does not automatically mark every trade invalid only because volume is missing, but lack of volume confirmation lowers the score.

## Alerts

Use the indicator script for alerts:

- `NIFTY v2.3 CALL READY`
- `NIFTY v2.3 PUT READY`
- `NIFTY v2.3 NO TRADE`
- `NIFTY v2.3 State changed`

Markers only appear when the state transitions into `CALL READY` or `PUT READY`, not on every qualifying candle.

## Strategy Testing

Use the strategy script on standard candles only. Avoid final validation on Heikin Ashi, Renko, Range, Kagi, Line Break, or other synthetic chart types.

The strategy defaults are intentionally conservative:

- `calc_on_every_tick = false`
- `process_orders_on_close = false`
- no pyramiding
- next-bar fills
- commission default: `0.03%`
- slippage default: `2 ticks`

TradingView exposes commission, slippage, sizing, and order processing settings in the Strategy Properties panel. Adjust those before trusting any result.

## Recommended Workflow

1. Add the indicator first and verify the chart is readable.
2. Set manual POC/VAH/VAL and OI walls.
3. Watch whether `WAIT` and `NO TRADE` appear during chop, open noise, late session, and event windows.
4. Only then test the strategy on 5-minute and 15-minute NIFTY charts.
5. Treat the Strategy Tester as a baseline filter, not a guarantee of live option performance.

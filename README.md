# NIFTY Pro Decision Map

![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Pine Script](https://img.shields.io/badge/Pine%20Script-v6-blue.svg)
![TradingView](https://img.shields.io/badge/platform-TradingView-black.svg)

Open-source TradingView Pine Script indicator for NIFTY intraday decision support.

This repository intentionally keeps one primary script: the v2.3 NIFTY Pro Decision Map indicator. It also keeps the chart image asset for quick visual context.

> This project is for education and decision support only. It is not financial advice, a trade recommendation service, or an automated trading system.

## Preview

![NIFTY decision map](trading-setups/nifty_decision_map.png)

This is a static historical level-map reference for visual context, not live market levels and not a screenshot of the v2.3 dashboard.

## Included Files

| File | Purpose |
| --- | --- |
| `trading-setups/nifty_pro_decision_map_v2_indicator.pine` | Main TradingView indicator with dashboard states, alerts, risk blocks, and manual market context inputs. |
| `trading-setups/nifty_decision_map.png` | Visual decision-map reference image. |

## Why This One

- It is the most complete indicator in the project.
- It includes the dashboard, alerts, and risk-state logic in one place.
- It avoids keeping older setup-specific scripts that can confuse users.
- It keeps image context without keeping duplicate scripts.
- It is decision support only and does not place trades.

## Core Ideas

- Separate market quality from directional edge.
- Prefer confirmed candle-close signals over intrabar noise.
- Use VWAP, EMA, ADX/DMI, ATR, volume, and manual option-chain levels together.
- Treat `WAIT` and `NO TRADE` as first-class states, not failures.
- Treat VWAP extension, VIX risk, and weak volume as risk warnings and score penalties, not automatic `NO TRADE` blockers.
- Keep news and event risk manual so the trader stays responsible for context.

## How To Use

1. Open TradingView and create a new Pine Script.
2. Copy `trading-setups/nifty_pro_decision_map_v2_indicator.pine` into the Pine Editor.
3. Save the script and add it to a NIFTY chart.
4. Update the manual inputs under `One-place trading check` before or during the session.
5. Use the dashboard state as a filter, not as a blind entry signal.

Recommended starting point:

```text
trading-setups/nifty_pro_decision_map_v2_indicator.pine
```

## Alerts

The indicator includes alert conditions for:

- `NIFTY v2.3 CALL READY`
- `NIFTY v2.3 PUT READY`
- `NIFTY v2.3 NO TRADE`
- `NIFTY v2.3 State changed`

Markers appear when the state transitions into a ready state, not on every qualifying candle.

## Manual Inputs

Update these before the session or when market structure changes:

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

## Risk Notice

Trading index options and intraday setups can involve rapid losses. The indicator is a filter and dashboard, not a prediction engine or execution system.

Use this repository as a study and decision-support tool. Always apply your own risk management, position sizing, and independent judgment.

## Contributing

Contributions are welcome. Good pull requests usually include:

- A clear explanation of the market behavior or script issue being improved.
- Pine Script changes that avoid repainting unless explicitly documented.
- Updated documentation when inputs, states, alerts, or defaults change.
- A screenshot or chart image when the visual dashboard changes.

## License

Released under the [MIT License](LICENSE).

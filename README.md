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

## Install In 60 Seconds

This TradingView tool is easiest to install manually. You do not need to install Node, Python, or any developer tools.

1. Open [`trading-setups/nifty_pro_decision_map_v2_indicator.pine`](trading-setups/nifty_pro_decision_map_v2_indicator.pine).
2. Click **Raw** on GitHub.
3. Select all and copy the script.
4. Open **TradingView**.
5. Open your **NIFTY** chart.
6. Open **Pine Editor**.
7. Delete any old editor text and paste the copied script.
8. Click **Save**.
9. Name it `NIFTY Trade Compass`.
10. Click **Add to chart**.

That is it. The dashboard should appear on the chart.

## Easiest Updates

When this repository gets a new version, repeat the same copy-paste steps:

1. Open the Pine file from this repo.
2. Copy the latest script.
3. Paste it into the same TradingView Pine Editor script.
4. Click **Save**.
5. Click **Update on chart**.

TradingView does not provide an official public API for fully publishing or updating Pine scripts from GitHub. Final save, update, and publish confirmations still happen inside TradingView.

## One-Command Mac Helper

If you are on macOS and already use Terminal, this repo includes helper scripts.

First-time setup:

```bash
git clone https://github.com/appuo-in/ChartIQ.git
cd ChartIQ
scripts/push_to_tradingview.sh --paste
```

Fast update when TradingView is already open and Pine Editor is focused:

```bash
scripts/push_to_tradingview.sh --auto
```

Auto-sync while editing locally:

```bash
scripts/watch_and_push_to_tradingview.sh
```

If macOS asks for Accessibility permission, allow it for your terminal app. The helper needs that permission to paste, save, and apply inside TradingView.

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

## How To Use After Install

1. Open the indicator settings in TradingView.
2. Update the manual inputs under `One-place trading check` before or during the session.
3. Use the dashboard state as a filter, not as a blind entry signal.

Recommended starting point:

```text
trading-setups/nifty_pro_decision_map_v2_indicator.pine
```

## Advanced Push To TradingView

Use the helper script to copy the latest Pine file and open TradingView:

```bash
scripts/push_to_tradingview.sh
```

To paste into the app after you have opened and focused the Pine Editor:

```bash
scripts/push_to_tradingview.sh --paste
```

For the no-prompt macOS flow when TradingView is already open and the Pine Editor is focused:

```bash
scripts/push_to_tradingview.sh --auto
```

Use `--auto --open` if you also want the script to open the configured chart URL before pasting.

If the Pine Editor is not already focused, pass a screen coordinate to click before pasting:

```bash
scripts/push_to_tradingview.sh --auto --editor-click 720,820
```

By default, `--auto` pastes, sends `command+s`, then sends `command+return`. Override those if your TradingView shortcuts differ:

```bash
scripts/push_to_tradingview.sh --auto --save-shortcut command+s --apply-shortcut command+return
```

For a complete automated loop while you edit locally, keep TradingView open and run the watcher:

```bash
scripts/watch_and_push_to_tradingview.sh
```

It pushes once immediately, then pushes again every time the Pine file changes. If the Pine Editor is not already focused, give the watcher a click target or editor shortcut:

```bash
scripts/watch_and_push_to_tradingview.sh --editor-click 720,820
scripts/watch_and_push_to_tradingview.sh --open-editor-shortcut option+p
```

The script cannot bypass TradingView confirmation dialogs. If the app asks to save, apply, or replace a script, approve it in TradingView.

On macOS, `--paste` and `--auto` may require Accessibility permission for your terminal app because they use AppleScript keystrokes.

## Instagram Reel Video

The repository includes a Remotion project for a 30-second 9:16 Instagram Reel/Story promotional video for **NIFTY Trade Compass**, the end-user-facing name for this TradingView decision-support tool:

```bash
cd video/instagram-reel
npm install
npm run render
```

The local render output is `video/instagram-reel/out/nifty-trade-compass-30s-reel.mp4`.

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

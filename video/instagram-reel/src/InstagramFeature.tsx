import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);

const colors = {
  bg: '#0b1017',
  panel: '#151b24',
  panel2: '#202735',
  line: '#334050',
  text: '#f7f7f4',
  muted: '#aab2bf',
  dim: '#6f7886',
  amber: '#ff9f0a',
  mint: '#00e884',
  red: '#ff4d64',
  cyan: '#4cc9f0',
  violet: '#8b5cf6',
};

const font = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const mono = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const appear = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

const scene = (frame: number, start: number, end: number, fade = 18) => {
  const fadeIn = interpolate(frame, [start, start + fade], [0, 1], clamp);
  const fadeOut = interpolate(frame, [end - fade, end], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

const slideY = (progress: number, distance: number) =>
  interpolate(progress, [0, 1], [distance, 0], clamp);

const pillStyle = (accent: string): React.CSSProperties => ({
  border: `1px solid ${accent}55`,
  color: accent,
  borderRadius: 999,
  padding: '10px 16px',
  fontSize: 24,
  fontWeight: 760,
  letterSpacing: 1.8,
  background: `${accent}13`,
});

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      borderRadius: 32,
      border: `1px solid ${colors.line}`,
      background: `linear-gradient(145deg, ${colors.panel}, ${colors.panel2})`,
      boxShadow: '0 28px 80px rgba(0, 0, 0, 0.42)',
      ...style,
    }}
  >
    {children}
  </div>
);

const Background = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 450], [0, -90], clamp);

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(160deg, #0b1017 0%, #101722 42%, #171923 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.28,
          backgroundImage:
            'linear-gradient(#ffffff12 1px, transparent 1px), linear-gradient(90deg, #ffffff12 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          transform: `translateY(${drift}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -120,
          top: 140,
          width: 1320,
          height: 520,
          transform: 'rotate(-10deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(76, 201, 240, 0.16), rgba(255, 159, 10, 0.14), transparent)',
          filter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 64,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 54,
        }}
      />
    </AbsoluteFill>
  );
};

const Header = () => (
  <div
    style={{
      position: 'absolute',
      top: 72,
      left: 72,
      right: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: colors.text,
      fontFamily: font,
    }}
  >
    <div style={{fontSize: 28, fontWeight: 780}}>NIFTY Pro v2.3</div>
    <div style={{display: 'flex', gap: 12}}>
      <div style={pillStyle(colors.mint)}>OPEN SOURCE</div>
      <div style={pillStyle(colors.amber)}>AUTO SYNC</div>
    </div>
  </div>
);

const PhoneChart = ({
  progress,
  compact = false,
}: {
  progress: number;
  compact?: boolean;
}) => {
  const lift = slideY(progress, 70);
  const scale = interpolate(progress, [0, 1], [0.94, 1], clamp);

  return (
    <Card
      style={{
        position: 'absolute',
        width: compact ? 660 : 790,
        height: compact ? 520 : 670,
        right: compact ? 58 : 42,
        bottom: compact ? 188 : 206,
        overflow: 'hidden',
        opacity: progress,
        transform: `translateY(${lift}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          height: 54,
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '0 24px',
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <span style={{width: 13, height: 13, borderRadius: 99, background: colors.red}} />
        <span style={{width: 13, height: 13, borderRadius: 99, background: colors.amber}} />
        <span style={{width: 13, height: 13, borderRadius: 99, background: colors.mint}} />
        <span
          style={{
            marginLeft: 18,
            color: colors.muted,
            fontSize: 20,
            fontFamily: mono,
          }}
        >
          TradingView / Pine Editor
        </span>
      </div>
      <Img
        src={staticFile('nifty_decision_map.png')}
        style={{
          width: '100%',
          height: 'calc(100% - 54px)',
          objectFit: 'cover',
          objectPosition: 'center center',
          opacity: 0.92,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 28,
          bottom: 28,
          right: 28,
          borderRadius: 22,
          background: 'rgba(11, 16, 23, 0.82)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '18px 22px',
          fontFamily: font,
          color: colors.text,
          fontSize: 25,
          fontWeight: 780,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Paste</span>
        <span style={{color: colors.mint}}>Save</span>
        <span style={{color: colors.amber}}>Apply</span>
      </div>
    </Card>
  );
};

const HeroScene = () => {
  const frame = useCurrentFrame();
  const title = appear(frame, 6, 34);
  const chart = appear(frame, 44, 38);

  return (
    <AbsoluteFill style={{opacity: scene(frame, 0, 138), fontFamily: font}}>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 260,
          width: 760,
          color: colors.text,
          opacity: title,
          transform: `translateY(${slideY(title, 54)}px)`,
        }}
      >
        <div
          style={{
            color: colors.amber,
            fontSize: 34,
            fontWeight: 820,
            marginBottom: 28,
            letterSpacing: 2,
          }}
        >
          NEW FEATURE
        </div>
        <div
          style={{
            fontSize: 100,
            lineHeight: 0.96,
            fontWeight: 900,
            letterSpacing: 0,
          }}
        >
          Auto-push Pine updates to TradingView
        </div>
        <div
          style={{
            marginTop: 38,
            color: colors.muted,
            fontSize: 34,
            lineHeight: 1.28,
            fontWeight: 580,
            width: 690,
          }}
        >
          Save locally. The watcher copies, activates, pastes, saves, and applies.
        </div>
      </div>
      <PhoneChart progress={chart} />
    </AbsoluteFill>
  );
};

const CodeLine = ({
  text,
  color = colors.muted,
  delay,
}: {
  text: string;
  color?: string;
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const p = appear(frame, delay, 15);

  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-28, 0], clamp)}px)`,
        color,
        fontFamily: mono,
        fontSize: 24,
        lineHeight: 1.5,
        whiteSpace: 'pre',
      }}
    >
      {text}
    </div>
  );
};

const WatcherScene = () => {
  const frame = useCurrentFrame();
  const p = scene(frame, 118, 264);
  const cardIn = appear(frame, 126, 24);
  const pulse = interpolate(Math.sin((frame - 168) / 8), [-1, 1], [0.35, 1], clamp);

  return (
    <AbsoluteFill style={{opacity: p, fontFamily: font}}>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 196,
          right: 72,
          color: colors.text,
        }}
      >
        <div style={{fontSize: 72, lineHeight: 1, fontWeight: 900}}>
          Make one edit.
          <br />
          Watch it ship.
        </div>
        <div style={{fontSize: 30, color: colors.muted, marginTop: 22}}>
          The watcher keeps the script and chart in sync while you work.
        </div>
      </div>

      <Card
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 470,
          height: 455,
          padding: 34,
          opacity: cardIn,
          transform: `translateY(${slideY(cardIn, 52)}px)`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 26}}>
          <div style={{fontFamily: mono, color: colors.cyan, fontSize: 25}}>
            trading-setups/nifty_pro_decision_map_v2_indicator.pine
          </div>
          <div
            style={{
              color: colors.mint,
              fontSize: 23,
              fontWeight: 780,
              opacity: pulse,
            }}
          >
            SAVED
          </div>
        </div>
        <CodeLine text={'//@version=6'} color={colors.dim} delay={142} />
        <CodeLine text={'indicator("NIFTY Pro Decision Map v2.3", overlay=true)'} delay={150} />
        <CodeLine text={'noTradeOverride = sessionBlock or eventMode'} color={colors.amber} delay={158} />
        <CodeLine text={'riskText = f_reasons(vwapExtended, "Extended", vixRisk, "VIX")'} delay={166} />
        <CodeLine text={'callReadyAlert = stateChanged and state == "CALL READY"'} color={colors.mint} delay={174} />
        <CodeLine text={'putReadyAlert = stateChanged and state == "PUT READY"'} color={colors.cyan} delay={182} />
      </Card>

      <Card
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          bottom: 280,
          padding: '28px 32px',
          opacity: appear(frame, 196, 25),
        }}
      >
        <div style={{fontFamily: mono, fontSize: 28, color: colors.text}}>
          <span style={{color: colors.mint}}>$</span> scripts/watch_and_push_to_tradingview.sh
        </div>
        <div style={{fontFamily: mono, marginTop: 18, fontSize: 23, color: colors.muted}}>
          Watching file changes - auto paste / save / apply
        </div>
      </Card>
    </AbsoluteFill>
  );
};

const Step = ({
  label,
  detail,
  accent,
  index,
}: {
  label: string;
  detail: string;
  accent: string;
  index: number;
}) => {
  const frame = useCurrentFrame();
  const p = appear(frame, 270 + index * 13, 20);

  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${slideY(p, 38)}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 23,
          background: `${accent}24`,
          border: `1px solid ${accent}77`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 900,
          fontFamily: font,
        }}
      >
        {index + 1}
      </div>
      <div>
        <div style={{color: colors.text, fontSize: 34, fontWeight: 860}}>{label}</div>
        <div style={{color: colors.muted, fontSize: 24, marginTop: 4}}>{detail}</div>
      </div>
    </div>
  );
};

const PipelineScene = () => {
  const frame = useCurrentFrame();
  const p = scene(frame, 248, 374);
  const progress = interpolate(frame, [270, 342], [0, 1], {...clamp, easing: easeInOut});

  return (
    <AbsoluteFill style={{opacity: p, fontFamily: font}}>
      <div style={{position: 'absolute', top: 180, left: 72, right: 72}}>
        <div style={{fontSize: 70, fontWeight: 900, color: colors.text, lineHeight: 1}}>
          Fully automated
          <br />
          TradingView flow
        </div>
      </div>

      <Card
        style={{
          position: 'absolute',
          left: 72,
          top: 412,
          width: 936,
          height: 350,
          padding: 34,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 92,
            right: 92,
            top: 174,
            height: 8,
            borderRadius: 99,
            background: colors.line,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 92,
            top: 174,
            width: interpolate(progress, [0, 1], [0, 752], clamp),
            height: 8,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${colors.mint}, ${colors.cyan}, ${colors.amber})`,
          }}
        />
        {[
          ['File', colors.mint],
          ['Clipboard', colors.cyan],
          ['Editor', colors.violet],
          ['Apply', colors.amber],
        ].map(([label, accent], index) => {
          const stepP = appear(frame, 266 + index * 17, 18);
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: 72 + index * 248,
                top: 102,
                width: 130,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: stepP,
              }}
            >
              <div
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: 28,
                  border: `2px solid ${accent}`,
                  background: `${accent}22`,
                  boxShadow: `0 0 34px ${accent}33`,
                }}
              />
              <div style={{marginTop: 24, color: colors.text, fontSize: 25, fontWeight: 820}}>
                {label}
              </div>
            </div>
          );
        })}
      </Card>

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          bottom: 230,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <Step label="Copy latest Pine" detail="pbcopy from the single source file" accent={colors.mint} index={0} />
        <Step label="Activate TradingView" detail="targets the already-running Mac app" accent={colors.cyan} index={1} />
        <Step label="Paste, save, apply" detail="no prompt when --auto is enabled" accent={colors.amber} index={2} />
      </div>
    </AbsoluteFill>
  );
};

const ClosingScene = () => {
  const frame = useCurrentFrame();
  const p = scene(frame, 356, 450, 18);
  const headline = appear(frame, 366, 28);
  const command = appear(frame, 392, 24);

  return (
    <AbsoluteFill style={{opacity: p, fontFamily: font}}>
      <PhoneChart progress={appear(frame, 368, 30)} compact />
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 190,
          width: 880,
          color: colors.text,
          opacity: headline,
          transform: `translateY(${slideY(headline, 46)}px)`,
        }}
      >
        <div style={{fontSize: 92, fontWeight: 930, lineHeight: 0.96}}>
          One script.
          <br />
          One watcher.
          <br />
          Zero manual copy-paste.
        </div>
      </div>

      <Card
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 270,
          padding: '34px 36px',
          opacity: command,
          transform: `translateY(${slideY(command, 38)}px)`,
        }}
      >
        <div style={{fontFamily: mono, color: colors.mint, fontSize: 30, lineHeight: 1.35}}>
          scripts/watch_and_push_to_tradingview.sh
        </div>
        <div style={{marginTop: 20, color: colors.muted, fontSize: 27, lineHeight: 1.32}}>
          Open-source NIFTY decision support. Built for fast iteration, not blind automation.
        </div>
      </Card>

      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 112,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: colors.muted,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        <span>github.com/mayank-srm/trading_view</span>
        <span style={{color: colors.amber}}>Decision support only</span>
      </div>
    </AbsoluteFill>
  );
};

export const InstagramFeature = () => {
  return (
    <AbsoluteFill style={{fontFamily: font}}>
      <Background />
      <Header />
      <HeroScene />
      <WatcherScene />
      <PipelineScene />
      <ClosingScene />
    </AbsoluteFill>
  );
};

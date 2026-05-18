import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const colors = {
  bg: '#080d13',
  ink: '#f7f8f4',
  muted: '#b5bdc9',
  quiet: '#7d8796',
  panel: '#141b25',
  panel2: '#202735',
  line: '#354253',
  grid: 'rgba(255,255,255,0.08)',
  green: '#00e884',
  amber: '#ff9f0a',
  red: '#ff4d64',
  cyan: '#52d7ff',
  blue: '#5b8cff',
};

const font =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const mono = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);

const fade = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

const scene = (frame: number, start: number, end: number, edge = 18) => {
  const fadeIn = interpolate(frame, [start, start + edge], [0, 1], clamp);
  const fadeOut = interpolate(frame, [end - edge, end], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

const y = (progress: number, distance: number) =>
  interpolate(progress, [0, 1], [distance, 0], clamp);

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      borderRadius: 30,
      border: `1px solid ${colors.line}`,
      background: `linear-gradient(145deg, ${colors.panel}, ${colors.panel2})`,
      boxShadow: '0 30px 90px rgba(0, 0, 0, 0.42)',
      ...style,
    }}
  >
    {children}
  </div>
);

const ChartBackdrop = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 900], [0, -92], clamp);
  const candles = [
    [120, 104, 60, colors.green],
    [178, 116, 88, colors.red],
    [236, 96, 72, colors.green],
    [294, 132, 96, colors.green],
    [352, 118, 60, colors.red],
    [410, 84, 116, colors.green],
    [468, 108, 84, colors.green],
    [526, 92, 136, colors.red],
    [584, 148, 80, colors.green],
    [642, 124, 112, colors.green],
    [700, 88, 76, colors.red],
    [758, 102, 128, colors.green],
    [816, 76, 104, colors.green],
    [874, 114, 72, colors.red],
  ] as const;

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(160deg, #080d13 0%, #101722 48%, #161920 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.34,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          transform: `translateY(${drift}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 196,
          height: 520,
          opacity: 0.28,
        }}
      >
        {candles.map(([left, top, height, color], index) => {
          const p = fade(frame, 12 + index * 3, 18);
          return (
            <div
              key={`${left}-${top}`}
              style={{
                position: 'absolute',
                left,
                top,
                width: 20,
                height,
                borderRadius: 8,
                background: color,
                opacity: p,
                boxShadow: `0 0 28px ${color}55`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: -120,
          right: -120,
          top: 260,
          height: 440,
          transform: 'rotate(-8deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(82,215,255,0.16), rgba(255,159,10,0.13), transparent)',
          filter: 'blur(8px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 58,
          borderRadius: 56,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
    </AbsoluteFill>
  );
};

const Header = () => (
  <div
    style={{
      position: 'absolute',
      left: 70,
      right: 70,
      top: 66,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: font,
      color: colors.ink,
    }}
  >
    <div style={{fontSize: 28, fontWeight: 850}}>NIFTY Trade Compass</div>
    <div
      style={{
        borderRadius: 999,
        border: `1px solid ${colors.green}66`,
        color: colors.green,
        background: `${colors.green}13`,
        padding: '10px 16px',
        fontSize: 22,
        fontWeight: 850,
        letterSpacing: 1.3,
      }}
    >
      TRADINGVIEW PINE
    </div>
  </div>
);

type DashboardMode = 'call' | 'wait' | 'noTrade';

const dashboardCopy: Record<
  DashboardMode,
  {
    state: string;
    color: string;
    check: string;
    market: string;
    edge: string;
    bias: string;
    vwap: string;
    ema: string;
    adx: string;
    atr: string;
    volume: string;
    vix: string;
    news: string;
    call: string;
    put: string;
  }
> = {
  call: {
    state: 'CALL READY',
    color: colors.green,
    check: 'Clean setup',
    market: 'Tradable',
    edge: 'Bullish edge',
    bias: 'Bullish',
    vwap: 'Above',
    ema: '9 > 21 rising',
    adx: '31 strong / +DI',
    atr: 'Tradable',
    volume: 'Confirmed',
    vix: 'Normal',
    news: 'Neutral watch',
    call: 'Ready - score 84',
    put: 'Blocked - opposite edge',
  },
  wait: {
    state: 'WAIT',
    color: colors.amber,
    check: 'Need confirmation',
    market: 'Mixed',
    edge: 'Not enough edge',
    bias: 'Neutral',
    vwap: 'Near VWAP',
    ema: 'Flat',
    adx: '18 building',
    atr: 'Tradable',
    volume: 'Average',
    vix: 'Normal',
    news: 'No major impact',
    call: 'Wait - no clean breakout',
    put: 'Wait - no clean breakdown',
  },
  noTrade: {
    state: 'NO TRADE',
    color: colors.red,
    check: 'Risk block active',
    market: 'Risky',
    edge: 'None',
    bias: 'Mixed',
    vwap: 'Extended',
    ema: 'Chasing',
    adx: 'Weak',
    atr: 'Unstable',
    volume: 'Weak',
    vix: 'Risk spike',
    news: 'High impact',
    call: 'Blocked - risk first',
    put: 'Blocked - risk first',
  },
};

const Row = ({
  label,
  value,
  color = colors.muted,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '178px 1fr',
      alignItems: 'center',
      minHeight: 50,
      borderTop: '1px solid rgba(255,255,255,0.09)',
      fontFamily: font,
    }}
  >
    <div
      style={{
        color: colors.ink,
        fontSize: 24,
        fontWeight: 820,
        textAlign: 'center',
      }}
    >
      {label}
    </div>
    <div
      style={{
        color,
        fontSize: 24,
        fontWeight: 760,
        textAlign: 'center',
      }}
    >
      {value}
    </div>
  </div>
);

const Dashboard = ({
  mode,
  progress,
  style,
}: {
  mode: DashboardMode;
  progress: number;
  style?: React.CSSProperties;
}) => {
  const copy = dashboardCopy[mode];
  const scale = interpolate(progress, [0, 1], [0.94, 1], clamp);

  return (
    <Card
      style={{
        width: 846,
        overflow: 'hidden',
        opacity: progress,
        transform: `translateY(${y(progress, 64)}px) scale(${scale})`,
        ...style,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          alignItems: 'center',
          minHeight: 82,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div
          style={{
            color: colors.ink,
            fontFamily: font,
            fontSize: 28,
            fontWeight: 860,
            textAlign: 'center',
          }}
        >
          NIFTY PRO v2.3
        </div>
        <div
          style={{
            background: copy.color,
            color: mode === 'wait' ? colors.bg : colors.bg,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: font,
            fontSize: 34,
            fontWeight: 920,
            letterSpacing: 1,
          }}
        >
          {copy.state}
        </div>
      </div>
      <Row label="CHECK" value={copy.check} color={copy.color} />
      <Row label="MARKET" value={copy.market} color={mode === 'call' ? colors.green : mode === 'wait' ? colors.amber : colors.red} />
      <Row label="EDGE" value={copy.edge} color={mode === 'call' ? colors.green : colors.muted} />
      <Row label="BIAS" value={copy.bias} color={mode === 'call' ? colors.green : colors.amber} />
      <Row label="VWAP" value={copy.vwap} color={mode === 'noTrade' ? colors.amber : colors.green} />
      <Row label="EMA" value={copy.ema} color={mode === 'call' ? colors.green : colors.muted} />
      <Row label="ADX/DMI" value={copy.adx} color={mode === 'call' ? colors.green : colors.amber} />
      <Row label="ATR" value={copy.atr} color={mode === 'noTrade' ? colors.red : colors.green} />
      <Row label="VOLUME" value={copy.volume} color={mode === 'call' ? colors.green : colors.amber} />
      <Row label="VIX" value={copy.vix} color={mode === 'noTrade' ? colors.red : colors.muted} />
      <Row label="NEWS" value={copy.news} color={mode === 'noTrade' ? colors.red : colors.muted} />
      <Row label="CALL" value={copy.call} color={mode === 'call' ? colors.green : colors.muted} />
      <Row label="PUT" value={copy.put} color={colors.muted} />
    </Card>
  );
};

const Caption = ({
  eyebrow,
  title,
  body,
  start,
  width = 850,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: string;
  start: number;
  width?: number;
}) => {
  const frame = useCurrentFrame();
  const p = fade(frame, start, 24);

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        top: 180,
        width,
        opacity: p,
        transform: `translateY(${y(p, 50)}px)`,
        fontFamily: font,
        color: colors.ink,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            color: colors.amber,
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 24,
            letterSpacing: 2,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 84,
          lineHeight: 0.98,
          fontWeight: 940,
          letterSpacing: 0,
        }}
      >
        {title}
      </div>
      {body ? (
        <div
          style={{
            marginTop: 28,
            color: colors.muted,
            fontSize: 31,
            lineHeight: 1.28,
            fontWeight: 620,
          }}
        >
          {body}
        </div>
      ) : null}
    </div>
  );
};

const HookScene = () => {
  const frame = useCurrentFrame();
  const opacity = scene(frame, 0, 188, 24);

  return (
    <AbsoluteFill style={{opacity}}>
      <Caption
        eyebrow="NEW TRADINGVIEW TOOL"
        title={
          <>
            AppUo came up
            <br />
            with a new
            <br />
            TradingView tool.
          </>
        }
        body="Meet NIFTY Trade Compass: a decision-support panel for NIFTY intraday traders."
        start={8}
      />
      <Dashboard
        mode="wait"
        progress={fade(frame, 78, 38)}
        style={{position: 'absolute', left: 116, bottom: 158}}
      />
    </AbsoluteFill>
  );
};

const FactorChip = ({
  label,
  detail,
  accent,
  index,
  baseStart,
}: {
  label: string;
  detail: string;
  accent: string;
  index: number;
  baseStart: number;
}) => {
  const frame = useCurrentFrame();
  const p = fade(frame, baseStart + index * 12, 22);

  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y(p, 34)}px)`,
        borderRadius: 24,
        border: `1px solid ${accent}66`,
        background: `${accent}14`,
        padding: '22px 24px',
        minHeight: 126,
      }}
    >
      <div style={{color: accent, fontSize: 28, fontWeight: 900}}>{label}</div>
      <div style={{color: colors.muted, fontSize: 22, marginTop: 8, lineHeight: 1.22}}>
        {detail}
      </div>
    </div>
  );
};

const FactorsScene = () => {
  const frame = useCurrentFrame();
  const opacity = scene(frame, 168, 358, 24);
  const factors = [
    ['VWAP', 'value location', colors.green],
    ['EMA', 'trend alignment', colors.cyan],
    ['ADX/DMI', 'direction strength', colors.blue],
    ['ATR', 'range quality', colors.amber],
    ['Volume', 'participation', colors.green],
    ['VIX + News', 'risk context', colors.red],
  ] as const;

  return (
    <AbsoluteFill style={{opacity, fontFamily: font}}>
      <Caption
        eyebrow="ONE-PLACE CHECK"
        title={
          <>
            One screen for
            <br />
            the messy checklist.
          </>
        }
        body="VWAP, trend, strength, range, participation, VIX, and news risk stay readable."
        start={180}
      />
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 210,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 22,
        }}
      >
        {factors.map(([label, detail, accent], index) => (
          <FactorChip
            key={label}
            label={label}
            detail={detail}
            accent={accent}
            index={index}
            baseStart={238}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const StateCard = ({
  mode,
  label,
  detail,
  start,
  top,
}: {
  mode: DashboardMode;
  label: string;
  detail: string;
  start: number;
  top: number;
}) => {
  const frame = useCurrentFrame();
  const copy = dashboardCopy[mode];
  const p = fade(frame, start, 22);

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        top,
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-46, 0], clamp)}px)`,
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        alignItems: 'center',
        gap: 22,
      }}
    >
      <div
        style={{
          height: 94,
          borderRadius: 26,
          background: copy.color,
          color: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 940,
          fontFamily: font,
        }}
      >
        {copy.state}
      </div>
      <div>
        <div style={{fontSize: 34, color: colors.ink, fontWeight: 900}}>{label}</div>
        <div style={{fontSize: 25, color: colors.muted, marginTop: 5}}>{detail}</div>
      </div>
    </div>
  );
};

const DecisionScene = () => {
  const frame = useCurrentFrame();
  const opacity = scene(frame, 338, 586, 26);
  const dashboardMode: DashboardMode =
    frame < 430 ? 'call' : frame < 506 ? 'wait' : 'noTrade';

  return (
    <AbsoluteFill style={{opacity, fontFamily: font}}>
      <Caption
        eyebrow="CLEAR STATES"
        title={
          <>
            Ready. Wait.
            <br />
            Or no trade.
          </>
        }
        body="It is not trying to predict everything. It helps you avoid forcing bad entries."
        start={350}
      />
      <Dashboard
        mode={dashboardMode}
        progress={fade(frame, 440, 30)}
        style={{position: 'absolute', left: 116, top: 920, transformOrigin: 'top center'}}
      />
      <StateCard
        mode="call"
        label="Take only clean momentum"
        detail="When trend, value, strength, and risk align."
        start={394}
        top={516}
      />
      <StateCard
        mode="wait"
        label="Stay patient in mixed markets"
        detail="No edge means no forced trade."
        start={430}
        top={636}
      />
      <StateCard
        mode="noTrade"
        label="Respect risk blocks"
        detail="News, weak structure, or VIX risk stays visible."
        start={466}
        top={756}
      />
    </AbsoluteFill>
  );
};

const Benefit = ({
  title,
  body,
  accent,
  start,
  top,
}: {
  title: string;
  body: string;
  accent: string;
  start: number;
  top: number;
}) => {
  const frame = useCurrentFrame();
  const p = fade(frame, start, 20);

  return (
    <Card
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        top,
        padding: '30px 34px',
        opacity: p,
        transform: `translateY(${y(p, 36)}px)`,
      }}
    >
      <div style={{display: 'flex', gap: 22, alignItems: 'flex-start'}}>
        <div
          style={{
            width: 18,
            height: 78,
            borderRadius: 12,
            background: accent,
            boxShadow: `0 0 34px ${accent}55`,
          }}
        />
        <div>
          <div style={{fontSize: 36, color: colors.ink, fontWeight: 920}}>{title}</div>
          <div style={{fontSize: 26, color: colors.muted, marginTop: 8, lineHeight: 1.28}}>
            {body}
          </div>
        </div>
      </div>
    </Card>
  );
};

const TrustScene = () => {
  const frame = useCurrentFrame();
  const opacity = scene(frame, 560, 750, 24);

  return (
    <AbsoluteFill style={{opacity, fontFamily: font}}>
      <Caption
        eyebrow="WHAT YOU GET"
        title={
          <>
            More discipline.
            <br />
            Less second guessing.
          </>
        }
        body="Use it as a decision filter before you commit risk."
        start={572}
      />
      <Benefit
        title="Risk-first dashboard"
        body="NO TRADE is treated as a useful state, not a failure."
        accent={colors.red}
        start={626}
        top={650}
      />
      <Benefit
        title="Manual context stays in your hands"
        body="POC, VAH, VAL, OI walls, max pain, news, and expiry can be updated by the trader."
        accent={colors.amber}
        start={656}
        top={828}
      />
      <Benefit
        title="Open-source Pine workflow"
        body="Transparent logic, TradingView alerts, and local auto-sync when you improve the script."
        accent={colors.green}
        start={686}
        top={1032}
      />
    </AbsoluteFill>
  );
};

const ClosingProductCard = ({progress}: {progress: number}) => (
  <Card
    style={{
      position: 'absolute',
      left: 72,
      right: 72,
      top: 740,
      height: 610,
      overflow: 'hidden',
      opacity: progress,
      transform: `translateY(${y(progress, 40)}px)`,
    }}
  >
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 290px',
        minHeight: 92,
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 30,
          color: colors.ink,
          fontSize: 31,
          fontWeight: 920,
        }}
      >
        NIFTY Pro v2.3
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.green,
          color: colors.bg,
          fontSize: 28,
          fontWeight: 940,
        }}
      >
        CALL READY
      </div>
    </div>
    <div style={{padding: '34px 34px 0'}}>
      <div style={{color: colors.ink, fontSize: 43, lineHeight: 1.04, fontWeight: 940}}>
        A TradingView decision layer
        <br />
        for NIFTY intraday traders.
      </div>
      <div
        style={{
          marginTop: 26,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          width: 530,
        }}
      >
        {[
          ['States', 'CALL / PUT / WAIT / NO TRADE', colors.green],
          ['Risk', 'VIX, volume, news, ATR', colors.red],
          ['Context', 'VWAP, EMA, ADX/DMI, levels', colors.cyan],
          ['Alerts', 'state transitions only', colors.amber],
        ].map(([title, body, accent]) => (
          <div
            key={title}
            style={{
              borderRadius: 20,
              border: `1px solid ${accent}66`,
              background: `${accent}12`,
              padding: '18px 18px',
            }}
          >
            <div style={{color: accent, fontSize: 23, fontWeight: 920}}>{title}</div>
            <div style={{color: colors.muted, fontSize: 19, marginTop: 6, lineHeight: 1.18}}>
              {body}
            </div>
          </div>
        ))}
      </div>
    </div>
    <Img
      src={staticFile('nifty_decision_map.png')}
      style={{
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 326,
        height: 220,
        objectFit: 'cover',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.14)',
        opacity: 0.68,
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: 48,
        bottom: 48,
        borderRadius: 18,
        background: 'rgba(8,13,19,0.78)',
        border: '1px solid rgba(255,255,255,0.14)',
        color: colors.ink,
        padding: '12px 14px',
        fontSize: 20,
        fontWeight: 820,
      }}
    >
      Chart context included
    </div>
  </Card>
);

const ClosingScene = () => {
  const frame = useCurrentFrame();
  const opacity = scene(frame, 728, 900, 24);
  const title = fade(frame, 742, 28);
  const command = fade(frame, 830, 26);

  return (
    <AbsoluteFill style={{opacity, fontFamily: font}}>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 190,
          width: 900,
          opacity: title,
          transform: `translateY(${y(title, 42)}px)`,
        }}
      >
        <div style={{fontSize: 92, lineHeight: 0.96, fontWeight: 950, color: colors.ink}}>
          NIFTY Pro
          <br />
          Trade Compass
        </div>
        <div
          style={{
            marginTop: 28,
            color: colors.muted,
            fontSize: 32,
            lineHeight: 1.28,
            fontWeight: 640,
            width: 750,
          }}
        >
          A TradingView decision layer for cleaner NIFTY intraday trading.
        </div>
      </div>

      <ClosingProductCard progress={fade(frame, 784, 30)} />

      <Card
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 118,
          padding: '26px 30px',
          opacity: command,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div>
          <div style={{color: colors.green, fontFamily: mono, fontSize: 25, fontWeight: 850}}>
            github.com/appuo-in/ChartIQ
          </div>
          <div style={{color: colors.muted, fontSize: 21, marginTop: 7}}>
            Decision support only. Not financial advice.
          </div>
        </div>
        <div
          style={{
            borderRadius: 18,
            background: colors.amber,
            color: colors.bg,
            padding: '16px 18px',
            fontSize: 22,
            fontWeight: 930,
          }}
        >
          TRY IT
        </div>
      </Card>
    </AbsoluteFill>
  );
};

const ProgressBar = () => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [0, 899], [0, 940], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        bottom: 54,
        height: 5,
        borderRadius: 99,
        background: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width,
          height: '100%',
          background: `linear-gradient(90deg, ${colors.green}, ${colors.cyan}, ${colors.amber})`,
        }}
      />
    </div>
  );
};

export const InstagramFeature = () => {
  return (
    <AbsoluteFill style={{fontFamily: font, backgroundColor: colors.bg}}>
      <ChartBackdrop />
      <Header />
      <HookScene />
      <FactorsScene />
      <DecisionScene />
      <TrustScene />
      <ClosingScene />
      <ProgressBar />
    </AbsoluteFill>
  );
};

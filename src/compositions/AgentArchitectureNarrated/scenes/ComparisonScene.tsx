import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';
import { GA } from '../gaColors';

export const COMPARISON_SCENE_DURATION = 2700;

// ─── Row data ─────────────────────────────────────────────────────────────────
const ROWS = [
  {
    metric: 'Scalability',
    single: { text: 'Limited by one agent',   score: 2, icon: '⚠️' },
    multi:  { text: 'Scales horizontally',     score: 5, icon: '✅' },
  },
  {
    metric: 'Parallelism',
    single: { text: 'Sequential only',          score: 1, icon: '❌' },
    multi:  { text: 'Full parallel execution',  score: 5, icon: '✅' },
  },
  {
    metric: 'Fault Tolerance',
    single: { text: 'Single point of failure',  score: 1, icon: '❌' },
    multi:  { text: 'Isolated failures',        score: 4, icon: '✅' },
  },
  {
    metric: 'Complexity',
    single: { text: 'Simple to build',          score: 5, icon: '✅' },
    multi:  { text: 'Coordination overhead',    score: 2, icon: '⚠️' },
  },
  {
    metric: 'Debugging',
    single: { text: 'Easy to trace',            score: 5, icon: '✅' },
    multi:  { text: 'Harder to observe',        score: 2, icon: '⚠️' },
  },
];

const SCORE_MAX = 5;

// ─── EXACT FRAME TRIGGERS (script-synced at 160 wpm, 11.25 frames/word) ──────
// Title + divider + column headers appear immediately
const HEADERS_IN = 0;

// Each row appears when narrator says its metric name
const ROW1_IN = 160;   // "Scalability"
const ROW2_IN = 525;   // "Parallelism"
const ROW3_IN = 878;   // "Fault Tolerance"
const ROW4_IN = 1338;  // "Complexity"
const ROW5_IN = 1698;  // "Debugging"

const ROW_FRAME_STARTS = [ROW1_IN, ROW2_IN, ROW3_IN, ROW4_IN, ROW5_IN];

// Conclusion banner
const CONCLUSION_IN = 2080;

// ─── Sub-components ──────────────────────────────────────────────────────────

type ScoreBarProps = { score: number; color: string; progress: number };
const ScoreBar: React.FC<ScoreBarProps> = ({ score, color, progress }) => (
  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
    {Array.from({ length: SCORE_MAX }, (_, i) => (
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: i < score ? color : GA.border,
          opacity: i < score ? Math.min(1, progress * SCORE_MAX - i) : 0.4,
        }}
      />
    ))}
  </div>
);

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in/out (15-frame crossfade overlap)
  const fadeIn  = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [2685, 2700], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  // Title
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  // Vertical divider draws in
  const dividerProgress = interpolate(frame, [HEADERS_IN + 15, HEADERS_IN + 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Column headers spring in
  const headerSpring = spring({
    frame: frame - (HEADERS_IN + 20),
    fps,
    config: { damping: 200 },
    durationInFrames: 28,
  });

  // Per-row opacity + slide (each row has its own trigger)
  const rowProgress = ROW_FRAME_STARTS.map((start) =>
    interpolate(frame, [start, start + 20], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    }),
  );

  // Score bar fill progress (starts 15 frames after row appears, fills over 40 frames)
  const barProgress = ROW_FRAME_STARTS.map((start) =>
    interpolate(frame, [start + 15, start + 55], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  // Conclusion banner
  const conclusionOpacity = interpolate(frame, [CONCLUSION_IN, CONCLUSION_IN + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const DIVIDER_H = 500;

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: sceneOpacity }}>
      {/* Vertical divider SVG */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line
          x1={640} y1={100}
          x2={640} y2={100 + DIVIDER_H * dividerProgress}
          stroke={GA.border}
          strokeWidth={1.5}
        />
      </svg>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 0, right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 38,
          fontWeight: 700,
          color: GA.text,
          letterSpacing: '-0.5px',
        }}
      >
        Head-to-Head Comparison
        <div
          style={{
            height: 3,
            width: 260,
            background: `linear-gradient(90deg, ${GA.yellow}, ${GA.softYellow})`,
            margin: '8px auto 0',
            borderRadius: 2,
          }}
        />
      </div>

      {/* Column headers */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 0, right: 0,
          display: 'flex',
          opacity: headerSpring,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [12, 0])}px)`,
        }}
      >
        {/* Single Agent header */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingRight: 40 }}>
          <div
            style={{
              background: GA.accent1Deep,
              border: `2px solid ${GA.yellow}`,
              borderRadius: 12,
              padding: '8px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>🤖</span>
            <span style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 22, fontWeight: 700, color: GA.yellow }}>
              Single Agent
            </span>
          </div>
        </div>
        {/* Multi Agent header */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingLeft: 40 }}>
          <div
            style={{
              background: GA.accent2Deep,
              border: `2px solid ${GA.softYellow}`,
              borderRadius: 12,
              padding: '8px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>🧩</span>
            <span style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 22, fontWeight: 700, color: GA.softYellow }}>
              Multi Agent
            </span>
          </div>
        </div>
      </div>

      {/* Comparison rows */}
      <div style={{ position: 'absolute', top: 178, left: 0, right: 0, padding: '0 48px' }}>
        {ROWS.map((row, i) => (
          <div
            key={row.metric}
            style={{
              display: 'flex',
              alignItems: 'center',
              opacity: rowProgress[i],
              transform: `translateX(${interpolate(rowProgress[i], [0, 1], [-20, 0])}px)`,
              marginBottom: 14,
              minHeight: 56,
            }}
          >
            {/* Single Agent side */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                paddingRight: 36,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{row.single.icon}</span>
                <span style={{ fontSize: 14, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  {row.single.text}
                </span>
              </div>
              <ScoreBar score={row.single.score} color={GA.yellow} progress={barProgress[i]} />
            </div>

            {/* Metric label */}
            <div
              style={{
                width: 110,
                textAlign: 'center',
                flexShrink: 0,
                background: GA.navy,
                border: `1px solid ${GA.border}`,
                borderRadius: 8,
                padding: '4px 8px',
                fontSize: 13,
                fontWeight: 700,
                color: GA.muted,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                letterSpacing: '0.03em',
              }}
            >
              {row.metric}
            </div>

            {/* Multi Agent side */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                paddingLeft: 36,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{row.multi.icon}</span>
                <span style={{ fontSize: 14, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  {row.multi.text}
                </span>
              </div>
              <ScoreBar score={row.multi.score} color={GA.softYellow} progress={barProgress[i]} />
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion banner */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 80, right: 80,
          opacity: conclusionOpacity,
          background: GA.navy,
          border: `1px solid ${GA.border}`,
          borderRadius: 14,
          padding: '14px 30px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 13,
              color: GA.muted,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              marginBottom: 4,
            }}
          >
            Choose Single Agent when
          </div>
          <div
            style={{
              fontSize: 15,
              color: GA.yellow,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 600,
            }}
          >
            Task is simple &amp; sequential
          </div>
        </div>
        <div style={{ width: 1, height: 40, background: GA.border }} />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 13,
              color: GA.muted,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              marginBottom: 4,
            }}
          >
            Choose Multi Agent when
          </div>
          <div
            style={{
              fontSize: 15,
              color: GA.softYellow,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 600,
            }}
          >
            Task is complex &amp; parallelizable
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

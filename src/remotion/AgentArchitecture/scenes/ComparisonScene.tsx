import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';
import { C } from '../colors';

const ROWS = [
  {
    metric: 'Scalability',
    single: { text: 'Limited by one agent', score: 2, icon: '⚠️' },
    multi: { text: 'Scales horizontally', score: 5, icon: '✅' },
  },
  {
    metric: 'Parallelism',
    single: { text: 'Sequential only', score: 1, icon: '❌' },
    multi: { text: 'Full parallel execution', score: 5, icon: '✅' },
  },
  {
    metric: 'Fault Tolerance',
    single: { text: 'Single point of failure', score: 1, icon: '❌' },
    multi: { text: 'Isolated failures', score: 4, icon: '✅' },
  },
  {
    metric: 'Complexity',
    single: { text: 'Simple to build', score: 5, icon: '✅' },
    multi: { text: 'Coordination overhead', score: 2, icon: '⚠️' },
  },
  {
    metric: 'Debugging',
    single: { text: 'Easy to trace', score: 5, icon: '✅' },
    multi: { text: 'Harder to observe', score: 2, icon: '⚠️' },
  },
];

const SCORE_MAX = 5;

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
          background: i < score ? color : C.border,
          opacity: i < score ? Math.min(1, progress * SCORE_MAX - i) : 0.4,
        }}
      />
    ))}
  </div>
);

export const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 15-frame fade in/out to align with crossfade overlap in AgentArchitecture
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [2685, 2700], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const dividerProgress = interpolate(frame, [15, 38], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Column headers
  const headerSpring = spring({ frame: frame - 20, fps, config: { damping: 200 }, durationInFrames: 28 });

  // Rows animate in staggered
  const rowProgress = ROWS.map((_, i) =>
    interpolate(frame, [38 + i * 12, 62 + i * 12], [0, 1], {
      extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
      easing: Easing.out(Easing.quad),
    }),
  );

  // Score bars animate
  const barProgress = ROWS.map((_, i) =>
    interpolate(frame, [50 + i * 12, 80 + i * 12], [0, 1], {
      extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    }),
  );

  // Conclusion box
  const conclusionOpacity = interpolate(frame, [110, 130], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });

  const DIVIDER_H = 500;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      {/* Vertical divider line */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line
          x1={640} y1={100}
          x2={640} y2={100 + DIVIDER_H * dividerProgress}
          stroke={C.border}
          strokeWidth={1.5}
        />
      </svg>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 28, left: 0, right: 0,
        textAlign: 'center', opacity: titleOpacity,
        fontFamily: 'Georgia, serif', fontSize: 38, fontWeight: 700,
        color: C.text, letterSpacing: '-0.5px',
      }}>
        Head-to-Head Comparison
        <div style={{ height: 3, width: 260, background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`, margin: '8px auto 0', borderRadius: 2 }} />
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute', top: 100, left: 0, right: 0,
        display: 'flex',
        opacity: headerSpring,
        transform: `translateY(${interpolate(headerSpring, [0, 1], [12, 0])}px)`,
      }}>
        {/* Single Agent header */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingRight: 40 }}>
          <div style={{
            background: C.blueDeep,
            border: `2px solid ${C.blue}`,
            borderRadius: 12,
            padding: '8px 28px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: C.blue }}>
              Single Agent
            </span>
          </div>
        </div>
        {/* Multi Agent header */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingLeft: 40 }}>
          <div style={{
            background: C.purpleDeep,
            border: `2px solid ${C.purple}`,
            borderRadius: 12,
            padding: '8px 28px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>🧩</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: C.purple }}>
              Multi Agent
            </span>
          </div>
        </div>
      </div>

      {/* Rows */}
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
            {/* Single side */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{row.single.icon}</span>
                <span style={{ fontSize: 14, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
                  {row.single.text}
                </span>
              </div>
              <ScoreBar score={row.single.score} color={C.blue} progress={barProgress[i]} />
            </div>

            {/* Metric label */}
            <div style={{
              width: 110,
              textAlign: 'center',
              flexShrink: 0,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 13,
              fontWeight: 700,
              color: C.muted,
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.03em',
            }}>
              {row.metric}
            </div>

            {/* Multi side */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{row.multi.icon}</span>
                <span style={{ fontSize: 14, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
                  {row.multi.text}
                </span>
              </div>
              <ScoreBar score={row.multi.score} color={C.purple} progress={barProgress[i]} />
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion banner */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 80, right: 80,
        opacity: conclusionOpacity,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '14px 30px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.muted, fontFamily: 'system-ui, sans-serif', marginBottom: 4 }}>
            Choose Single Agent when
          </div>
          <div style={{ fontSize: 15, color: C.blue, fontFamily: 'system-ui, sans-serif', fontWeight: 600 }}>
            Task is simple & sequential
          </div>
        </div>
        <div style={{ width: 1, height: 40, background: C.border }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.muted, fontFamily: 'system-ui, sans-serif', marginBottom: 4 }}>
            Choose Multi Agent when
          </div>
          <div style={{ fontSize: 15, color: C.purple, fontFamily: 'system-ui, sans-serif', fontWeight: 600 }}>
            Task is complex & parallelizable
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

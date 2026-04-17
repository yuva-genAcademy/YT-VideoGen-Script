import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { C } from '../colors';

const GRID_COLS = 19;
const GRID_ROWS = 11;

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [885, 900], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const gridOpacity = interpolate(frame, [0, 25], [0, 0.07], { extrapolateRight: 'clamp' });

  const titleSpring = spring({ frame, fps, config: { damping: 180 }, durationInFrames: 35 });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0]);
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const subtitleOpacity = interpolate(frame, [28, 48], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const subtitleY = interpolate(frame, [28, 48], [18, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const underlineWidth = interpolate(frame, [42, 72], [0, 480], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  const taglineOpacity = interpolate(frame, [60, 78], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      {/* Grid */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity: gridOpacity }}
      >
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * cellW}
            y1={0}
            x2={i * cellW}
            y2={height}
            stroke={C.blue}
            strokeWidth={0.6}
          />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * cellH}
            x2={width}
            y2={i * cellH}
            stroke={C.blue}
            strokeWidth={0.6}
          />
        ))}
        {/* Corner accent dots */}
        {[[0, 0], [width, 0], [0, height], [width, height]].map(([cx, cy], i) => (
          <circle key={`dot${i}`} cx={cx} cy={cy} r={3} fill={C.blue} opacity={0.3} />
        ))}
      </svg>

      {/* Glow blob behind title */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 300,
          background: `radial-gradient(ellipse, ${C.blue}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Title block */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, calc(-50% + ${titleY}px))`,
          opacity: titleOpacity,
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-block',
            border: `1px solid ${C.blue}55`,
            borderRadius: 20,
            padding: '4px 18px',
            marginBottom: 18,
            fontSize: 14,
            color: C.blue,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          AI Architecture Series
        </div>

        <div
          style={{
            fontSize: 82,
            fontWeight: 800,
            color: C.text,
            fontFamily: 'Georgia, serif',
            letterSpacing: '-2px',
            lineHeight: 1.05,
          }}
        >
          Agent
          <span style={{ color: C.blue }}> Architecture</span>
        </div>

        {/* Underline */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <div
            style={{
              height: 4,
              width: underlineWidth,
              background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 30,
            color: C.muted,
            fontFamily: 'system-ui, sans-serif',
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            letterSpacing: '0.02em',
          }}
        >
          Single vs Multi-Agent Systems
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: 'absolute',
          bottom: 52,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: taglineOpacity,
          fontSize: 17,
          color: C.muted,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.04em',
        }}
      >
        A visual exploration of AI agent design patterns
      </div>
    </AbsoluteFill>
  );
};

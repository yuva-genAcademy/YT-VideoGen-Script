import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { GA } from '../gaColors';

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [165, 180], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleSpring = spring({ frame, fps, config: { damping: 18 }, durationInFrames: 35 });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  const subtitleOpacity = interpolate(frame, [32, 52], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const underlineWidth = interpolate(frame, [46, 76], [0, 500], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const taglineOpacity = interpolate(frame, [65, 82], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.06], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity }}>
      {/* Dot grid */}
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity: gridOpacity }}>
        {Array.from({ length: 20 }, (_, xi) =>
          Array.from({ length: 12 }, (_, yi) => (
            <circle key={`${xi}-${yi}`} cx={xi * 68 + 34} cy={yi * 65 + 32} r={1.5} fill={GA.yellow} />
          ))
        )}
      </svg>

      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 350,
        background: `radial-gradient(ellipse, ${GA.yellow}16 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Title block */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, calc(-50% + ${titleY}px))`,
        opacity: titleOpacity, textAlign: 'center', userSelect: 'none',
      }}>
        <div style={{
          display: 'inline-block',
          border: `1px solid ${GA.yellow}55`,
          borderRadius: 20, padding: '4px 18px', marginBottom: 18,
          fontSize: 14, color: GA.yellow, letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}>
          Foundations Series
        </div>

        <div style={{
          fontSize: 88, fontWeight: 800, color: GA.text,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          letterSpacing: '-3px', lineHeight: 1.0,
        }}>
          Neural<span style={{ color: GA.yellow }}> Networks</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <div style={{
            height: 4, width: underlineWidth,
            background: `linear-gradient(90deg, ${GA.yellow}, ${GA.softYellow})`,
            borderRadius: 2,
          }} />
        </div>

        <div style={{
          fontSize: 28, color: GA.muted,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          opacity: subtitleOpacity, letterSpacing: '0.02em',
        }}>
          From Neurons to Deep Learning
        </div>
      </div>

      {/* Tagline */}
      <div style={{
        position: 'absolute', bottom: 52, left: 0, right: 0, textAlign: 'center',
        opacity: taglineOpacity, fontSize: 17, color: GA.muted,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        letterSpacing: '0.04em',
      }}>
        The building blocks of every modern AI system
      </div>
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';

export const BASE_PROMPT_DURATION = 360; // 12s @ 30fps

export const BasePromptScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [BASE_PROMPT_DURATION - 18, BASE_PROMPT_DURATION], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const headerY = interpolate(frame, [0, 20], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cardOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardY = interpolate(frame, [30, 55], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardScale = interpolate(frame, [30, 42, 52], [0.93, 1.04, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const labelOpacity = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelY = interpolate(frame, [90, 110], [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: sceneOpacity }}>
      {/* Subtle grid */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.035 }}>
        {Array.from({ length: 19 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 68} y1={0} x2={(i + 1) * 68} y2={720} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 65} x2={1280} y2={(i + 1) * 65} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
      </svg>

      {/* Header */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 72,
          background: GA.bg, borderBottom: `1px solid ${GA.border}`,
          display: 'flex', alignItems: 'center', padding: '0 40px', gap: 18,
          opacity: headerOpacity, transform: `translateY(${headerY}px)`,
        }}
      >
        <div style={{ fontSize: 13, color: GA.muted, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          The Base Prompt
        </div>
        <div
          style={{
            marginLeft: 'auto', fontSize: 10, color: `${GA.yellow}88`, fontFamily: 'monospace',
            letterSpacing: '0.1em', background: `${GA.yellow}0d`, border: `1px solid ${GA.yellow}2a`,
            borderRadius: 4, padding: '3px 10px',
          }}
        >
          used in all 8 techniques
        </div>
      </div>

      {/* Central prompt card */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -50%) translateY(${cardY}px) scale(${cardScale})`,
          opacity: cardOpacity,
          width: 740,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            background: GA.surface,
            borderRadius: 10,
            borderLeft: `4px solid ${GA.yellow}`,
            padding: '36px 44px',
          }}
        >
          <div
            style={{
              fontSize: 11, color: GA.yellow, fontFamily: 'monospace',
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20,
            }}
          >
            prompt — appears in every technique
          </div>
          <div
            style={{
              fontSize: 32, fontWeight: 700, color: GA.text,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              lineHeight: 1.4, letterSpacing: '-0.4px',
            }}
          >
            "My Python code is slow.
          </div>
          <div
            style={{
              fontSize: 32, fontWeight: 700, color: GA.text,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              lineHeight: 1.4, letterSpacing: '-0.4px',
            }}
          >
            How do I make it faster?"
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: 'absolute', bottom: 44, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          opacity: labelOpacity, transform: `translateY(${labelY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 14, color: GA.muted,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontStyle: 'italic',
          }}
        >
          Same question. Eight techniques. Watch what changes.
        </div>
      </div>
    </AbsoluteFill>
  );
};

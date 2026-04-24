import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';
import { TOT } from '../data';

const DURATION = 600;

interface ApproachCardProps {
  approach: { label: string; text: string };
  accentColor: string;
  appearFrame: number;
  index: number;
}

const ApproachCard: React.FC<ApproachCardProps> = ({ approach, accentColor, appearFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearFrame, appearFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [appearFrame, appearFrame + 18], [12, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity, transform: `translateY(${y}px)`,
        background: GA.surface, borderRadius: 6,
        borderLeft: `2px solid ${accentColor}`,
        padding: '14px 18px', flex: 1,
      }}
    >
      <div style={{ fontSize: 10, color: accentColor, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        {approach.label}
      </div>
      <div style={{ fontSize: 14, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", lineHeight: 1.65 }}>
        {approach.text}
      </div>
    </div>
  );
};

export const ToTScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [DURATION - 15, DURATION], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  // Header slide down
  const headerSlideY = interpolate(frame, [0, 20], [-72, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  // Badge pop: scale(0.5 → 1.15 → 1.0)
  const badgeScale = interpolate(frame, [5, 18, 25], [0.5, 1.15, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Zoom punch-in when 3rd card appears (frame 125), reverses at 430
  const zoomScale = interpolate(frame, [125, 143, 430, 448], [1, 1.04, 1.04, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Synthesis box: scale(0.92 → 1) + flash on appear
  const synthesisOpacity = interpolate(frame, [460, 490], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const synthesisScale = interpolate(frame, [460, 475], [0.93, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const synthesisFlash = interpolate(frame, [460, 464, 480], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: sceneOpacity }}>
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.04 }}>
        {Array.from({ length: 19 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 68} y1={0} x2={(i + 1) * 68} y2={720} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 65} x2={1280} y2={(i + 1) * 65} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
      </svg>

      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 72,
          background: `${GA.surface}f0`, borderBottom: `1px solid ${GA.border}`,
          display: 'flex', alignItems: 'center', padding: '0 32px', gap: 18,
          opacity: headerOpacity,
          transform: `translateY(${headerSlideY}px)`,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: GA.yellow, fontFamily: 'monospace', letterSpacing: '0.1em', border: `1px solid ${GA.yellow}44`, borderRadius: 4, padding: '2px 10px', background: `${GA.yellow}0a`, transform: `scale(${badgeScale})`, display: 'inline-block' }}>06</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.5px' }}>Tree-of-Thoughts</div>
        <div style={{ fontSize: 13, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontStyle: 'italic' }}>— Explore every branch, synthesise the best</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: `${GA.yellow}88`, fontFamily: 'monospace', letterSpacing: '0.1em', background: `${GA.yellow}0d`, border: `1px solid ${GA.yellow}2a`, borderRadius: 4, padding: '3px 10px' }}>Model: claude-sonnet-4-6</div>
      </div>

      <div
        style={{
          position: 'absolute', top: 80, left: 32, right: 32, bottom: 24, display: 'flex', flexDirection: 'column', gap: 12,
          transform: `scale(${zoomScale})`, transformOrigin: 'center center',
        }}
      >
        <div style={{ fontSize: 9, color: `${GA.yellow}88`, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          "My Python code is slow. How do I make it faster?" — 3 independent strategies
        </div>
        <div style={{ display: 'flex', gap: 14, flex: 1 }}>
          {TOT.coding.approaches.map((approach, i) => (
            <ApproachCard key={i} approach={approach} accentColor={GA.yellow} appearFrame={15 + i * 55} index={i} />
          ))}
        </div>
        <div
          style={{
            opacity: synthesisOpacity,
            transform: `scale(${synthesisScale})`,
            transformOrigin: 'bottom center',
            background: `${GA.yellow}14`,
            border: `1px solid ${GA.yellow}66`,
            borderRadius: 6,
            padding: '12px 16px',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Flash highlight */}
          <div style={{ position: 'absolute', inset: 0, background: `${GA.yellow}18`, opacity: synthesisFlash, borderRadius: 6, pointerEvents: 'none' }} />
          <div style={{ fontSize: 9, color: GA.yellow, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>★ synthesis — best combined recommendation</div>
          <div style={{ fontSize: 14, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", lineHeight: 1.6 }}>{TOT.coding.synthesis}</div>
        </div>
      </div>

    </AbsoluteFill>
  );
};

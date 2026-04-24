import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';

export const OUTRO_DURATION = 570; // 19s @ 30fps

// ── Sketch drawn-line ───────────────────────────────────────────────────────
const DrawnLine: React.FC<{
  startFrame: number;
  width: number;
  color: string;
  thickness?: number;
  duration?: number;
}> = ({ startFrame, width, color, thickness = 2, duration = 20 }) => {
  const frame = useCurrentFrame();
  const drawn = interpolate(frame, [startFrame, startFrame + duration], [0, width], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <svg width={width} height={thickness + 4} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={0} y1={(thickness + 4) / 2} x2={drawn} y2={(thickness + 4) / 2} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
    </svg>
  );
};

// ── Sketch underline ────────────────────────────────────────────────────────
const SketchUnderline: React.FC<{
  startFrame: number;
  width: number;
  color: string;
}> = ({ startFrame, width, color }) => {
  const frame = useCurrentFrame();
  const drawn = interpolate(frame, [startFrame, startFrame + 22], [0, width], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const mid = width / 2;
  return (
    <svg width={width} height={10} style={{ display: 'block', marginTop: 2, overflow: 'visible' }}>
      <path
        d={`M 0 5 Q ${mid * 0.5} 3 ${mid} 6 Q ${mid * 1.5} 8 ${drawn} 5`}
        fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"
        style={{ clipPath: `inset(0 ${width - drawn}px 0 0)` }}
      />
    </svg>
  );
};

const TECHNIQUES = [
  { num: '01', name: 'Zero-shot',         tagline: 'Just ask' },
  { num: '02', name: 'Role Prompting',    tagline: 'Give it a persona' },
  { num: '03', name: 'Few-shot',          tagline: 'Show before you tell' },
  { num: '04', name: 'Chain-of-Thought',  tagline: 'Think step by step' },
  { num: '05', name: 'Self-Consistency',  tagline: 'Vote on the best path' },
  { num: '06', name: 'Tree-of-Thoughts',  tagline: 'Explore then synthesise' },
  { num: '07', name: 'ReAct',             tagline: 'Reason → Act → Observe' },
  { num: '08', name: 'Prompt Chaining',   tagline: 'Break it into steps' },
];

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [OUTRO_DURATION - 20, OUTRO_DURATION], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── Section 1: "7 techniques." headline (0-90)
  const h1In = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const h1Y = interpolate(frame, [0, 22], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const h1Scale = interpolate(frame, [0, 10, 18], [0.85, 1.1, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const h2In = interpolate(frame, [30, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const h2Y = interpolate(frame, [30, 52], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Section 2: technique recap grid (80-320)
  const GRID_START = 80;
  const techIn = (i: number) => interpolate(
    frame,
    [GRID_START + i * 22, GRID_START + 18 + i * 22],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const techY2 = (i: number) => interpolate(
    frame,
    [GRID_START + i * 22, GRID_START + 18 + i * 22],
    [10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── Section 3: closing line (330-420)
  const closeIn = interpolate(frame, [330, 355], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const closeY = interpolate(frame, [330, 355], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const closeScale = interpolate(frame, [330, 338, 344], [0.9, 1.06, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ctaIn = interpolate(frame, [365, 390], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: fadeOut }}>
      {/* Grid */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.035 }}>
        {Array.from({ length: 19 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 68} y1={0} x2={(i + 1) * 68} y2={720} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 65} x2={1280} y2={(i + 1) * 65} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
      </svg>

      {/* ── Headline ── */}
      <div style={{ position: 'absolute', top: 60, left: 72 }}>
        <div style={{ opacity: h1In, transform: `translateY(${h1Y}px) scale(${h1Scale})`, transformOrigin: 'left center' }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-1.2px', lineHeight: 1.1 }}>
            8 techniques.{' '}
            <span style={{ color: GA.yellow, fontSize: 60 }}>One question.</span>
          </div>
          <SketchUnderline startFrame={18} width={620} color={`${GA.yellow}66`} />
        </div>

        <div style={{ opacity: h2In, transform: `translateY(${h2Y}px)`, marginTop: 10 }}>
          <div style={{ fontSize: 20, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '0.01em' }}>
            Eight completely different answers.
          </div>
        </div>
      </div>

      {/* ── Technique recap grid (2 cols) ── */}
      <div
        style={{
          position: 'absolute',
          top: 200, left: 72, right: 72,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px 40px',
        }}
      >
        {TECHNIQUES.map((t, i) => (
          <div
            key={i}
            style={{
              opacity: techIn(i),
              transform: `translateY(${techY2(i)}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: '10px 0',
              borderBottom: `1px solid ${GA.border}`,
            }}
          >
            {/* Drawn bullet line */}
            <div style={{ width: 28, paddingTop: 2, flexShrink: 0 }}>
              <DrawnLine
                startFrame={GRID_START + i * 22 - 4}
                width={16}
                color={`${GA.yellow}77`}
                thickness={1.5}
              />
            </div>

            {/* Number badge */}
            <div style={{ fontSize: 10, fontWeight: 700, color: GA.yellow, fontFamily: 'monospace', letterSpacing: '0.1em', background: `${GA.yellow}12`, border: `1px solid ${GA.yellow}33`, borderRadius: 3, padding: '1px 7px', marginRight: 12, flexShrink: 0 }}>
              {t.num}
            </div>

            {/* Name */}
            <div style={{ fontSize: 16, fontWeight: 700, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", marginRight: 10, flexShrink: 0 }}>
              {t.name}
            </div>

            {/* Tagline */}
            <div style={{ fontSize: 13, color: `${GA.muted}99`, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontStyle: 'italic' }}>
              — {t.tagline}
            </div>
          </div>
        ))}
      </div>

      {/* ── Closing line ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 120, left: 72, right: 72,
          opacity: closeIn,
          transform: `translateY(${closeY}px) scale(${closeScale})`,
          transformOrigin: 'left center',
        }}
      >
        <DrawnLine startFrame={330} width={1136} color={`${GA.border}`} thickness={1} duration={30} />
        <div style={{ marginTop: 20, fontSize: 28, fontWeight: 700, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.5px' }}>
          Prompt engineering is a design skill.
          <span style={{ color: GA.yellow }}> Not a shortcut.</span>
        </div>
      </div>

      {/* ── CTA ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 30, left: 72,
          opacity: ctaIn,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 13, lineHeight: 1.5, color: `${GA.muted}88`, fontStyle: 'normal', fontFamily: 'monospace', opacity: ctaIn }}>
          Practice them. Combine them. Apply them deliberately.
        </div>
        <DrawnLine startFrame={370} width={200} color={`${GA.yellow}55`} thickness={1} />
      </div>
    </AbsoluteFill>
  );
};

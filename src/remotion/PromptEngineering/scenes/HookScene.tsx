import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';

export const HOOK_DURATION = 600;

// ── Sketch drawn-line component ─────────────────────────────────────────────
const DrawnLine: React.FC<{
  startFrame: number;
  width: number;
  color: string;
  thickness?: number;
  duration?: number;
}> = ({ startFrame, width, color, thickness = 2, duration = 18 }) => {
  const frame = useCurrentFrame();
  const drawn = interpolate(frame, [startFrame, startFrame + duration], [0, width], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <svg width={width} height={thickness + 4} style={{ display: 'block', overflow: 'visible' }}>
      <line
        x1={0} y1={(thickness + 4) / 2}
        x2={drawn} y2={(thickness + 4) / 2}
        stroke={color} strokeWidth={thickness} strokeLinecap="round"
      />
    </svg>
  );
};

// ── Sketch underline below text ─────────────────────────────────────────────
const SketchUnderline: React.FC<{
  startFrame: number;
  width: number;
  color: string;
}> = ({ startFrame, width, color }) => {
  const frame = useCurrentFrame();
  const drawn = interpolate(frame, [startFrame, startFrame + 22], [0, width], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // Slightly wobbly path for hand-drawn feel
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

// ── Technique list ───────────────────────────────────────────────────────────
const TECHNIQUES = [
  { num: '01', name: 'Zero-shot',         tagline: 'Just ask — no examples, no context' },
  { num: '02', name: 'Role Prompting',    tagline: 'Give the AI a professional persona' },
  { num: '03', name: 'Few-shot',          tagline: 'Show the AI your format before asking' },
  { num: '04', name: 'Chain-of-Thought',  tagline: 'Make it reason out loud' },
  { num: '05', name: 'Self-Consistency',  tagline: 'Vote for the best answer' },
  { num: '06', name: 'Tree-of-Thoughts',  tagline: 'Explore every branch, pick the best' },
  { num: '07', name: 'ReAct',             tagline: 'Reason → Act → Observe → Repeat' },
  { num: '08', name: 'Prompt Chaining',   tagline: 'Break it into steps, feed each output forward' },
];

// Phase boundaries
const P1_START = 0;
const P1_END   = 155;
const P2_START = 170;
const P2_END   = 345;
const P3_START = 360;

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Phase 1: bad prompt ──────────────────────────────────────────────────
  const p1Opacity = interpolate(frame, [P1_START, 18, P1_END, P1_END + 18], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const badRespIn = interpolate(frame, [75, 105, P1_END, P1_END + 18], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const badLabelIn = interpolate(frame, [55, 78, P1_END, P1_END + 18], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── Phase 2: insight ─────────────────────────────────────────────────────
  const line1In = interpolate(frame, [P2_START, P2_START + 20, P2_END, P2_END + 18], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const line1Y = interpolate(frame, [P2_START, P2_START + 22], [20, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const line2In = interpolate(frame, [P2_START + 45, P2_START + 65, P2_END, P2_END + 18], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const line2Y = interpolate(frame, [P2_START + 45, P2_START + 67], [20, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Phase 2 insight punch on "It's the technique."
  const insightPunch = interpolate(frame, [P2_START + 45, P2_START + 53, P2_START + 60], [0.85, 1.1, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── Phase 3: technique list ───────────────────────────────────────────────
  const p3HeaderIn = interpolate(frame, [P3_START, P3_START + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // Each technique staggered 30 frames apart
  const techAppear = (i: number) => interpolate(
    frame,
    [P3_START + 30 + i * 28, P3_START + 48 + i * 28],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const techY = (i: number) => interpolate(
    frame,
    [P3_START + 30 + i * 28, P3_START + 48 + i * 28],
    [10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  // Drawn-line bullet appears just before text
  const bulletAppear = (i: number) => P3_START + 22 + i * 28;

  return (
    <AbsoluteFill style={{ background: GA.bg }}>
      {/* Subtle grid */}
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.035 }}>
        {Array.from({ length: 19 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 68} y1={0} x2={(i + 1) * 68} y2={720} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 65} x2={1280} y2={(i + 1) * 65} stroke={GA.yellow} strokeWidth={0.5} />
        ))}
      </svg>

      {/* ── PHASE 1: Bad prompt moment ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -54%)',
          width: 680, opacity: p1Opacity,
        }}
      >
        {/* Vague prompt card */}
        <div style={{ background: GA.surface, borderRadius: 6, borderLeft: '3px solid #ff5555', padding: '14px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: '#ff555577', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
            vague prompt
          </div>
          <div style={{ fontSize: 17, color: `${GA.muted}cc`, fontFamily: 'monospace', lineHeight: 1.6 }}>
            "How do I lose weight?"
          </div>
          <div style={{ fontSize: 17, color: `${GA.muted}cc`, fontFamily: 'monospace', lineHeight: 1.6 }}>
            "Why is my code slow?"
          </div>
        </div>

        {/* ✗ label */}
        <div style={{ opacity: badLabelIn, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#ff5555', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            ✗ vague prompt → generic, useless answer
          </div>
        </div>

        {/* Bad response */}
        <div style={{ opacity: badRespIn, background: `${GA.surface}aa`, borderRadius: 6, borderLeft: `3px solid ${GA.border}`, padding: '12px 16px' }}>
          <div style={{ fontSize: 9, color: `${GA.muted}55`, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>
            response
          </div>
          <div style={{ fontSize: 13, color: `${GA.muted}77`, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", lineHeight: 1.65 }}>
            "You should maintain a healthy diet and exercise regularly. For code, try using better algorithms and built-in functions where possible."
          </div>
        </div>
      </div>

      {/* ── PHASE 2: Insight ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        {/* Line 1 */}
        <div style={{ opacity: line1In, transform: `translateY(${line1Y}px)` }}>
          <div style={{ fontSize: 62, fontWeight: 800, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            The problem isn't the AI.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <SketchUnderline startFrame={P2_START + 28} width={480} color={GA.muted} />
          </div>
        </div>

        {/* Line 2 — with punch scale */}
        <div style={{ opacity: line2In, transform: `translateY(${line2Y}px) scale(${insightPunch})`, transformOrigin: 'center center', marginTop: 16 }}>
          <div style={{ fontSize: 62, fontWeight: 800, color: GA.yellow, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            It's the technique.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <SketchUnderline startFrame={P2_START + 72} width={370} color={GA.yellow} />
          </div>
        </div>
      </div>

      {/* ── PHASE 3: Technique list with taglines ─────────────────────────── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 24 }}>
        {/* Header */}
        <div style={{ position: 'absolute', top: 52, left: 72, opacity: p3HeaderIn }}>
          <div style={{ fontSize: 13, color: GA.yellow, fontFamily: 'monospace', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
            8 Techniques · One Question
          </div>
          <DrawnLine startFrame={P3_START + 8} width={340} color={`${GA.yellow}55`} thickness={1} />
        </div>

        {/* Technique rows */}
        <div style={{ position: 'absolute', top: 110, left: 72, right: 72 }}>
          {TECHNIQUES.map((t, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                marginBottom: 8,
                opacity: techAppear(i),
                transform: `translateY(${techY(i)}px)`,
              }}
            >
              {/* Drawn bullet */}
              <div style={{ width: 32, flexShrink: 0, paddingTop: 2 }}>
                <DrawnLine startFrame={bulletAppear(i)} width={20} color={`${GA.yellow}88`} thickness={1.5} />
              </div>

              {/* Number */}
              <div style={{ fontSize: 11, fontWeight: 700, color: `${GA.yellow}88`, fontFamily: 'monospace', letterSpacing: '0.1em', width: 32, flexShrink: 0 }}>
                {t.num}
              </div>

              {/* Name */}
              <div style={{ fontSize: 18, fontWeight: 700, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.3px', width: 230, flexShrink: 0 }}>
                {t.name}
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 16, background: GA.border, marginRight: 18, flexShrink: 0 }} />

              {/* Tagline */}
              <div style={{ fontSize: 15, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontStyle: 'italic' }}>
                {t.tagline}
              </div>
            </div>
          ))}
        </div>
      </div>

    </AbsoluteFill>
  );
};

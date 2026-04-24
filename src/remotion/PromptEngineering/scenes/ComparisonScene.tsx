import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';

const DURATION = 1380; // 46s @ 30fps

const TECHNIQUES = [
  { num: '01', name: 'Zero-shot',       desc: 'Generic baseline — useful as a starting point' },
  { num: '02', name: 'Role Prompting',  desc: 'Adds context and expertise, shaping tone and depth' },
  { num: '03', name: 'Few-shot',        desc: 'Enforces format and style through examples' },
  { num: '04', name: 'Chain-of-Thought',desc: 'Forces explicit reasoning, ideal for complex problems' },
  { num: '05', name: 'Self-Consistency',desc: 'Improves reliability by sampling multiple outputs' },
  { num: '06', name: 'Tree-of-Thoughts',desc: 'Explores competing approaches, synthesises the best' },
  { num: '07', name: 'ReAct',           desc: 'Integrates tool use with reasoning for dynamic tasks' },
  { num: '08', name: 'Prompt Chaining', desc: 'Decomposes complexity across a structured sequence' },
];

// Each card appears ~100 frames apart starting at frame 60
const CARD_START = 60;
const CARD_INTERVAL = 100;

interface TechCardProps {
  num: string;
  name: string;
  desc: string;
  appearFrame: number;
}

const TechCard: React.FC<TechCardProps> = ({ num, name, desc, appearFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearFrame, appearFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [appearFrame, appearFrame + 18], [14, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        background: GA.surface,
        borderRadius: 6,
        borderLeft: `2px solid ${GA.yellow}`,
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            fontSize: 10, fontWeight: 700, color: GA.yellow, fontFamily: 'monospace',
            letterSpacing: '0.1em', background: `${GA.yellow}12`,
            border: `1px solid ${GA.yellow}33`, borderRadius: 3, padding: '1px 7px',
            flexShrink: 0,
          }}
        >
          {num}
        </div>
        <div
          style={{
            fontSize: 15, fontWeight: 700, color: GA.text,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            letterSpacing: '-0.2px',
          }}
        >
          {name}
        </div>
      </div>
      <div
        style={{
          fontSize: 12, color: GA.muted,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          lineHeight: 1.5, fontStyle: 'italic',
        }}
      >
        {desc}
      </div>
    </div>
  );
};

export const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [DURATION - 18, DURATION], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const headerOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  // Combination callout appears after all 8 cards (~860 + 100 buffer)
  const COMBO_START = 960;
  const comboOpacity = interpolate(frame, [COMBO_START, COMBO_START + 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const comboY = interpolate(frame, [COMBO_START, COMBO_START + 20], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const comboLineOpacity = interpolate(frame, [COMBO_START + 30, COMBO_START + 50], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

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
          opacity: headerOpacity,
        }}
      >
        <div
          style={{
            fontSize: 28, fontWeight: 800, color: GA.text,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            letterSpacing: '-0.5px',
          }}
        >
          All 8 Techniques
        </div>
        <div
          style={{
            fontSize: 13, color: GA.muted,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontStyle: 'italic',
          }}
        >
          — same question, eight completely different approaches
        </div>
      </div>

      {/* 8-card grid (2 columns × 4 rows) */}
      <div
        style={{
          position: 'absolute', top: 80, left: 40, right: 40,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px 20px',
          height: 'calc(100% - 80px - 110px)',
        }}
      >
        {TECHNIQUES.map((t, i) => (
          <TechCard
            key={i}
            num={t.num}
            name={t.name}
            desc={t.desc}
            appearFrame={CARD_START + i * CARD_INTERVAL}
          />
        ))}
      </div>

      {/* Combination callout */}
      <div
        style={{
          position: 'absolute',
          bottom: 16, left: 40, right: 40,
          opacity: comboOpacity,
          transform: `translateY(${comboY}px)`,
        }}
      >
        <div
          style={{
            background: `${GA.yellow}0f`,
            border: `1px solid ${GA.yellow}44`,
            borderRadius: 8,
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 13, fontWeight: 700, color: GA.yellow,
              fontFamily: 'monospace', letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Techniques are not mutually exclusive — they can be combined
          </div>
          <div style={{ opacity: comboLineOpacity }}>
            <div
              style={{
                fontSize: 12, color: GA.muted,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontStyle: 'italic',
              }}
            >
              Role prompting + chain-of-thought, or few-shot + chaining, often outperforms either technique alone
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

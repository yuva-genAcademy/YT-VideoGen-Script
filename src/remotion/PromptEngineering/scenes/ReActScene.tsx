import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';
import { REACT_DATA } from '../data';

const DURATION = 570;
const STEP_REVEAL_INTERVAL = 68;

const TYPE_COLORS: Record<string, string> = {
  Thought: '#8B8BFF',
  Action: GA.yellow,
  Observation: '#6BFFB8',
  'Final Answer': '#FF8B8B',
};

interface StepRowProps {
  type: string;
  text: string;
  appearFrame: number;
}

const StepRow: React.FC<StepRowProps> = ({ type, text, appearFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearFrame, appearFrame + 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const x = interpolate(frame, [appearFrame, appearFrame + 14], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const color = TYPE_COLORS[type] ?? GA.muted;

  const isFinalAnswer = type === 'Final Answer';

  // Final Answer: scale(0.94 → 1.0) over 12 frames
  const finalAnswerScale = isFinalAnswer
    ? interpolate(frame, [appearFrame, appearFrame + 12], [0.94, 1.0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })
    : 1;

  // Flash background: yellow highlight that fades opacity 1 → 0 over 12 frames after appearing
  const flashOpacity = interpolate(
    frame,
    [appearFrame, appearFrame + 4, appearFrame + 16],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px) scale(${finalAnswerScale})`,
        transformOrigin: 'left center',
        position: 'relative',
      }}
    >
      {/* Flash highlight wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `${GA.yellow}18`,
          opacity: flashOpacity,
          pointerEvents: 'none',
          borderRadius: 2,
        }}
      />
      <div
        style={{
          display: 'flex', gap: 16, alignItems: 'flex-start',
          padding: '8px 0', borderBottom: `1px solid ${GA.border}`,
          borderLeft: isFinalAnswer ? `3px solid ${GA.yellow}` : undefined,
          paddingLeft: isFinalAnswer ? 8 : 0,
        }}
      >
        <div
          style={{
            fontSize: 10, color, fontFamily: 'monospace',
            letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
            minWidth: 100, flexShrink: 0, paddingTop: 2,
            borderRight: `1px solid ${color}44`, paddingRight: 12,
          }}
        >
          {type}
        </div>
        <div
          style={{
            fontSize: 14,
            color: isFinalAnswer ? GA.text : GA.muted,
            fontFamily: isFinalAnswer ? "'Helvetica Neue', Helvetica, Arial, sans-serif" : 'monospace',
            lineHeight: 1.55,
            fontWeight: isFinalAnswer ? 600 : 400,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export const ReActScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [DURATION - 15, DURATION], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const headerOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

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
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: GA.yellow, fontFamily: 'monospace', letterSpacing: '0.1em', border: `1px solid ${GA.yellow}44`, borderRadius: 4, padding: '2px 10px', background: `${GA.yellow}0a` }}>07</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.5px' }}>ReAct</div>
        <div style={{ fontSize: 13, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontStyle: 'italic' }}>— Reason → Act → Observe → Repeat</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: `${GA.yellow}88`, fontFamily: 'monospace', letterSpacing: '0.1em', background: `${GA.yellow}0d`, border: `1px solid ${GA.yellow}2a`, borderRadius: 4, padding: '3px 10px' }}>Model: claude-sonnet-4-6</div>
      </div>

      <div style={{ position: 'absolute', top: 80, left: 32, right: 32, bottom: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 9, color: `${GA.yellow}88`, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          "My Python code is slow. How do I make it faster?" — step-by-step reasoning trace
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: GA.surface, borderRadius: 8, borderLeft: `3px solid ${GA.yellow}`, padding: '10px 16px', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {REACT_DATA.coding.map((step, i) => (
            <StepRow key={i} type={step.type} text={step.text} appearFrame={20 + i * STEP_REVEAL_INTERVAL} />
          ))}
        </div>
      </div>

    </AbsoluteFill>
  );
};

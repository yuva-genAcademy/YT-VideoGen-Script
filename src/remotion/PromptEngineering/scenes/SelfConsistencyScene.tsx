import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';
import { SELF_CONSISTENCY } from '../data';

const DURATION = 600;
const STAGGER = 28;

interface MiniPanelProps {
  accentColor: string;
  prompt: string;
  response: string;
  appearFrame: number;
  responseStartFrame: number;
  responseEndFrame: number;
  label: string;
  isActive: boolean;
  hasOtherActive: boolean;
}

const MiniPanel: React.FC<MiniPanelProps> = ({
  accentColor, prompt, response, appearFrame, responseStartFrame, responseEndFrame, label,
  isActive, hasOtherActive,
}) => {
  const frame = useCurrentFrame();

  // Slide up on appear: translateY(15px → 0)
  const slideY = interpolate(frame, [appearFrame, appearFrame + 16], [15, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [appearFrame, appearFrame + 16], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const resOpacity = interpolate(frame, [responseStartFrame - 4, responseStartFrame + 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Dim when another panel is active (opacity 0.6)
  const dimOpacity = interpolate(
    frame,
    [responseStartFrame - 4, responseStartFrame + 6],
    [1, hasOtherActive ? 0.6 : 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Border color: yellow when active, dim otherwise
  const borderAlpha = isActive
    ? interpolate(frame, [responseStartFrame, responseStartFrame + 10], [0x33, 0xff], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })
    : 0x33;
  const borderAlphaHex = Math.round(borderAlpha).toString(16).padStart(2, '0');

  return (
    <div
      style={{
        opacity: opacity * dimOpacity,
        transform: `translateY(${slideY}px)`,
        background: GA.surface,
        borderRadius: 6,
        borderLeft: `2px solid ${accentColor}${borderAlphaHex}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <div style={{ padding: '5px 10px', borderBottom: `1px solid ${GA.border}`, flexShrink: 0, background: `${accentColor}08` }}>
        <span style={{ fontSize: 9, color: accentColor, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{ padding: '6px 10px', borderBottom: `1px solid ${GA.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: GA.text, fontFamily: 'monospace', lineHeight: 1.5 }}>
          {prompt}
        </div>
      </div>
      <div style={{ padding: '6px 10px', flex: 1, opacity: resOpacity }}>
        <div style={{ fontSize: 11, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", lineHeight: 1.6 }}>
          {response}
        </div>
      </div>
    </div>
  );
};

export const SelfConsistencyScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [DURATION - 15, DURATION], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const headerOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  // Callout fades in after all 3 panels have responded
  const calloutOpacity = interpolate(frame, [430, 450], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const calloutY = interpolate(frame, [430, 450], [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Panel response ranges
  const panelResponseStart = [140, 190, 240];
  const panelResponseEnd = [280, 340, 400];

  // Determine which panel is currently active (typing)
  const activePanel = panelResponseStart.findIndex(
    (start, i) => frame >= start && frame <= panelResponseEnd[i]
  );

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: sceneOpacity }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 72,
          background: GA.bg, borderBottom: `1px solid ${GA.border}`,
          display: 'flex', alignItems: 'center', padding: '0 40px', gap: 18,
          opacity: headerOpacity,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: GA.yellow, fontFamily: 'monospace', letterSpacing: '0.1em', border: `1px solid ${GA.yellow}55`, borderRadius: 4, padding: '2px 10px', background: `${GA.yellow}12` }}>
          05
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.5px' }}>
          Self-Consistency
        </div>
        <div style={{ fontSize: 13, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontStyle: 'italic' }}>
          — Vote for the best answer
        </div>
      </div>

      {/* 3 panels */}
      <div style={{ position: 'absolute', top: 80, left: 40, right: 40, bottom: 60, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 9, color: GA.muted, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          "My Python code is slow. How do I make it faster?" — 3 independent reasoning paths
        </div>
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          {SELF_CONSISTENCY.coding.map((item, i) => (
            <MiniPanel
              key={i}
              accentColor={GA.yellow}
              label={`path ${i + 1} — ${['same wording', 'rephrased', 'reframed'][i]}`}
              prompt={item.prompt}
              response={item.response}
              appearFrame={18 + i * STAGGER}
              responseStartFrame={panelResponseStart[i]}
              responseEndFrame={panelResponseEnd[i]}
              isActive={activePanel === i}
              hasOtherActive={activePanel !== -1 && activePanel !== i}
            />
          ))}
        </div>
      </div>

      {/* Single-line callout */}
      <div
        style={{
          position: 'absolute', bottom: 16, right: 40,
          opacity: calloutOpacity,
          transform: `translateY(${calloutY}px)`,
          background: `${GA.yellow}10`,
          border: `1px solid ${GA.yellow}55`,
          borderRadius: 6,
          padding: '6px 14px',
        }}
      >
        <div style={{ fontSize: 13, color: GA.yellow, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>
          All 3 paths agree — majority answer wins
        </div>
      </div>

    </AbsoluteFill>
  );
};

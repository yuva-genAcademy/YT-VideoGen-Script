import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';
import { CHAINING } from '../data';

const DURATION = 570;

interface ChainStepProps {
  stepNum: string;
  label: string;
  promptText: string;
  responseText: string;
  accentColor: string;
  appearFrame: number;
  responseAppearFrame: number;
  responseLabel?: string;
}

const ChainStep: React.FC<ChainStepProps> = ({
  stepNum, label, promptText, responseText, accentColor, appearFrame, responseAppearFrame, responseLabel,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearFrame, appearFrame + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const resOpacity = interpolate(frame, [responseAppearFrame, responseAppearFrame + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ opacity, background: GA.surface, borderRadius: 8, borderLeft: `3px solid ${accentColor}`, overflow: 'hidden', flex: 1 }}>
      <div style={{ padding: '7px 14px', borderBottom: `1px solid ${GA.border}`, background: `${accentColor}0a`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, fontFamily: 'monospace', background: `${accentColor}22`, borderRadius: 3, padding: '1px 7px' }}>{stepNum}</div>
        <span style={{ fontSize: 10, color: accentColor, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${GA.border}` }}>
        <div style={{ fontSize: 9, color: `${accentColor}77`, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>prompt</div>
        <div style={{ fontSize: 12, color: GA.text, fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{promptText}</div>
      </div>
      <div style={{ padding: '8px 14px', opacity: resOpacity }}>
        <div style={{ fontSize: 9, color: `${accentColor}77`, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
          {responseLabel ?? 'response → feeds into step 2'}
        </div>
        <div style={{ fontSize: 12, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{responseText}</div>
      </div>
    </div>
  );
};

const ArrowConnector: React.FC<{ appearFrame: number; color: string }> = ({ appearFrame, color }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearFrame, appearFrame + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, opacity, flexShrink: 0, width: 48 }}>
      <div style={{ width: 1, height: 24, background: `${color}55` }} />
      <div style={{ fontSize: 20, color, fontFamily: 'monospace' }}>→</div>
      <div style={{ fontSize: 8, color: `${color}88`, fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>feeds into</div>
      <div style={{ width: 1, height: 24, background: `${color}55` }} />
    </div>
  );
};

export const ChainingScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [DURATION - 15, DURATION], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  // Header slide down
  const headerSlideY = interpolate(frame, [0, 20], [-72, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  // Badge pop
  const badgeScale = interpolate(frame, [5, 18, 25], [0.5, 1.15, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Zoom punch-in when Step 2 appears (frame 220), shift right to focus on it
  const zoomScale = interpolate(frame, [220, 238, 480, 498], [1, 1.045, 1.045, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const zoomTranslateX = interpolate(frame, [220, 238, 480, 498], [0, 40, 40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Step 1 dims when Step 2 is being focused
  const step1Dim = interpolate(frame, [232, 248, 480, 496], [1, 0.45, 0.45, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

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
        <div style={{ fontSize: 12, fontWeight: 700, color: GA.yellow, fontFamily: 'monospace', letterSpacing: '0.1em', border: `1px solid ${GA.yellow}44`, borderRadius: 4, padding: '2px 10px', background: `${GA.yellow}0a`, transform: `scale(${badgeScale})`, display: 'inline-block' }}>08</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.5px' }}>Prompt Chaining</div>
        <div style={{ fontSize: 13, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontStyle: 'italic' }}>— Break it into steps — feed each output forward</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: `${GA.yellow}88`, fontFamily: 'monospace', letterSpacing: '0.1em', background: `${GA.yellow}0d`, border: `1px solid ${GA.yellow}2a`, borderRadius: 4, padding: '3px 10px' }}>Model: claude-sonnet-4-6</div>
      </div>

      <div
        style={{
          position: 'absolute', top: 80, left: 32, right: 32, bottom: 24, display: 'flex', flexDirection: 'column', gap: 8,
          transform: `scale(${zoomScale}) translateX(${zoomTranslateX}px)`,
          transformOrigin: 'center center',
        }}
      >
        <div style={{ fontSize: 9, color: `${GA.yellow}88`, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          "My Python code is slow." — two-stage diagnostic chain
        </div>
        <div style={{ display: 'flex', gap: 0, flex: 1 }}>
          <div style={{ flex: 1, opacity: step1Dim }}>
            <ChainStep
              stepNum="STEP 1"
              label="Diagnose"
              promptText={CHAINING.coding.step1Prompt}
              responseText={CHAINING.coding.step1Response}
              accentColor={GA.yellow}
              appearFrame={18}
              responseAppearFrame={120}
            />
          </div>
          <ArrowConnector appearFrame={200} color={GA.yellow} />
          <div style={{ flex: 1, position: 'relative' }}>
            <ChainStep
              stepNum="STEP 2"
              label="Action Plan"
              promptText={CHAINING.coding.step2Prompt}
              responseText={CHAINING.coding.step2Response}
              accentColor={GA.softYellow}
              appearFrame={220}
              responseAppearFrame={310}
              responseLabel="response — final output"
            />
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};

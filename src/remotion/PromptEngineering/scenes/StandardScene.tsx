import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';
import { PromptPanel } from '../components/PromptPanel';

interface StandardSceneProps {
  techniqueNum: string;
  techniqueName: string;
  tagline: string;
  codingPrompt: string;
  codingResponse: string;
  duration: number;
  callout?: string;
  codingPromptFontSize?: number;
}

export const StandardScene: React.FC<StandardSceneProps> = ({
  techniqueNum,
  techniqueName,
  tagline,
  codingPrompt,
  codingResponse,
  duration,
  callout,
  codingPromptFontSize = 12,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [duration - 20, duration], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const headerSlideY = interpolate(frame, [0, 20], [-72, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const headerOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  const badgeScale = interpolate(frame, [5, 18, 25], [0.5, 1.1, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const rSF = Math.floor(duration * 0.28);
  const rEF = Math.floor(duration * 0.88);

  const panelOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const panelSlideY = interpolate(frame, [10, 30], [12, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Subtle zoom
  const zoomScale = interpolate(
    frame,
    [rSF, rSF + 15, rEF, rEF + 15],
    [1, 1.03, 1.03, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Callout
  const calloutFrame = rEF + 15;
  const calloutOpacity = interpolate(frame, [calloutFrame, calloutFrame + 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const calloutY = interpolate(frame, [calloutFrame, calloutFrame + 14], [8, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: GA.bg, opacity: sceneOpacity }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 72,
          background: GA.bg, borderBottom: `1px solid ${GA.border}`,
          display: 'flex', alignItems: 'center', padding: '0 40px', gap: 18,
          opacity: headerOpacity,
          transform: `translateY(${headerSlideY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: GA.yellow, fontFamily: 'monospace',
            letterSpacing: '0.1em', border: `1px solid ${GA.yellow}55`, borderRadius: 4,
            padding: '2px 10px', background: `${GA.yellow}12`, flexShrink: 0,
            transform: `scale(${badgeScale})`, display: 'inline-block',
          }}
        >
          {techniqueNum}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: GA.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.5px' }}>
          {techniqueName}
        </div>
        <div style={{ fontSize: 13, color: GA.muted, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontStyle: 'italic' }}>
          — {tagline}
        </div>
      </div>

      {/* Coding panel — full width */}
      <div
        style={{
          position: 'absolute', top: 80, left: 40, right: 40, bottom: 24,
          opacity: panelOpacity,
          transform: `translateY(${panelSlideY}px) scale(${zoomScale})`,
          transformOrigin: 'center center',
        }}
      >
        <PromptPanel
          label="Coding"
          accentColor={GA.yellow}
          promptText={codingPrompt}
          responseText={codingResponse}
          responseStartFrame={rSF}
          responseEndFrame={rEF}
          appearFrame={10}
          promptFontSize={codingPromptFontSize}
        />
      </div>

      {/* Callout */}
      {callout && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 48,
            opacity: calloutOpacity,
            transform: `translateY(${calloutY}px)`,
            background: `${GA.yellow}10`,
            border: `1px solid ${GA.yellow}55`,
            borderRadius: 6,
            padding: '8px 16px',
          }}
        >
          <div style={{ fontSize: 13, color: GA.yellow, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>
            {callout}
          </div>
        </div>
      )}

    </AbsoluteFill>
  );
};

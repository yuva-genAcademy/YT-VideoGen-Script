import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { GA } from '../colors';

interface PromptPanelProps {
  label: string;
  accentColor: string;
  promptText: string;
  responseText: string;
  responseStartFrame: number;
  responseEndFrame?: number; // unused, kept for backwards compat
  appearFrame?: number;
  promptFontSize?: number;
  responseFontSize?: number;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  label,
  accentColor,
  promptText,
  responseText,
  responseStartFrame,
  responseEndFrame,
  appearFrame = 0,
  promptFontSize = 12,
  responseFontSize = 13,
}) => {
  const frame = useCurrentFrame();

  const panelOpacity = interpolate(frame, [appearFrame, appearFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Response appears instantly (3-frame snap) at responseStartFrame
  const responseOpacity = interpolate(frame, [responseStartFrame, responseStartFrame + 3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity: panelOpacity,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: GA.surface,
        borderRadius: 8,
        borderLeft: `3px solid ${accentColor}`,
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '7px 14px',
          borderBottom: `1px solid ${GA.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          background: `${accentColor}0a`,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor }} />
        <span
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: accentColor,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>

      {/* Prompt */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `1px solid ${GA.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: `${accentColor}77`,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 5,
            fontFamily: 'monospace',
          }}
        >
          prompt
        </div>
        <div
          style={{
            fontSize: promptFontSize,
            color: GA.text,
            fontFamily: 'monospace',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
          }}
        >
          {promptText}
        </div>
      </div>

      {/* Response */}
      <div
        style={{
          padding: '10px 14px',
          flex: 1,
          overflow: 'hidden',
          opacity: responseOpacity,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: `${accentColor}77`,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 5,
            fontFamily: 'monospace',
          }}
        >
          response ↳ {label === 'Coding' ? 'claude-sonnet-4-6' : 'claude-sonnet-4-6'}
        </div>
        <div
          style={{
            fontSize: responseFontSize,
            color: GA.muted,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {responseText}
        </div>
      </div>
    </div>
  );
};

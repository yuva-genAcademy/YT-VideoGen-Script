import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface TypewriterTextProps {
  text: string;
  startFrame: number;
  endFrame: number;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, startFrame, endFrame, style }) => {
  const frame = useCurrentFrame();
  const charsVisible = Math.floor(
    interpolate(frame, [startFrame, endFrame], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const visible = text.slice(0, charsVisible);
  const showCursor = charsVisible < text.length && frame >= startFrame;

  return (
    <span style={style}>
      {visible}
      {showCursor && (
        <span style={{ opacity: Math.floor(frame / 7) % 2 === 0 ? 1 : 0, color: '#FEFB41' }}>▌</span>
      )}
    </span>
  );
};

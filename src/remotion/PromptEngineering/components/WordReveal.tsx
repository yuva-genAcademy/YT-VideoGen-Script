import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface WordRevealProps {
  text: string;
  startFrame: number;
  framesPerWord?: number;
  highlightWords?: string[];
  color?: string;
  highlightColor?: string;
  fontSize?: number;
  fontStyle?: React.CSSProperties['fontStyle'];
  lineHeight?: number;
  fontFamily?: string;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  startFrame,
  framesPerWord = 3,
  highlightWords = [],
  color = '#FFFFFF',
  highlightColor = '#FEFB41',
  fontSize = 16,
  fontStyle = 'italic',
  lineHeight = 1.5,
  fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif",
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');

  return (
    <span style={{ fontFamily, fontSize, lineHeight, fontStyle, display: 'block' }}>
      {words.map((word, i) => {
        const wf = startFrame + i * framesPerWord;
        const opacity = interpolate(frame, [wf, wf + 5], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        const scale = interpolate(frame, [wf, wf + 6, wf + 11], [0.6, 1.18, 1.0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        const clean = word.toLowerCase().replace(/[.,!?'"]/g, '');
        const isHighlight = highlightWords.some(hw => clean === hw.toLowerCase());

        return (
          <span
            key={i}
            style={{
              opacity,
              display: 'inline-block',
              transform: `scale(${scale})`,
              transformOrigin: 'bottom center',
              marginRight: '0.28em',
              color: isHighlight ? highlightColor : color,
              fontWeight: isHighlight ? 800 : 400,
              fontStyle: isHighlight ? 'normal' : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

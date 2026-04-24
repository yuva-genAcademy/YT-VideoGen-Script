import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface HighlightBoxProps {
  startFrame: number;
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
  drawDuration?: number;
  /** Extra glow opacity that pulses after draw completes */
  glow?: boolean;
}

/**
 * SVG rectangle border that draws itself around content.
 * Position the parent as position:relative; this overlays absolutely.
 */
export const HighlightBox: React.FC<HighlightBoxProps> = ({
  startFrame,
  width,
  height,
  color,
  strokeWidth = 2.5,
  drawDuration = 22,
  glow = false,
}) => {
  const frame = useCurrentFrame();
  const perimeter = 2 * (width + height);
  const drawn = interpolate(frame, [startFrame, startFrame + drawDuration], [0, perimeter], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glowOpacity = glow
    ? interpolate(
        frame,
        [startFrame + drawDuration, startFrame + drawDuration + 10, startFrame + drawDuration + 24],
        [0, 0.35, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 0;

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Glow fill */}
      {glow && (
        <rect x={0} y={0} width={width} height={height} fill={color} opacity={glowOpacity} rx={4} />
      )}
      {/* Draw-in border */}
      <rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={width - strokeWidth}
        height={height - strokeWidth}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter - drawn}
        strokeLinecap="round"
        opacity={opacity}
        rx={4}
      />
    </svg>
  );
};

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

/**
 * White flash at the very start of a scene — simulates a hard cut.
 * Place inside AbsoluteFill at z-index 999.
 */
export const FlashCut: React.FC<{ color?: string; intensity?: number }> = ({
  color = '#FFFFFF',
  intensity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5], [intensity, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: color,
        opacity,
        pointerEvents: 'none',
        zIndex: 999,
      }}
    />
  );
};

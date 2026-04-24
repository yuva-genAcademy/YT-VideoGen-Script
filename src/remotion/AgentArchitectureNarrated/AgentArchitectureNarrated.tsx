import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { TitleScene } from './scenes/TitleScene';
import { SingleAgentScene } from './scenes/SingleAgentScene';
import { MultiAgentScene } from './scenes/MultiAgentScene';
import { ComparisonScene } from './scenes/ComparisonScene';
import { YTVideoGenLogo } from './components/YTVideoGenLogo';

// Script-synced narrated video composition
// Total: 8955 frames at 30fps = 298.5s
// Scenes: Title(900) + SingleAgent(2700) + MultiAgent(2700) + Comparison(2700)
// Overlaps: 15 frames between each scene (crossfade)
//
// Timeline (global frames):
//   TitleScene       0    –  900   (30 s)
//   SingleAgent      885  – 3585   (90 s, overlaps Title by 15f)
//   MultiAgent      3570  – 6270   (90 s, overlaps SingleAgent by 15f)
//   Comparison      6255  – 8955   (90 s, overlaps MultiAgent by 15f)
//   Total: 8955 frames @ 30 fps ≈ 5 min

const OVERLAP = 15;
const T = 900;                      // TitleScene duration
const SA = T + 2700 - OVERLAP;     // 3585
const MA = SA + 2700 - OVERLAP;    // 6270
const CMP = MA + 2700 - OVERLAP;   // 8955

export const NARRATED_TOTAL_DURATION = CMP; // 8955 frames ≈ 298.5 s ≈ 5 min

export const NarratedAgentArchitecture: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={900} premountFor={OVERLAP}>
        <TitleScene />
      </Sequence>
      <Sequence from={T - OVERLAP} durationInFrames={2700} premountFor={OVERLAP}>
        <SingleAgentScene />
      </Sequence>
      <Sequence from={SA - OVERLAP} durationInFrames={2700} premountFor={OVERLAP}>
        <MultiAgentScene />
      </Sequence>
      <Sequence from={MA - OVERLAP} durationInFrames={2700} premountFor={OVERLAP}>
        <ComparisonScene />
      </Sequence>
      <YTVideoGenLogo />
    </AbsoluteFill>
  );
};

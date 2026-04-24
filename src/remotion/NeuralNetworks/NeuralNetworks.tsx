import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { TitleScene } from './scenes/TitleScene';
import { NeuronScene } from './scenes/NeuronScene';
import { LayersScene } from './scenes/LayersScene';
import { TrainingScene } from './scenes/TrainingScene';
import { OutroScene } from './scenes/OutroScene';
import { YTVideoGenLogo } from "./components/YTVideoGenLogo";

// 60 seconds @ 30fps = 1800 frames
// Title:    0    → 180   (6 s)
// Neuron:   165  → 615   (15 s, overlaps Title by 15f)
// Layers:   600  → 1200  (20 s, overlaps Neuron by 15f)
// Training: 1185 → 1545  (12 s, overlaps Layers by 15f)
// Outro:    1530 → 1800  (9 s,  overlaps Training by 15f)

const OVERLAP = 15;
export const NEURAL_NETWORK_DURATION = 1800;

export const NeuralNetworks: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={180} premountFor={OVERLAP}>
      <TitleScene />
    </Sequence>
    <Sequence from={165} durationInFrames={450} premountFor={OVERLAP}>
      <NeuronScene />
    </Sequence>
    <Sequence from={600} durationInFrames={600} premountFor={OVERLAP}>
      <LayersScene />
    </Sequence>
    <Sequence from={1185} durationInFrames={360} premountFor={OVERLAP}>
      <TrainingScene />
    </Sequence>
    <Sequence from={1530} durationInFrames={270} premountFor={OVERLAP}>
      <OutroScene />
    </Sequence>
    <YTVideoGenLogo />
  </AbsoluteFill>
);

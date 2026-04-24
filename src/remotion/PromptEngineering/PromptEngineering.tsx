import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { HookScene, HOOK_DURATION } from './scenes/HookScene';
import { BasePromptScene, BASE_PROMPT_DURATION } from './scenes/BasePromptScene';
import { StandardScene } from './scenes/StandardScene';
import { SelfConsistencyScene } from './scenes/SelfConsistencyScene';
import { ToTScene } from './scenes/ToTScene';
import { ReActScene } from './scenes/ReActScene';
import { ChainingScene } from './scenes/ChainingScene';
import { ComparisonScene } from './scenes/ComparisonScene';
import { OutroScene, OUTRO_DURATION } from './scenes/OutroScene';
import { ZERO_SHOT, FEW_SHOT, ROLE, COT } from './data';

// ─── Scene durations ───────────────────────────────────────────────────────
const D_HOOK  = HOOK_DURATION;        // 600  (20s)
const D_BASE  = BASE_PROMPT_DURATION; // 360  (12s)
const D_ZERO  = 540;                  // 18s
const D_ROLE  = 510;                  // 17s  ← before Few-shot
const D_FEW   = 510;                  // 17s
const D_COT   = 600;                  // 20s
const D_SC    = 600;                  // 20s
const D_TOT   = 600;                  // 20s
const D_REACT = 570;                  // 19s
const D_CHAIN = 570;                  // 19s
const D_COMP  = 1380;                 // 46s
const D_OUTRO = OUTRO_DURATION;       // 570  (19s)

const OL = 15; // crossfade overlap (frames)

// ─── Start frames ──────────────────────────────────────────────────────────
const F_HOOK  = 0;
const F_BASE  = F_HOOK  + D_HOOK  - OL;
const F_ZERO  = F_BASE  + D_BASE  - OL;
const F_ROLE  = F_ZERO  + D_ZERO  - OL;
const F_FEW   = F_ROLE  + D_ROLE  - OL;
const F_COT   = F_FEW   + D_FEW   - OL;
const F_SC    = F_COT   + D_COT   - OL;
const F_TOT   = F_SC    + D_SC    - OL;
const F_REACT = F_TOT   + D_TOT   - OL;
const F_CHAIN = F_REACT + D_REACT - OL;
const F_COMP  = F_CHAIN + D_CHAIN - OL;
const F_OUTRO = F_COMP  + D_COMP  - OL;

export const PROMPT_ENGINEERING_DURATION = F_OUTRO + D_OUTRO;

export const PromptEngineering: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 01 — Introduction */}
      <Sequence from={F_HOOK} durationInFrames={D_HOOK} premountFor={OL}>
        <HookScene />
      </Sequence>

      {/* 02 — Base Prompt */}
      <Sequence from={F_BASE} durationInFrames={D_BASE} premountFor={OL}>
        <BasePromptScene />
      </Sequence>

      {/* 03 — Zero-shot */}
      <Sequence from={F_ZERO} durationInFrames={D_ZERO} premountFor={OL}>
        <StandardScene
          techniqueNum="01"
          techniqueName="Zero-shot"
          tagline="Just ask — no examples, no context"
          codingPrompt={ZERO_SHOT.coding.prompt}
          codingResponse={ZERO_SHOT.coding.response}
          duration={D_ZERO}
          callout="Both answers are accurate — but feel like a Wikipedia article"
        />
      </Sequence>

      {/* 04 — Role Prompting */}
      <Sequence from={F_ROLE} durationInFrames={D_ROLE} premountFor={OL}>
        <StandardScene
          techniqueNum="02"
          techniqueName="Role Prompting"
          tagline="Give the AI a professional persona"
          codingPrompt={ROLE.coding.prompt}
          codingResponse={ROLE.coding.response}
          duration={D_ROLE}
          codingPromptFontSize={10}
          callout="Coding AI leads with profiling — exactly what a real engineer does first"
        />
      </Sequence>

      {/* 05 — Few-shot */}
      <Sequence from={F_FEW} durationInFrames={D_FEW} premountFor={OL}>
        <StandardScene
          techniqueNum="03"
          techniqueName="Few-shot"
          tagline="Show the AI your format before asking"
          codingPrompt={FEW_SHOT.coding.prompt}
          codingResponse={FEW_SHOT.coding.response}
          duration={D_FEW}
          codingPromptFontSize={10}
          callout="Response compressed to match the examples — zero fluff"
        />
      </Sequence>

      {/* 06 — Chain-of-Thought */}
      <Sequence from={F_COT} durationInFrames={D_COT} premountFor={OL}>
        <StandardScene
          techniqueNum="04"
          techniqueName="Chain-of-Thought"
          tagline="Make it reason out loud before answering"
          codingPrompt={COT.coding.prompt}
          codingResponse={COT.coding.response}
          duration={D_COT}
          codingPromptFontSize={11}
          callout="It asked 'what kind of slow?' before prescribing anything"
        />
      </Sequence>

      {/* 07 — Self-Consistency */}
      <Sequence from={F_SC} durationInFrames={D_SC} premountFor={OL}>
        <SelfConsistencyScene />
      </Sequence>

      {/* 08 — Tree-of-Thoughts */}
      <Sequence from={F_TOT} durationInFrames={D_TOT} premountFor={OL}>
        <ToTScene />
      </Sequence>

      {/* 09 — ReAct */}
      <Sequence from={F_REACT} durationInFrames={D_REACT} premountFor={OL}>
        <ReActScene />
      </Sequence>

      {/* 10 — Prompt Chaining */}
      <Sequence from={F_CHAIN} durationInFrames={D_CHAIN} premountFor={OL}>
        <ChainingScene />
      </Sequence>

      {/* 11 — Comparison */}
      <Sequence from={F_COMP} durationInFrames={D_COMP} premountFor={OL}>
        <ComparisonScene />
      </Sequence>

      {/* 12 — Conclusion */}
      <Sequence from={F_OUTRO} durationInFrames={D_OUTRO} premountFor={OL}>
        <OutroScene />
      </Sequence>

    </AbsoluteFill>
  );
};

---
name: narrated-video
description: Rules for generating script-synced Remotion videos with TTS narration, including timing, word count, and animation beat mapping
metadata:
  tags: tts, script, narration, timing, sync, wpm, 160wpm, script-sync
---

# Narrated Video — Script + Animation Sync

Use this rule whenever building a Remotion video that will be narrated by a TTS voice.

---

## Hard constraints

| Constraint | Value |
|---|---|
| Max video duration | **4 minutes 20 seconds (260 seconds)** |
| Max total frames | **7800 frames at 30fps** |
| TTS speaking rate | **160 words per minute** |
| Max total word count | **693 words** (= 260s ÷ 60 × 160) |
| Frames per word | **11.25 frames** (= 30fps ÷ (160÷60)) |

Never exceed the 4:20 cap. Always verify: `totalWords / 160 * 60 <= 260`.

---

## Script writing rules

### Structure
- Divide the script into sections matching the video scenes
- Each section's word count = `sceneDurationSeconds / 60 * 160`
- Use short, declarative sentences — TTS reads them cleanly
- No markdown formatting in the script (no `**bold**`, no `[timestamps]`)
- No timestamps or cue markers in the output fed to TTS

### Section word budgets (example 4-scene video at 160 wpm):
| Scene | Duration | Word budget |
|---|---|---|
| Title / Intro | 20s | ~53 words |
| Scene 2 | 80s | ~213 words |
| Scene 3 | 80s | ~213 words |
| Scene 4 | 80s | ~213 words |
| **Total** | **260s** | **≤693 words** |

Adjust scene durations as needed but total must stay ≤ 260s.

### Pacing
- At 160 wpm, 1 word = 0.375 seconds = 11.25 frames
- Short sentences (5–8 words) = natural pauses between visual beats
- Use sentence breaks to time visual transitions

---

## Animation timing — syncing frames to words

Every animation trigger must be calculated from word position in the script:

```
frame = wordIndex * 11.25
```

### Workflow
1. Write the full script first
2. Number every word cumulatively within each scene (starting at 1 for the first word of the scene)
3. For each visual event ("node appears", "line draws", "badge pops in"), find the word being spoken at that moment
4. Set `TRIGGER_FRAME = wordIndex * 11.25`, rounded to nearest integer
5. Start the animation 10–15 frames **before** the trigger so the visual is arriving *as* the word is spoken, not after

### Example frame calculation
```
// Script: "Watch the connections form." = cumulative word 60 in scene
// Frame = 60 * 11.25 = 675
// Start animation at 665 (10-frame lead-in)
const CONNECTIONS_IN = 665;
```

---

## Scene duration formula

For a scene with N words of narration:
```
sceneDurationFrames = ceil(N / 160 * 60 * 30) + holdFrames
```
Add ~45 holdFrames (1.5s) at the end of each scene for the last visual to settle before the transition.

---

## Animation trigger naming convention

Define all frame triggers as named constants at the top of each scene file:

```ts
// ─── FRAME TRIGGERS (script-synced at 160 wpm, 11.25 frames/word) ───
const ELEMENT_IN   = 80;    // word N "quoted narration text"
const ELEMENT2_IN  = 230;   // word N "quoted narration text"
const LINES_IN     = 665;   // word N "Watch the connections form"
const QUEUE_IN     = 1655;  // word N "watch the queue"
```

Always comment each constant with the word index and the narration fragment that triggers it.

---

## Spotlight / highlight pattern

When narration describes a specific element, dim everything else:

```tsx
// Fade spotlight in/out over 15 frames at each boundary
const spot = interpolate(
  frame,
  [SPOT_START, SPOT_START + 15, SPOT_END - 15, SPOT_END],
  [0, 1, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
const anySpot = Math.max(spotA, spotB, spotC);

// Apply to each element:
const elementOpacity = 1 - anySpot * (1 - ownSpot) * 0.6;
```

---

## Per-element highlight rings

When the narrator mentions a specific node, briefly pulse a glow ring around it:

```tsx
const highlight = interpolate(
  frame,
  [HL_START, HL_START + 30, HL_END],
  [0, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

// In SVG:
<circle r={r + 20} fill={color} opacity={highlight * 0.4} />
```

Highlight window = 60 frames (2 seconds), centered on when word is spoken.

---

## Scene crossfade

Use 15-frame overlap between scenes:
- Each scene fades in: `interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })`
- Each scene fades out: `interpolate(frame, [DUR - 15, DUR], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`
- `sceneOpacity = Math.min(fadeIn, fadeOut)` applied to outer `<AbsoluteFill>`
- In main composition: `<Sequence from={prevEnd - 15} premountFor={15}>`
- Total duration = sum of scene durations − (15 × number of transitions)

---

## Full scene timing checklist

Before writing any animation code:
- [ ] Script section written and word-counted
- [ ] Total words ≤ 693 (≤ 4:20)
- [ ] Scene duration in frames calculated
- [ ] Every visual event mapped to a word index → frame number
- [ ] All trigger constants defined and commented at top of scene file
- [ ] All trigger constants start 10–15 frames before the spoken word
- [ ] Animations take 20–30 frames to complete (not instant, not slow)
- [ ] Scene ends with ~45 frame hold after last animation

---

## SVG safe zone (1280×720)

- Title: y = 28–85
- SVG diagram: y = 100–615
- Description panel: y = 615–720

Never place SVG elements outside the y = 100–615 range.

---
name: website-to-video
description: 7-step automated pipeline for converting a website into a video
metadata:
  tags: website, capture, pipeline, automation, brand, script, tts
---

## Overview

HyperFrames includes a full automated pipeline to turn any website into a polished video in 7 steps.

```bash
# Setup (once)
npx skills add heygen-com/hyperframes

# Then describe:
# "Create a 25-second product launch video from https://example.com.
#  Bold, cinematic, dark theme energy."
```

## The 7 steps

### Step 1 — Capture

Extract screenshots, design assets, fonts, and brand colors from the target URL.

```bash
npx hyperframes capture https://example.com
```

Output: `brand/` directory with:
- `screenshot.png` — full-page screenshot
- `logo.png` — extracted logo
- `fonts/` — web fonts in use
- `brand.md` — color palette + typography reference

### Step 2 — Design

AI generates a brand reference guide:
- Primary / secondary / accent colors
- Headline and body font names
- Spacing and layout rhythm
- Visual tone (minimal, bold, playful, etc.)

### Step 3 — Script

Write narration text structured around a story arc:
- **Hook** (0–3s): attention-grabbing opener
- **Problem** (3–10s): pain point or context
- **Solution** (10–20s): product/service answer
- **Proof** (20–28s): evidence, features, stats
- **CTA** (28–35s): clear next step

### Step 4 — Storyboard

Map script sections to visual scenes:
- Scene backgrounds (screenshot, video, solid color)
- Key UI moments to highlight
- Transition styles between scenes
- Text overlay placement and timing

### Step 5 — VO + Timing

Generate text-to-speech and extract word-level timestamps:

```bash
npx hyperframes tts --file script.txt --output vo.mp3
npx hyperframes transcribe vo.mp3 --output timing.json
```

`timing.json` format:
```json
{
  "words": [
    { "word": "Introducing", "start": 0.0, "end": 0.5 },
    { "word": "your", "start": 0.5, "end": 0.7 },
    ...
  ]
}
```

Use word timestamps to sync text reveals and highlight animations to speech.

### Step 6 — Build

Scaffold the composition and build each scene:

```bash
npx hyperframes init product-launch
```

Structure a multi-scene HTML file:
- Each scene as a `<div class="clip">` with timing attributes
- GSAP animations synced to word timestamps
- Brand fonts loaded from captured font files
- Brand colors as CSS custom properties

### Step 7 — Validate & Render

```bash
npx hyperframes lint           # check for structural issues
npx hyperframes snapshot --time 5   # preview key frames
npx hyperframes preview        # live browser review
npx hyperframes render --output launch.mp4 --quality high
```

---

## Warm-start prompt patterns

Describe the source + tone to generate the video:

```
"Create a 20-second product launch video from https://stripe.com.
 Clean, minimal, dark background with blue accents. No voiceover."

"Turn https://linear.app into a 30-second SaaS demo.
 Fast-paced cuts, snappy transitions, corporate-clean energy."

"Build a 15-second social reel from https://arc.net.
 Bold typography, cinematic zoom transitions, portrait format."
```

## Tone → design mapping

| Tone | Background | Typography | Transitions |
|------|-----------|------------|-------------|
| Cinematic | Dark, gradient | Large serif or clean sans | Domain warp, light leak |
| Corporate | White or light gray | Clean sans-serif | Push, wipe |
| Bold/Hype | Black | Heavy weight, all-caps | Flash, glitch, scale pop |
| Playful | Colorful gradient | Rounded font | Bounce, swirl |
| Minimal | White | Thin/light weight | Crossfade, blur |

## Syncing text to voiceover

From `timing.json`, animate reveals at exact word timestamps:

```js
const words = [
  { word: "Introducing", start: 0.0 },
  { word: "Stripe", start: 0.5 },
  { word: "Checkout", start: 0.9 },
];

// Reveal each word at its timestamp
words.forEach((w, i) => {
  tl.from(`#word-${i}`, { opacity: 0, y: 10, duration: 0.2 }, w.start);
});
```

## Brand colors as CSS variables

```html
<style>
  :root {
    --brand-bg: #0a0a0a;
    --brand-primary: #635bff;   /* extracted from brand guide */
    --brand-text: #ffffff;
    --brand-accent: #00d4ff;
  }
</style>
```

Then reference in all styles and GSAP color animations:
```js
tl.to(".highlight", {
  backgroundColor: "var(--brand-primary)",
  duration: 0.3
}, 2);
```

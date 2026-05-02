---
name: HyperFrames
description: Best practices for HyperFrames - HTML-native video creation for AI agents
metadata:
  tags: hyperframes, video, html, gsap, animation, heygen
---

## What is HyperFrames

HyperFrames converts HTML-based compositions into MP4/WebM/MOV video files. It is HTML-native (no React, no build step), deterministic (same input → same video), and AI-agent optimized. Built by HeyGen, Apache 2.0 license.

The tagline: **"Write HTML. Render video. Built for agents."**

## When to use

Load this skill whenever you are building or editing a HyperFrames composition or working with any `hyperframes` CLI command.

## Core concepts

- **Composition** – An HTML file with `data-composition-id` on the root element. Clips are child elements with `class="clip"` and timing data attributes.
- **GSAP timeline** – The animation engine. Always `{ paused: true }`, registered as `window.__timelines["id"]`.
- **Frame adapter** – The rendering engine seeks the GSAP timeline frame-by-frame (no wall-clock time).
- **Determinism** – Identical composition → identical video. No `Math.random()`, no unseeded values, no network fetches at render time.

## How to use

Load individual rule files for detailed explanations and code examples:

- [rules/compositions.md](rules/compositions.md) - HTML composition structure, root element, clip types, `data-*` attributes
- [rules/animations.md](rules/animations.md) - GSAP animation patterns, timeline registration, easing vocabulary
- [rules/timing.md](rules/timing.md) - Data attributes for timing (`data-start`, `data-duration`, `data-track-index`, relative refs)
- [rules/media.md](rules/media.md) - Video, image, audio elements — embed, trim, volume
- [rules/transitions.md](rules/transitions.md) - Scene transitions and the shader-transitions catalog
- [rules/catalog.md](rules/catalog.md) - 50+ pre-built blocks (social, UI, VFX) via `npx hyperframes add`
- [rules/preview.md](rules/preview.md) - **Standard preview.html template** — always create alongside index.html; open after every change; never render until user asks
- [rules/rendering.md](rules/rendering.md) - CLI render command, quality/format/fps/GPU/Docker options — only run when user explicitly asks
- [rules/cli.md](rules/cli.md) - Full CLI reference (init, preview, lint, snapshot, tts, transcribe, capture)
- [rules/determinism.md](rules/determinism.md) - Determinism rules — what is and isn't allowed in scripts
- [rules/common-mistakes.md](rules/common-mistakes.md) - Top pitfalls and how to fix them
- [rules/website-to-video.md](rules/website-to-video.md) - 7-step website-to-video automated pipeline
- [rules/prompting.md](rules/prompting.md) - Vocabulary and patterns for describing videos to AI agents
- [rules/sketch-educational-style.md](rules/sketch-educational-style.md) - Design system for white-background sketch-inspired educational videos — fonts, underlines, cards, colors, anti-patterns
- [rules/brand-gen-academy.md](rules/brand-gen-academy.md) - The Gen Academy brand palette, white-background color adaptation, card classes, arrow markers, 160 wpm narration pace
- [rules/tts-pipeline.md](rules/tts-pipeline.md) - **Beat-granular TTS + Whisper word-level alignment pipeline (DEFAULT for all narrated videos)** — beats, adelay stitching, openai-whisper sync, make_gsap(), sub-phase wrappers

## Quick start

```bash
npx hyperframes init my-video    # Scaffold project
npx hyperframes preview          # Live dev server
# Render only when user explicitly asks
npx hyperframes render --output out.mp4
```

## Mandatory rules (always apply)

1. Register GSAP timelines: `window.__timelines["id"] = tl`
2. Mute `<video>` elements: add `muted` attribute
3. Never use `Math.random()` — breaks determinism
4. Use synchronous timeline construction only
5. Every timed element needs `class="clip"` and timing data attributes
6. GSAP timeline must be `{ paused: true }`
7. `window.__timelines` key must match `data-composition-id`
8. Always create two script files alongside every composition:
   - `SCRIPT.md` — full annotated script with timestamps, word counts, scene beats, and recording notes
   - `SCRIPT_CLEAN.md` — narration-only, no timestamps, no symbols, no stage directions; ready to paste into a TTS model. Expand all contractions (it's → it is, don't → do not) so TTS models read cleanly. **Write all numbers as full words** — TTS reads numerals digit by digit (30,000 → "three zero zero zero"). Write `thirty thousand`, `one hundred twenty eight thousand`, etc.
9. **Always create `preview.html` alongside every `index.html`** — see [rules/preview.md](rules/preview.md) for the standard template. Open it with `npx hyperframes preview` after every change so the user can review animations without rendering.
10. **Never run `npx hyperframes render` unless the user explicitly asks to render or create a video.** After building or modifying a composition, always open the preview instead.
11. **Always include the Gen Academy logo watermark** in every composition. Place it as a permanently visible element (not a `.scene`, no opacity animation) at `position:absolute; bottom:28px; right:28px; z-index:100` inside `#root`. Use the standard black badge with brain-lightbulb SVG icon, yellow `#FEFB41` separator, "Gen Academy" wordmark in white, and tagline "AI Skills That Advance Careers." in yellow. Copy the exact HTML snippet from any existing `index.html` in `src/hyperframes/`.
12. **Every narrated composition MUST use the beat-granular + Whisper pipeline** — see [rules/tts-pipeline.md](rules/tts-pipeline.md). Never generate a composition with voiceover without running `openai-whisper` alignment. Stitch-only timestamps are not acceptable as final output. Install with `pip install openai-whisper` before starting any video+audio task.

# Gen Academy — AI Video Production System

AI-powered video production pipeline for Gen Academy course modules. Converts a topic into a fully narrated, animated video using **HyperFrames** (HTML → MP4), **Kokoro TTS** (voice synthesis), and **OpenAI Whisper** (word-level audio-video sync).

---

## How it works

```
Topic
  ↓
SCRIPT.md          Annotated script — scenes, word counts, beat markers
SCRIPT_CLEAN.md    TTS-ready narration — no symbols, no contractions, numbers as words
  ↓
index.html         HyperFrames composition — 1920×1080 HTML + GSAP timeline
  ↓
build_narration.py
  ├── Step 1: TTS — one audio clip per visual beat (Kokoro voice: bm_george)
  ├── Step 2: Stitch — adelay mixing → narration.wav
  ├── Step 3: Whisper — word-level alignment → beat_timestamps.json
  └── Step 4: Patch — regenerate entire GSAP <script> from real speech timestamps
  ↓
preview.html       Dev player — play/pause/scrub before rendering
  ↓
npx hyperframes render → .mp4
```

**Why Whisper is required:** TTS speaking rate varies by sentence length and punctuation. Stitch math gives you clip-start time, not speech-start time. Whisper detects the exact millisecond the narrator says each beat's first word and pins every animation to that moment.

---

## Modules

| # | Module | Duration | Status |
|---|--------|----------|--------|
| 01 | Prompt Engineering | ~4:00 | Rendered |
| 02 | Neural Networks & Backpropagation | ~5:00 | Rendered |
| 03 | Tokens & Tokenization | ~5:00 | Rendered |
| 04 | Transformer Architecture | ~5:00 | Rendered |
| 05 | How AI Is Trained | ~5:00 | Built |

---

## Project structure

```
.agents/skills/HyperFrames/       AI agent skill definition
  SKILL.md                        Entry point — all mandatory rules
  rules/
    tts-pipeline.md               Beat-granular + Whisper pipeline (canonical reference)
    brand-gen-academy.md          Color system, typography, card classes
    sketch-educational-style.md   White-background design system
    animations.md                 GSAP patterns
    compositions.md               HTML composition structure
    rendering.md                  Render CLI options
    cli.md                        Full HyperFrames CLI reference
    common-mistakes.md            Top pitfalls
    ...

src/hyperframes/<ModuleName>/
  index.html                      HyperFrames composition (1920×1080)
  preview.html                    Dev player
  SCRIPT.md                       Annotated script with scene/beat markers
  SCRIPT_CLEAN.md                 TTS-ready narration text
  audio/
    build_narration.py            Full pipeline: TTS → stitch → Whisper → GSAP patch
    narration.wav                 Final stitched voiceover
    narration.json                Whisper word-level output (cached)
    beat_timestamps.json          Whisper-aligned start/duration per beat
  renders/                        Output .mp4 files

SCRIPT_PROMPT.md                  Prompt template — generate a new module script
VIDEO_PROMPT.md                   Prompt template — generate video + audio from a script
```

---

## Prerequisites

```bash
# Node
npx hyperframes --version   # should print 0.4.x+

# Python
pip install openai-whisper   # word-level audio-video alignment
# ffmpeg must be in PATH (brew install ffmpeg on macOS)
```

---

## Creating a new module

### Step 1 — Generate the script

Use `SCRIPT_PROMPT.md` with Claude or any capable model. Output:
- `SCRIPT.md` — annotated with scene/beat markers, word counts, timing windows
- `SCRIPT_CLEAN.md` — TTS-ready narration (no contractions, no symbols, numbers as words)

### Step 2 — Create the composition

```
Prompt: "Use the HyperFrames skill to create a video for [Module Name].
         Here is the script: [paste SCRIPT.md]"
```

This generates `index.html` and `preview.html`. See `VIDEO_PROMPT.md` for the full prompt template.

### Step 3 — Build audio + sync

```bash
# Install Whisper if not already done
pip install openai-whisper

# Run the full pipeline (TTS → stitch → Whisper → GSAP patch)
python3 src/hyperframes/<ModuleName>/audio/build_narration.py

# Preview — verify audio-video sync before rendering
cd src/hyperframes/<ModuleName> && npx hyperframes preview
```

### Step 4 — Render

Only when the preview looks correct:

```bash
npx hyperframes render src/hyperframes/<ModuleName> \
  --output src/hyperframes/<ModuleName>/renders/<ModuleName>.mp4
```

---

## Fixing sync issues

If animations appear before audio, always re-run the pipeline — never manually edit GSAP timing in `index.html`. The entire `<script>` block is regenerated from Whisper timestamps on every build.

```bash
# Re-run Whisper + re-patch GSAP (no TTS re-generation)
python3 src/hyperframes/<ModuleName>/audio/build_narration.py --gsap-only
```

---

## Design system

**Gen Academy brand (white-background adaptation):**

| Element | Value |
|---------|-------|
| Background | `#FDFCFB` with 60px grid |
| Heading font | Nunito 800 |
| Body font | DM Sans |
| Code/labels | JetBrains Mono |
| Primary accent | `#FEFB41` (borders, underlines, highlights) |
| Dark text | `#1C1917` |
| Navy accent | `#202E4A` |
| Yellow rule | **Never on text** — borders and decorative elements only |

All scenes use white-flash transitions between scene changes. Sub-phase wrappers (fade-in → fade-out) keep max ~4 elements visible simultaneously.

---

## Key rules (enforced by the skill)

1. Whisper alignment is mandatory — stitch-only timestamps are never acceptable as final output
2. One beat per visual state change — never bundle unrelated elements into one beat
3. `make_gsap()` owns the entire GSAP script — never hand-edit timing after building
4. All scene transitions derived from `ns()` — never hardcode next-scene start times
5. Never run `npx hyperframes render` unless the user explicitly asks to render
6. Every composition needs `preview.html` — open it after every change

---

## Tech stack

| Layer | Tool |
|-------|------|
| Video rendering | [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen, Apache 2.0) |
| Animation | [GSAP](https://greensock.com/gsap/) |
| Voice synthesis | Kokoro TTS via `npx hyperframes tts` (voice: `bm_george`) |
| Audio alignment | [OpenAI Whisper](https://github.com/openai/whisper) |
| Audio mixing | ffmpeg `adelay` + `amix` |

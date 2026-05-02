# Video Generation Prompt — Gen Academy

Use this prompt when turning a completed script into a full HyperFrames video with synced narration. Requires SCRIPT.md and SCRIPT_CLEAN.md to already exist.

---

## Step 1 — Generate the composition

Send this prompt to Claude with the HyperFrames skill loaded:

```
Use the HyperFrames skill to create a Gen Academy course video.

MODULE NAME: [e.g. "How AI Is Trained"]
COMPOSITION ID: [kebab-case, e.g. "how-ai-is-trained"]
OUTPUT PATH: src/hyperframes/[ModuleName]/

Here is the full annotated script:
[paste SCRIPT.md contents here]

REQUIREMENTS

Design system:
- 1920×1080, white background (#FDFCFB) with 60px dot-grid overlay
- Fonts: Nunito 800 for headings, DM Sans for body, JetBrains Mono for labels/code
- Accent color: #FEFB41 (yellow) — for borders, SVG underlines, bullet dots only. Never on body text.
- Dark text: #1C1917. Navy accent: #202E4A for secondary headings.
- Card styles: black border (.card-black), yellow border (.card-yellow), navy border (.card-navy), red border (.card-red)
- White flash overlay (#flash) between every scene transition
- Gen Academy logo watermark — bottom-right, always visible, copy from any existing index.html

Composition structure:
- Every scene is a <div class="scene"> with opacity:0 initially
- All scenes animate via a single GSAP timeline: gsap.timeline({ paused: true })
- Register as: window.__timelines["[composition-id]"] = tl
- The GSAP <script> block will be completely replaced by build_narration.py — use placeholder timings (0, 5, 10...) for now
- Include <audio id="vo" class="clip" src="audio/narration.wav" data-start="0" data-volume="1" data-track-index="10">

Scene layout rules:
- Max ~4 elements visible simultaneously per scene
- For scenes with 4+ visual states: use sub-phase wrapper divs (#s3-pa, #s3-pb, #s3-pc...)
  Each phase fades out 0.3s before the next fades in
- Scene title: position:absolute; top:52px; left:120px; Nunito 800; 52px; color #1C1917
- Scene title underline: SVG path with stroke-dasharray/stroke-dashoffset draw-on animation
- Content area: top:170px; left:120px; right:120px

Content per scene (from SCRIPT.md):
[describe each scene's visual structure based on the "On screen:" lines in the script]

Also create:
- preview.html alongside index.html with the standard HyperFrames dev player
  (Play/Pause, Restart, scrubber, scene label, timecode display)
- audio/build_narration.py with all beats from SCRIPT.md
  (beat text from SCRIPT_CLEAN.md, one beat per visual state change)

After creating the files, tell me the exact command to run to build the audio.
Do NOT run npx hyperframes render.
```

---

## Step 2 — Build audio + sync

Once the composition is created:

```bash
# Install Whisper (one-time)
pip install openai-whisper

# Run the full pipeline
# Generates TTS clips → stitches → Whisper alignment → patches GSAP
python3 src/hyperframes/[ModuleName]/audio/build_narration.py
```

This takes 3–8 minutes depending on script length. Output:
- `audio/narration.wav` — final stitched voiceover
- `audio/beat_timestamps.json` — Whisper-aligned start/duration per beat
- `audio/narration.json` — cached Whisper word-level output
- `index.html` — GSAP script block fully rewritten with real timestamps

---

## Step 3 — Preview

```bash
cd src/hyperframes/[ModuleName]
npx hyperframes preview
```

Open the preview player and verify:
- Animations appear at the same time or slightly after the narrator says the phrase
- No scene overlap — each scene fully fades before the next appears
- White flash fires cleanly between scenes
- Audio plays throughout

---

## Step 4 — Iterate (if sync is off)

If specific animations are still early or late, re-run GSAP patching only (no TTS regeneration):

```bash
python3 src/hyperframes/[ModuleName]/audio/build_narration.py --gsap-only
```

If you need to adjust the within-beat stagger offsets (the small `+0.3`, `+0.8` values in `make_gsap()`), edit those directly in `build_narration.py` and run `--gsap-only` again.

**Never manually edit timing values in `index.html`** — the next build will overwrite them.

---

## Step 5 — Render

Only when the preview is approved:

```bash
npx hyperframes render src/hyperframes/[ModuleName] \
  --output src/hyperframes/[ModuleName]/renders/[ModuleName].mp4
```

---

## Common issues and fixes

| Issue | Fix |
|-------|-----|
| Animations appear before audio | Run full pipeline — Whisper timestamps will fix it |
| Scene N overlaps Scene N-1 | All transitions use `ns()` function — re-run pipeline to regenerate |
| "RAG" said as letters R-A-G | Change to "Rag" in the beat text in build_narration.py |
| TTS clip sounds wrong | Edit the beat text in BEATS[], re-run full pipeline |
| Whisper misses a beat phrase | Check that beat text matches SCRIPT_CLEAN.md verbatim (first 4 words) |
| Audio file not playing in preview | Ensure `src="audio/narration.wav"` path is correct and file exists |
| Too many elements on screen | Add sub-phase wrapper divs; fade out each phase before next begins |

---

## beat_narration.py quick reference

```python
# BEATS structure — one entry per visual state change
BEATS = [
    {"id": "s01_intro", "scene": 1,
     "text": "Exact words from SCRIPT_CLEAN.md that trigger this element."},
    # ...
]

# Constants to set at the top of the file
VOICE     = "bm_george"     # Gen Academy standard voice
SCENE_GAP = 1.5             # seconds of silence between scenes

# Run full pipeline
python3 audio/build_narration.py

# Re-patch GSAP only (after editing make_gsap offsets)
python3 audio/build_narration.py --gsap-only
```

---

## Quality checklist before rendering

- [ ] Whisper aligned ≥ 90% of beats (check pipeline output)
- [ ] Preview plays without overlap between scenes
- [ ] No animation appears more than ~0.5s before the narrator says the phrase
- [ ] Audio plays continuously throughout with no gaps
- [ ] Gen Academy watermark visible in bottom-right corner
- [ ] Total duration matches the script timing map (within ±5s)

---
name: tts-pipeline
description: End-to-end pipeline for generating section-by-section voiceover with Qwen3-TTS voice cloning and embedding it into a HyperFrames composition
metadata:
  tags: tts, voiceover, audio, qwen, voice-clone, pipeline, narration, timestamps
---

## Overview

Every HyperFrames composition that needs narration follows this pipeline:

```
SCRIPT_CLEAN.md
      ↓
Qwen3-TTS (voice cloned from reference recording)
      ↓  (one audio file per script section)
Stitch sections + silence gaps → narration.wav
      ↓
timestamps.json (actual start/end per section)
      ↓
Embed <audio> into index.html
      ↓
npx hyperframes render
```

No manual audio editing. No re-recording. Runs entirely from the notebook.

---

## Prerequisites

- `qwen_tts`, `librosa`, `soundfile`, `numpy` installed in the Python environment
- A reference voice recording (`.m4a`, `.wav`, or `.mp3`) from the presenter
- A `SCRIPT_CLEAN.md` — narration-only, no symbols, no contractions

---

## File structure

```
<composition>/
  index.html
  SCRIPT.md           ← annotated script with timestamps + beats
  SCRIPT_CLEAN.md     ← TTS-ready script (no symbols, contractions expanded)
  audio/
    01_<section>.wav  ← individual section audio
    02_<section>.wav
    ...
    narration.wav     ← final stitched voiceover
    timestamps.json   ← actual start/end times per section
```

---

## Notebook structure

Every composition's TTS notebook (`tts.ipynb`) has exactly these cells in order:

### Cell 1 — Model loading

```python
from qwen_tts import Qwen3TTSModel
import librosa
import numpy as np

model = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
    device_map="auto"
)

def generate_with_wpm(model, text, ref_audio, ref_text, target_wpm=160):
    wavs, sr = model.generate_voice_clone(
        ref_audio=ref_audio,
        ref_text=ref_text,
        text=text
    )
    wav = wavs[0]
    word_count = len(text.strip().split())
    duration_seconds = len(wav) / sr
    current_wpm = (word_count / duration_seconds) * 60 if duration_seconds > 0 else 0
    print(f"Original WPM: {current_wpm:.2f}")
    if current_wpm > 0:
        speed_factor = target_wpm / current_wpm
        print(f"Applying speed factor: {speed_factor:.2f} to reach {target_wpm} WPM")
        wav = librosa.effects.time_stretch(wav, rate=speed_factor)
    return [wav], sr
```

### Cell 2 — Reference voice

```python
# Points to the presenter's reference recording.
# This is what the model clones — pronunciation, tone, energy.
ReferenceAudio = "Text-to-speech-model/yuva'recording.m4a"
ReferenceText  = """<paste the voice training passage here>"""
```

The `ReferenceText` must match the actual spoken content of the recording as closely as possible. Use the voice training passage from `Text-to-speech-model/` for this.

### Cell 3 — Script sections

```python
SILENCE_GAP_SECONDS = 0.5   # breathing room between scenes
TARGET_WPM          = 160   # The Gen Academy standard pace

SECTIONS = [
    { "id": "01_<scene>", "label": "<Scene Name>", "text": "<TTS-ready narration>" },
    { "id": "02_<scene>", "label": "<Scene Name>", "text": "<TTS-ready narration>" },
    # ...one entry per scene in the composition
]
```

**Rules for section text:**
- Copy directly from `SCRIPT_CLEAN.md`
- No dashes, asterisks, quotes, or markdown
- No contractions — `it is`, `do not`, `you are` etc.
- Each section = one continuous spoken segment (no mid-section scene cuts)

**`id` naming:** zero-padded two-digit prefix + snake_case label, e.g. `03_base_prompt`

### Cell 4 — Generate, stitch, save timestamps

```python
import os, json, numpy as np, soundfile as sf

OUTPUT_DIR = "src/hyperframes/<CompositionName>/audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

section_wavs = []
section_sample_rate = None
timestamps = []
cursor = 0.0

for section in SECTIONS:
    print(f"\n[{section['id']}] {section['label']}")
    wavs, sr = generate_with_wpm(
        model,
        text=section["text"],
        ref_audio=ReferenceAudio,
        ref_text=ReferenceText,
        target_wpm=TARGET_WPM
    )
    wav = wavs[0]
    section_sample_rate = sr
    duration = len(wav) / sr

    sf.write(os.path.join(OUTPUT_DIR, f"{section['id']}.wav"), wav, sr)
    print(f"  Saved  ({duration:.2f}s)")

    timestamps.append({
        "id": section["id"], "label": section["label"],
        "start": round(cursor, 3), "end": round(cursor + duration, 3),
        "duration": round(duration, 3)
    })
    section_wavs.append(wav)
    cursor += duration

    if section != SECTIONS[-1]:
        silence = np.zeros(int(SILENCE_GAP_SECONDS * sr), dtype=wav.dtype)
        section_wavs.append(silence)
        cursor += SILENCE_GAP_SECONDS

narration = np.concatenate(section_wavs)
sf.write(os.path.join(OUTPUT_DIR, "narration.wav"), narration, section_sample_rate)

with open(os.path.join(OUTPUT_DIR, "timestamps.json"), "w") as f:
    json.dump({
        "total_duration": round(len(narration) / section_sample_rate, 3),
        "sample_rate": section_sample_rate,
        "sections": timestamps
    }, f, indent=2)

print(f"\nTotal: {len(narration)/section_sample_rate:.2f}s")
for t in timestamps:
    print(f"  {t['id']}  {t['start']:.2f}s → {t['end']:.2f}s")
```

### Cell 5 — Embed audio into index.html

```python
import json

HTML_PATH        = "src/hyperframes/<CompositionName>/index.html"
TIMESTAMPS_PATH  = "src/hyperframes/<CompositionName>/audio/timestamps.json"

with open(TIMESTAMPS_PATH) as f:
    ts_data = json.load(f)

with open(HTML_PATH) as f:
    html = f.read()

AUDIO_TAG = '''
  <!-- NARRATION — generated by tts.ipynb -->
  <audio id="vo"
         class="clip"
         src="audio/narration.wav"
         data-start="0"
         data-volume="1"
         data-track-index="10">
  </audio>
'''

if 'id="vo"' not in html:
    html = html.replace('  <div id="flash">', AUDIO_TAG + '  <div id="flash">')

with open(HTML_PATH, "w") as f:
    f.write(html)

print("Audio embedded.")
print("\nTimestamps — align GSAP scene starts to these:")
for s in ts_data["sections"]:
    print(f"  {s['label']:<25} {s['start']:>7.2f}s → {s['end']:>7.2f}s")
print(f"\nRun: npx hyperframes render --output out/<CompositionName>.mp4")
```

---

## Syncing GSAP to audio

After Cell 5 runs, use the printed timestamps to update the GSAP scene start times in `index.html`. Each scene's `tl.set('#sN', { opacity:1 }, START)` value should match the section's `start` time from `timestamps.json`.

**The audio is the source of truth** — the animation follows the narration, not the other way around.

---

## HyperFrames audio element reference

```html
<audio id="vo"
       class="clip"
       src="audio/narration.wav"
       data-start="0"
       data-volume="1"
       data-track-index="10">
</audio>
```

- `data-start="0"` — narration starts at the beginning of the composition
- `data-volume="1"` — full volume for voiceover
- `data-track-index="10"` — high index to avoid conflicts with visual clip tracks

---

## Standard settings (The Gen Academy)

| Setting | Value |
|---------|-------|
| Target WPM | 160 |
| Silence gap between sections | 0.5s |
| TTS model | `Qwen/Qwen3-TTS-12Hz-1.7B-Base` |
| Reference audio | `Text-to-speech-model/yuva'recording.m4a` |
| Audio output path | `src/hyperframes/<Composition>/audio/` |
| Final file | `narration.wav` |
| Timestamps file | `timestamps.json` |

---

## Mandatory rules

1. Always split by section — never generate the full script as one call. Section-by-section lets you regenerate individual scenes without re-running everything.
2. Always save `timestamps.json` — it is the bridge between audio and animation.
3. Always use `SCRIPT_CLEAN.md` as the text source, never the annotated `SCRIPT.md`.
4. The `ReferenceText` must be transcribed from the actual reference recording — mismatches degrade voice clone quality.
5. Do not change `data-track-index` below 10 — visual clips use lower indices.

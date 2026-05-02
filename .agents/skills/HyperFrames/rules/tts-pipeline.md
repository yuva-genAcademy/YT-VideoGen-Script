---
name: tts-pipeline
description: End-to-end beat-granular TTS pipeline with Whisper word-level alignment for perfectly synced HyperFrames narration
metadata:
  tags: tts, voiceover, audio, sync, beats, pipeline, narration, timestamps, whisper, alignment
---

## Overview

Every HyperFrames composition that includes narration **must** use the beat-granular + Whisper pipeline.
Stitch-only timing is never acceptable as the final output — Whisper alignment is the default, not an option.

```
SCRIPT.md  →  define BEATS (one per visual cue)
                  ↓
        TTS: one clip per beat  (npx hyperframes tts)
                  ↓
     Stitch clips with adelay → narration.wav
                  ↓
     openai-whisper: word-level timestamps on narration.wav
     (install: pip install openai-whisper)
                  ↓
     _find_phrase() maps each BEAT → exact speech start time
                  ↓
     beat_timestamps.json  (whisper-aligned start per beat)
                  ↓
     make_gsap() rewrites entire <script> in index.html
     every animation anchored to real speech timing
                  ↓
     npx hyperframes render
```

**Why Whisper is required:** TTS speaking rate varies across sentences, clauses, and punctuation. Even with perfectly split beat clips, stitch math gives you the start-of-clip time, not the start-of-speech. Whisper detects the actual moment the narrator says the first word of each beat and pins the animation to that exact timestamp. Without it, every animation can appear 1–4 seconds early.

---

## Why earlier approaches failed

| Approach | Failure mode |
|---|---|
| One TTS clip per scene, hand-estimated beat times | Drifts 3–8s per scene. Compounds across 5+ elements. |
| Beat-granular TTS, stitch-only timestamps | Beat start = clip start, not speech start. 0.5–2s early per beat. |
| Beat-granular TTS + Whisper alignment | Exact. The animation fires when the narrator says the word. ✓ |

---

## Required installation

```bash
pip install openai-whisper
```

PyTorch must be available (`pip install torch` if not). Whisper `base` model is sufficient for word-level alignment.

---

## File structure

```
<composition>/
  index.html              ← GSAP rewritten by build_narration.py
  SCRIPT.md               ← annotated script with beat markers
  SCRIPT_CLEAN.md         ← full narration text (TTS-clean, for reference)
  audio/
    build_narration.py    ← beat-granular TTS + Whisper aligner + GSAP patcher
    narration.wav         ← final stitched voiceover
    narration.json        ← Whisper word-level output (cached)
    beat_timestamps.json  ← whisper-aligned start/duration per beat
    _tmp_beats/           ← per-beat wav files (deleted after build)
```

---

## BEATS definition

A beat is the smallest unit of narration that corresponds to one visual state change.

```python
BEATS = [
    # text = exactly what narrator says when that element should appear
    # Must match SCRIPT_CLEAN.md verbatim — same words, no contractions, no symbols

    {"id": "s01_intro", "scene": 1,
     "text": "Nearly every major language model in production today is built on a transformer."},

    {"id": "s01_body", "scene": 1,
     "text": "GPT, Claude, Gemini, Llama. If you are making decisions about AI infrastructure..."},

    # Between scenes: SCENE_GAP = 1.5s silence inserted automatically
    # Within a scene: clips concatenate directly (0 gap)

    {"id": "s03_sa", "scene": 3,
     "text": "First, self-attention. Tokens exchange information across the sequence."},

    {"id": "s03_ff", "scene": 3,
     "text": "Second, a feed-forward network. Two linear transformations applied independently."},
]
```

**Beat granularity rules:**
- One beat per sentence or clause that triggers a new element
- One beat per bullet point on summary slides
- Never combine two unrelated visuals into one beat — you lose sync on the second element
- Minimum text: ~5 words (TTS handles short clips fine)

---

## build_narration.py structure (canonical template)

Every composition must have a `build_narration.py` with exactly these sections:

### 1. Constants

```python
VOICE      = "bm_george"
SCENE_GAP  = 1.5   # seconds of silence between scenes
AUDIO_DIR  = os.path.dirname(os.path.abspath(__file__))
COMP_DIR   = os.path.dirname(AUDIO_DIR)
HTML_PATH  = os.path.join(COMP_DIR, "index.html")
TMP_DIR    = os.path.join(AUDIO_DIR, "_tmp_beats")
OUTPUT_WAV = os.path.join(AUDIO_DIR, "narration.wav")
TS_PATH    = os.path.join(AUDIO_DIR, "beat_timestamps.json")
WX_JSON    = os.path.join(AUDIO_DIR, "narration.json")
```

### 2. Step 1 — TTS (one clip per beat)

```python
def build_beat_wavs():
    os.makedirs(TMP_DIR, exist_ok=True)
    wavs = []
    for i, beat in enumerate(BEATS):
        wav = os.path.join(TMP_DIR, f"{beat['id']}.wav")
        txt = wav.replace(".wav", ".txt")
        with open(txt, "w") as f:
            f.write(beat["text"])
        run(["npx", "--yes", "hyperframes", "tts",
             "--file", txt, "--output", wav, "--voice", VOICE])
        wavs.append(wav)
    return wavs
```

### 3. Step 2 — Stitch with adelay

```python
def stitch(beat_wavs):
    beat_starts = {}
    beat_durs   = {}
    t = 0.0
    prev_scene = None

    for beat, wav in zip(BEATS, beat_wavs):
        if prev_scene is not None and beat["scene"] != prev_scene:
            t = round(t + SCENE_GAP, 3)
        beat_starts[beat["id"]] = round(t, 3)
        dur = get_duration(wav)
        beat_durs[beat["id"]] = round(dur, 3)
        t = round(t + dur, 3)
        prev_scene = beat["scene"]

    total_dur = round(t + 1.5, 2)

    inputs, filter_parts, mix_labels = [], [], []
    for idx, (beat, wav) in enumerate(zip(BEATS, beat_wavs)):
        inputs += ["-i", wav]
        ms  = int(beat_starts[beat["id"]] * 1000)
        lbl = f"[a{idx}]"
        filter_parts.append(f"[{idx}]adelay={ms}|{ms}{lbl}")
        mix_labels.append(lbl)

    n  = len(BEATS)
    fc = ";".join(filter_parts)
    fc += f";{''.join(mix_labels)}amix=inputs={n}:normalize=0:dropout_transition=0[out]"

    run(["ffmpeg", "-y"] + inputs + [
        "-filter_complex", fc, "-map", "[out]", "-t", str(total_dur), OUTPUT_WAV,
    ])
    return beat_starts, beat_durs
```

### 4. Step 3 — Whisper alignment (DEFAULT — always run)

```python
def run_whisper():
    """
    Word-level alignment using openai-whisper.
    This is the default sync method — always run before patching GSAP.
    Install: pip install openai-whisper
    """
    try:
        import whisper
    except ImportError:
        print("  ✗  openai-whisper not installed — run: pip install openai-whisper")
        print("     Whisper alignment is required for correct sync.")
        print("     Falling back to stitch times (SYNC WILL BE APPROXIMATE).\n")
        return None

    print("  Loading whisper model (base) …")
    model  = whisper.load_model("base")
    result = model.transcribe(OUTPUT_WAV, language="en", word_timestamps=True)

    words = []
    for seg in result.get("segments", []):
        for w in seg.get("words", []):
            if "start" in w and "end" in w:
                words.append({
                    "word":  w["word"].strip(),
                    "start": float(w["start"]),
                    "end":   float(w["end"]),
                })

    with open(WX_JSON, "w") as f:
        json.dump({"segments": result.get("segments", [])}, f)

    print(f"  ✓  Whisper aligned {len(words)} words\n")
    return words


def _load_cached_words():
    """Load word list from narration.json cached by a prior Whisper run."""
    if not os.path.exists(WX_JSON):
        return []
    with open(WX_JSON) as f:
        data = json.load(f)
    words = []
    for seg in data.get("segments", []):
        for w in seg.get("words", []):
            if "start" in w and "end" in w:
                words.append({
                    "word":  w["word"].strip(),
                    "start": float(w["start"]),
                    "end":   float(w["end"]),
                })
    return words


def _norm(text):
    text = unicodedata.normalize("NFD", text.lower())
    text = re.sub(r"[^\w\s]", " ", text)
    return [w for w in text.split() if w]


def _find_phrase(words, phrase, start_idx=0):
    """Find first 4 words of phrase in word list, return speech start time."""
    query     = _norm(phrase)[:4]
    norm_list = [(_norm(w["word"])[0] if _norm(w["word"]) else "__") for w in words]
    for i in range(start_idx, len(norm_list) - len(query) + 1):
        if norm_list[i : i + len(query)] == query:
            return words[i]["start"], i + len(query)
    return None, start_idx


def refine_with_whisper(beat_starts, beat_durs, words):
    """Replace stitch-based times with Whisper word-level times."""
    if not words:
        return beat_starts, beat_durs
    hits, misses, cursor = 0, 0, 0
    for beat in BEATS:
        t, cursor = _find_phrase(words, beat["text"], cursor)
        if t is not None:
            old = beat_starts[beat["id"]]
            beat_starts[beat["id"]] = round(t, 3)
            hits += 1
            drift = round(t - old, 3)
            flag  = f"  Δ{drift:+.2f}s" if abs(drift) > 0.1 else ""
            print(f"  ✓  {beat['id']:20s}  {old:.2f}s → {t:.2f}s{flag}")
        else:
            misses += 1
            print(f"  ✗  {beat['id']:20s}  not found — keeping {beat_starts[beat['id']]:.2f}s")
    print(f"\n  Whisper: {hits}/{hits+misses} beats aligned\n")
    return beat_starts, beat_durs
```

### 5. Step 4 — make_gsap(T, D)

```python
def make_gsap(T, D):
    def at(bid, offset=0.0): return round(T.get(bid, 0.0) + offset, 2)
    def end(bid):            return round(T.get(bid, 0.0) + D.get(bid, 3.0), 2)
    def out(bid, tail=1.2):  return round(end(bid) + tail, 2)
    def fi(bid, tail=1.2):   return round(out(bid, tail) + 0.3, 2)
    def fo(bid, tail=1.2):   return round(fi(bid, tail) + 0.07, 2)
    def ns(bid, tail=1.2):   return round(fo(bid, tail) + 0.2, 2)
    # ns() = out + 0.57s — next scene starts 0.57s after current scene begins fading.
    # Flash fires at fi() (mid-fade), covering the transition visually.

    total = round(out('last_beat_id', tail=3.0), 2)

    js = f"""
  const tl = gsap.timeline({{ paused: true }});
  const ft   = (el, f, t, pos) => tl.fromTo(el, f, t, pos);
  const draw = (id, len, dur, pos) =>
    tl.to(id, {{ strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }}, pos);

  // Scene 1
  tl.to('#s1', {{ opacity: 1, duration: 0.01 }}, 0);
  ft('#s1-title', {{opacity:0,y:28}}, {{opacity:1,y:0,duration:0.7}}, {at('s01_intro')});
  // ... all beats anchored via at(), end(), ns()

  tl.set({{}}, {{}}, {total});
  window.__timelines = window.__timelines || {{}};
  window.__timelines['composition-id'] = tl;"""
    return js
```

### 6. build() entry point

```python
def build():
    print("Step 1 — TTS …")
    beat_wavs = build_beat_wavs()

    print("Step 2 — Stitch (adelay) …")
    beat_starts, beat_durs = stitch(beat_wavs)

    print("Step 3 — Whisper alignment …")
    words   = run_whisper()          # always attempt
    aligned = words is not None
    if aligned:
        beat_starts, beat_durs = refine_with_whisper(beat_starts, beat_durs, words)

    total_dur = round(
        max(beat_starts[b["id"]] + beat_durs[b["id"]] for b in BEATS) + 3.0, 2
    )
    ts = {
        "total_duration":   total_dur,
        "whisper_aligned":  aligned,
        "beats": [{"id": b["id"], "scene": b["scene"],
                   "start": beat_starts[b["id"]], "duration": beat_durs[b["id"]]}
                  for b in BEATS],
    }
    with open(TS_PATH, "w") as f:
        json.dump(ts, f, indent=2)

    print("Step 4 — Rewriting GSAP …")
    patch_html(beat_starts, beat_durs)
    patch_preview(total_dur)

    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print("✓  Done.")


def gsap_only():
    """Re-patch from saved beat_timestamps.json + cached narration.json."""
    with open(TS_PATH) as f:
        ts = json.load(f)
    T = {b["id"]: b["start"]    for b in ts["beats"]}
    D = {b["id"]: b["duration"] for b in ts["beats"]}

    cached = _load_cached_words()
    if cached:
        print(f"  Re-aligning from cached Whisper output ({len(cached)} words) …")
        T, D = refine_with_whisper(T, D, cached)

    patch_html(T, D)
    patch_preview(ts["total_duration"])
    print("✓  Done.")
```

---

## Scene transition rules

```python
# Correct order for every scene boundary:
tl.to('#sN',    { opacity:0, duration:0.5 }, out('last_beat_of_sN'))
tl.to('#flash', { opacity:1, duration:0.07 }, fi('last_beat_of_sN'))
tl.to('#flash', { opacity:0, duration:0.07 }, fo('last_beat_of_sN'))
tl.to('#sN+1',  { opacity:1, duration:0.01 }, ns('last_beat_of_sN'))
# ns() is always AFTER the previous scene fully fades — no overlap possible.
```

Never hardcode scene start times. Always derive from `ns(last_beat_of_previous_scene)`.

---

## Sub-phase wrappers (for long scenes)

For scenes with 4+ visual states, use sub-phase wrapper divs (`#s3-pa`, `#s3-pb`, …). Each phase fades out 0.3s before the next begins:

```python
s3_pa_out = round(at('s03_pb') - 0.3, 2)   # phase A exits just before phase B starts
# ...
ft('#s3-pa', {opacity:0,y:16}, {opacity:1,y:0,duration:0.5}, at('s03_pa'))
tl.to('#s3-pa', {opacity:0, duration:0.4}, s3_pa_out)
ft('#s3-pb', {opacity:0,y:16}, {opacity:1,y:0,duration:0.5}, at('s03_pb'))
```

Max ~4 elements visible simultaneously per frame.

---

## Running the pipeline

```bash
# Install Whisper (one-time)
pip install openai-whisper

# Full build: TTS + stitch + Whisper + patch GSAP
python3 audio/build_narration.py

# Re-patch GSAP only (re-uses cached narration.json from prior Whisper run)
python3 audio/build_narration.py --gsap-only

# Preview
npx hyperframes preview

# Render (only when user explicitly asks)
npx hyperframes render src/hyperframes/<Name> --output out/<Name>.mp4
```

---

## TTS text rules

- No contractions: `it's → it is`, `don't → do not`
- Numbers as words: `30,000 → thirty thousand`
- No symbols in speech: `≠ → is not equal to`, `% → percent`
- Acronyms pronounced as words: `RAG → Rag`, `RLHF → R L H F` (test which sounds natural)
- Copy directly from `SCRIPT_CLEAN.md` — never from the annotated `SCRIPT.md`

---

## Standard settings (Gen Academy)

| Setting | Value |
|---|---|
| Voice | `bm_george` |
| SCENE_GAP | `1.5s` |
| Whisper model | `base` |
| Stitch method | `ffmpeg adelay + amix` |
| Alignment | **openai-whisper (default, always)** |
| Timestamps file | `beat_timestamps.json` |
| Whisper cache | `narration.json` |

---

## Mandatory rules

1. **Whisper alignment is always required.** Never ship a composition with stitch-only timestamps. If `openai-whisper` is not installed, block and install it before proceeding.
2. **One beat per visual state change.** Never bundle two unrelated element appearances into one beat.
3. **Text must be TTS-clean.** No contractions, no symbols, numbers as words.
4. **`make_gsap()` owns the entire GSAP script.** Never hand-edit timing in `index.html` — the next `build_narration.py` run will overwrite it.
5. **Use `adelay` for stitching.** Never use `anullsrc` silence padding + `amix` — causes floating-point drift.
6. **Derive all scene transitions from `ns()`.** Never hardcode next-scene start times.
7. **Use sub-phase wrappers** for scenes with 4+ visual states. Max ~4 elements visible simultaneously.
8. **Run `--gsap-only` to iterate** on animation timing without re-running TTS. Re-uses cached `narration.json`.
9. **Preview before rendering.** Open `npx hyperframes preview` after every build to verify sync.

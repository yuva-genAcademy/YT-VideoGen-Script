#!/usr/bin/env python3
"""
WhisperX-driven beat-granular narration pipeline for HowAIIsTrained.

Workflow
────────
1.  TTS      — one audio clip per BEAT via `npx hyperframes tts`
2.  Stitch   — concat clips with SCENE_GAP silences → narration.wav  (adelay)
3.  Align    — WhisperX on narration.wav → word-level timestamps JSON
4.  Sync     — find each BEAT phrase in transcript → T[beat_id] (exact start)
5.  make_gsap(T, D) — regenerates the ENTIRE <script> block in index.html
                      every animation anchored to real speech timing

Usage
─────
  python3 audio/build_narration.py              # full pipeline
  python3 audio/build_narration.py --gsap-only  # re-patch from beat_timestamps.json
"""

import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata

# ─── Constants ────────────────────────────────────────────────────────────────
VOICE      = "bm_george"
SCENE_GAP  = 1.5   # silence (s) between scenes
AUDIO_DIR  = os.path.dirname(os.path.abspath(__file__))
COMP_DIR   = os.path.dirname(AUDIO_DIR)
HTML_PATH  = os.path.join(COMP_DIR, "index.html")
TMP_DIR    = os.path.join(AUDIO_DIR, "_tmp_beats")
OUTPUT_WAV = os.path.join(AUDIO_DIR, "narration.wav")
TS_PATH    = os.path.join(AUDIO_DIR, "beat_timestamps.json")
WX_JSON    = os.path.join(AUDIO_DIR, "narration.json")

# ─── BEATS ────────────────────────────────────────────────────────────────────
# One beat per visual state change.
# text  = exactly what the narrator says when that element should appear.
#         Must match SCRIPT_CLEAN.md verbatim (same contractions/spelling).
# scene = scene number — SCENE_GAP silence auto-inserted between scene changes.
# WhisperX finds each phrase and returns its precise start time → T[id].

BEATS = [

    # ── Scene 1 ────────────────────────────────────────────────────────────────
    {"id": "s01_intro",  "scene": 1,
     "text": "You have heard that large language models learned from the internet. "
             "That is true, but it flattens a process with three distinct phases, "
             "each with different goals, different data, and different costs."},

    {"id": "s01_body",   "scene": 1,
     "text": "Understanding these phases changes how you evaluate models, interpret "
             "their failures, and make smarter decisions about when and how to use them."},

    # ── Scene 2 ────────────────────────────────────────────────────────────────
    {"id": "s02_open",   "scene": 2,
     "text": "Here is the full pipeline at a glance."},

    {"id": "s02_r1",     "scene": 2,
     "text": "Raw text corpus feeds into pre-training,"},

    {"id": "s02_r2",     "scene": 2,
     "text": "where a transformer learns next-token prediction and attention weights "
             "capture relationships across tokens."},

    {"id": "s02_r3",     "scene": 2,
     "text": "That produces the base model."},

    {"id": "s02_r4",     "scene": 2,
     "text": "From there, instruction tuning shapes behavior,"},

    {"id": "s02_r5",     "scene": 2,
     "text": "RLHF aligns it to human preference,"},

    {"id": "s02_r6",     "scene": 2,
     "text": "and alignment tuning adds safety and honesty."},

    {"id": "s02_r7",     "scene": 2,
     "text": "The result is the deployed model you call via API, sitting inside your "
             "system of prompts, retrieval, and guardrails."},

    {"id": "s02_note",   "scene": 2,
     "text": "Each stage inherits from the one before it. Each introduces tradeoffs."},

    # ── Scene 3 ────────────────────────────────────────────────────────────────
    {"id": "s03_title",  "scene": 3,
     "text": "Pre-training is where the model builds its world model, its understanding "
             "of language, facts, reasoning, and structure."},

    {"id": "s03_pa",     "scene": 3,
     "text": "The model being trained is a transformer, an architecture built around "
             "attention mechanisms that learns which tokens in a sequence are relevant "
             "to each other, regardless of their distance apart."},

    {"id": "s03_llms",   "scene": 3,
     "text": "Every major language model today, GPT, Claude, Gemini, is a transformer at its core."},

    {"id": "s03_pb",     "scene": 3,
     "text": "The input is a massive corpus of web crawls, books, code, and scientific papers. "
             "Trillions of tokens. The entire English Wikipedia is roughly four billion tokens, "
             "a rounding error at this scale."},

    {"id": "s03_task",   "scene": 3,
     "text": "The training task is deceptively simple: predict the next token. "
             "But solving this across all of human writing forces the transformer to internalize "
             "grammar, logic, facts, and code, because all of it helps prediction."},

    {"id": "s03_pc",     "scene": 3,
     "text": "This is self-supervised learning. No human-labeled data required. "
             "The label is always the next word, already in the text. "
             "That is why pre-training can scale so aggressively."},

    {"id": "s03_base",   "scene": 3,
     "text": "What you get is a base model, a powerful text predictor with no particular "
             "goal and no safety properties. Not a product. A starting point."},

    {"id": "s03_pd",     "scene": 3,
     "text": "Pre-training is also where the massive compute cost lives, tens to hundreds "
             "of millions of dollars, months of GPU time. "
             "This is the moat separating a handful of labs from everyone else."},

    # ── Scene 4 ────────────────────────────────────────────────────────────────
    {"id": "s04_title",  "scene": 4,
     "text": "Fine-tuning makes the base model useful. The most common approach is instruction "
             "tuning, training on examples of human instructions paired with high-quality responses. "
             "The model learns to follow directives, not just complete text."},

    {"id": "s04_rlhf",   "scene": 4,
     "text": "A critical variant is RLHF, Reinforcement Learning from Human Feedback."},

    {"id": "s04_s1",     "scene": 4,
     "text": "Human raters compare two outputs and pick the better one."},

    {"id": "s04_s2",     "scene": 4,
     "text": "A reward model learns to predict those preferences."},

    {"id": "s04_s3",     "scene": 4,
     "text": "The main model is then optimized to maximize that reward."},

    {"id": "s04_pc",     "scene": 4,
     "text": "RLHF is why ChatGPT felt different. The model was not just more capable. "
             "It had been shaped toward outputs humans actually prefer. "
             "That is a different optimization target than raw prediction."},

    {"id": "s04_cstr",   "scene": 4,
     "text": "One key constraint: fine-tuning shapes behavior, but it does not update knowledge. "
             "If you need the model to know something new, you either retrain it or inject the "
             "information at inference time, which is what Rag does."},

    # ── Scene 5 ────────────────────────────────────────────────────────────────
    {"id": "s05_title",  "scene": 5,
     "text": "The final phase makes the model safe and honest."},

    {"id": "s05_pa",     "scene": 5,
     "text": "This includes both hard content filtering and preference-based tuning, "
             "teaching the model to be helpful without being harmful."},

    {"id": "s05_pb",     "scene": 5,
     "text": "Anthropic's approach, Constitutional AI, trains a model to critique and revise "
             "its own outputs against a written set of principles, reducing dependence on "
             "continuous human feedback."},

    {"id": "s05_warn",   "scene": 5,
     "text": "Here is the practical tradeoff: safety tuning can cause over-refusal, declining "
             "legitimate requests because they superficially resemble harmful ones. "
             "Knowing this helps you write better prompts and choose the right model for your context."},

    # ── Scene 6 ────────────────────────────────────────────────────────────────
    {"id": "s06_title",  "scene": 6,
     "text": "Because pre-training happens once on a static dataset, every model has a "
             "knowledge cutoff, a date beyond which it has no information."},

    {"id": "s06_tl",     "scene": 6,
     "text": "Anything after that date does not exist to the model unless you tell it."},

    {"id": "s06_vol",    "scene": 6,
     "text": "This also affects confidence. An event documented across millions of web pages "
             "carries far more statistical weight than a recent one with sparse coverage. "
             "The model's certainty reflects volume in the training data, not ground truth. "
             "This is part of why models can be confidently wrong."},

    {"id": "s06_i1",     "scene": 6,
     "text": "RAG supplements frozen knowledge with live retrieval."},

    {"id": "s06_i2",     "scene": 6,
     "text": "Telling the model today's date shifts its behavior."},

    {"id": "s06_i3",     "scene": 6,
     "text": "And a recent cutoff does not automatically mean better. "
             "Training quality and fine-tuning matter more."},

    # ── Scene 7 ────────────────────────────────────────────────────────────────
    {"id": "s07_c1",     "scene": 7,
     "text": "Three phases: pre-training builds the world model,"},

    {"id": "s07_c2",     "scene": 7,
     "text": "fine-tuning shapes behavior,"},

    {"id": "s07_c3",     "scene": 7,
     "text": "alignment tunes for safety and preference."},

    {"id": "s07_trans",  "scene": 7,
     "text": "And underneath all of it, a transformer, learning from patterns in text at a "
             "scale that is genuinely hard to reason about intuitively."},

    {"id": "s07_diag",   "scene": 7,
     "text": "When a model fails, hallucinating, refusing, being inconsistent, the root cause "
             "lives in one of these phases. That diagnostic ability separates engineers who "
             "understand the stack from those who are just prompting and hoping."},
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(f"✗  {cmd[0]}: {r.stderr[-1500:]}")
        sys.exit(1)
    return r


def get_duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "json", path])
    return float(json.loads(r.stdout)["format"]["duration"])


# ─── Step 1 — TTS ─────────────────────────────────────────────────────────────

def build_beat_wavs():
    """Generate one wav per beat. Returns list of wav paths in BEATS order."""
    os.makedirs(TMP_DIR, exist_ok=True)
    wavs  = []
    total = len(BEATS)
    for i, beat in enumerate(BEATS):
        wav = os.path.join(TMP_DIR, f"{beat['id']}.wav")
        txt = wav.replace(".wav", ".txt")
        print(f"  [{i+1:02d}/{total}] {beat['id']}")
        with open(txt, "w") as f:
            f.write(beat["text"])
        run(["npx", "--yes", "hyperframes", "tts",
             "--file", txt, "--output", wav, "--voice", VOICE])
        wavs.append(wav)
    return wavs


# ─── Step 2 — Stitch ──────────────────────────────────────────────────────────

def stitch(beat_wavs):
    """
    Stitch beat wavs with adelay.
    Within a scene: clips play back-to-back (0 gap).
    Between scenes: SCENE_GAP silence.
    Returns (beat_starts dict, beat_durs dict).
    """
    beat_starts = {}
    beat_durs   = {}
    t = 0.0
    prev_scene  = None

    for beat, wav in zip(BEATS, beat_wavs):
        if prev_scene is not None and beat["scene"] != prev_scene:
            t = round(t + SCENE_GAP, 3)
        beat_starts[beat["id"]] = round(t, 3)
        dur = get_duration(wav)
        beat_durs[beat["id"]]   = round(dur, 3)
        t = round(t + dur, 3)
        prev_scene = beat["scene"]

    total_dur = round(t + 1.5, 2)

    # Mix with adelay — proven frame-accurate approach
    inputs       = []
    filter_parts = []
    mix_labels   = []

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
        "-filter_complex", fc,
        "-map", "[out]",
        "-t", str(total_dur),
        OUTPUT_WAV,
    ])

    print(f"  ✓  narration.wav  {total_dur:.2f}s")
    return beat_starts, beat_durs


# ─── Step 3 — Whisper alignment ───────────────────────────────────────────────

def run_whisper():
    """
    Align narration.wav using openai-whisper (word_timestamps=True).
    Install: pip install openai-whisper
    Falls back to stitch-based timestamps if not installed.
    Returns list of {word, start, end} or None on failure.
    """
    try:
        import whisper  # openai-whisper
    except ImportError:
        print("  ⚠  openai-whisper not installed")
        print("     Install: pip install openai-whisper")
        print("     Falling back to stitch-based timestamps.\n")
        return None

    print("  Loading whisper model (base) …")
    model = whisper.load_model("base")
    print("  Transcribing with word-level timestamps …")
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

    # Cache to JSON for --gsap-only re-runs
    with open(WX_JSON, "w") as f:
        json.dump({"segments": result.get("segments", [])}, f)

    print(f"  ✓  Whisper aligned {len(words)} words\n")
    return words


def _load_cached_words():
    """Load word list from cached narration.json (written by run_whisper)."""
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
    """Lowercase + strip punctuation → word list."""
    text = unicodedata.normalize("NFD", text.lower())
    text = re.sub(r"[^\w\s]", " ", text)
    return [w for w in text.split() if w]


def _find_phrase(words, phrase, start_idx=0):
    """
    Search for `phrase` (first 4 words) in `words` starting at start_idx.
    Returns (start_time, match_end_idx) or (None, start_idx).
    """
    query     = _norm(phrase)[:4]
    norm_list = [(_norm(w["word"])[0] if _norm(w["word"]) else "__") for w in words]

    for i in range(start_idx, len(norm_list) - len(query) + 1):
        if norm_list[i : i + len(query)] == query:
            return words[i]["start"], i + len(query)
    return None, start_idx


def refine_with_whisper(beat_starts, beat_durs, words):
    """Replace stitch-based start times with Whisper word-level times."""
    if not words:
        print("  ⚠  No word-level timestamps — using stitch times")
        return beat_starts, beat_durs

    hits   = 0
    misses = 0
    cursor = 0

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

    print(f"\n  Whisper: {hits}/{hits+misses} beats aligned precisely\n")
    return beat_starts, beat_durs


# ─── Step 4 — make_gsap ───────────────────────────────────────────────────────

def make_gsap(T, D):
    """
    Regenerate the complete inline GSAP script.
    T = {beat_id: start_seconds}
    D = {beat_id: duration_seconds}
    Every animation is anchored to a real speech timestamp.
    """
    def at(bid, offset=0.0):
        return round(T.get(bid, 0.0) + offset, 2)

    def end(bid):
        """End of beat = start + duration."""
        return round(T.get(bid, 0.0) + D.get(bid, 3.0), 2)

    def out(bid, tail=1.2):
        """Scene fade-out time = beat end + tail."""
        return round(end(bid) + tail, 2)

    def fi(bid, tail=1.2):   # flash-in
        return round(out(bid, tail) + 0.3, 2)

    def fo(bid, tail=1.2):   # flash-out
        return round(fi(bid, tail) + 0.07, 2)

    def ns(bid, tail=1.2):   # next scene start
        return round(fo(bid, tail) + 0.2, 2)

    # Sub-phase boundaries — each phase exits just before the next phase's beat
    s3_pa_out = round(at('s03_pb')   - 0.3, 2)
    s3_pb_out = round(at('s03_pc')   - 0.3, 2)
    s3_pc_out = round(at('s03_pd')   - 0.3, 2)
    s4_pa_out = round(at('s04_rlhf') - 0.3, 2)
    s4_pb_out = round(at('s04_pc')   - 0.3, 2)
    s5_pa_out = round(at('s05_pb')   - 0.3, 2)
    s6_pa_out = round(at('s06_vol')  - 0.3, 2)

    total = round(out('s07_diag', tail=3.0), 2)

    js = f"""
  const tl = gsap.timeline({{ paused: true }});
  const ft   = (el, f, t, pos) => tl.fromTo(el, f, t, pos);
  const draw = (id, len, dur, pos) =>
    tl.to(id, {{ strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }}, pos);

  // ─── SCENE 1 ──────────────────────────────────────────────────────────────
  // SCENE 1
  tl.to('#s1', {{ opacity: 1, duration: 0.01 }}, 0);
  ft('#s1-tag',  {{ opacity:0, y:-12 }}, {{ opacity:1, y:0, duration:0.4 }}, {at('s01_intro')});
  ft('#s1-h1',   {{ opacity:0, y:28  }}, {{ opacity:1, y:0, duration:0.7, ease:'back.out(1.2)' }}, {at('s01_intro', 0.5)});
  ft('#s1-h2',   {{ opacity:0, y:18  }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s01_intro', 1.4)});
  draw('#s1-uline', 680, 0.8, {at('s01_intro', 1.9)});
  ft('#s1-body', {{ opacity:0, y:16  }}, {{ opacity:1, y:0, duration:0.6 }}, {at('s01_body')});
  tl.to('#s1', {{ opacity:0, duration:0.5 }}, {out('s01_body')});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi('s01_body')});
  tl.to('#flash', {{ opacity:0, duration:0.07 }}, {fo('s01_body')});

  // ─── SCENE 2 ──────────────────────────────────────────────────────────────
  // SCENE 2
  tl.to('#s2', {{ opacity: 1, duration: 0.01 }}, {ns('s01_body')});
  ft('#s2-title', {{ opacity:0, y:18 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02_open')});
  draw('#s2-uline', 480, 0.7, {at('s02_open', 0.5)});
  ft('#s2-r1',  {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s02_r1')});
  tl.to('#s2-d1', {{ opacity:1, duration:0.3 }}, {at('s02_r1', 0.5)});
  ft('#s2-r2',  {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s02_r2')});
  tl.to('#s2-d2', {{ opacity:1, duration:0.3 }}, {at('s02_r2', 0.5)});
  ft('#s2-r3',  {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s02_r3')});
  tl.to('#s2-d3', {{ opacity:1, duration:0.3 }}, {at('s02_r3', 0.5)});
  ft('#s2-r4',  {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s02_r4')});
  tl.to('#s2-d4', {{ opacity:1, duration:0.3 }}, {at('s02_r4', 0.5)});
  ft('#s2-r5',  {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s02_r5')});
  tl.to('#s2-d5', {{ opacity:1, duration:0.3 }}, {at('s02_r5', 0.5)});
  ft('#s2-r6',  {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s02_r6')});
  tl.to('#s2-d6', {{ opacity:1, duration:0.3 }}, {at('s02_r6', 0.5)});
  ft('#s2-r7',  {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s02_r7')});
  ft('#s2-note', {{ opacity:0, y:10 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02_note')});
  tl.to('#s2', {{ opacity:0, duration:0.5 }}, {out('s02_note')});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi('s02_note')});
  tl.to('#flash', {{ opacity:0, duration:0.07 }}, {fo('s02_note')});

  // ─── SCENE 3 ──────────────────────────────────────────────────────────────
  // SCENE 3
  tl.to('#s3', {{ opacity: 1, duration: 0.01 }}, {ns('s02_note')});
  ft('#s3-title', {{ opacity:0, y:18 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s03_title')});
  draw('#s3-uline', 540, 0.7, {at('s03_title', 0.5)});
  // Phase A — Transformer (appears at s03_pa, exits before s03_pb)
  ft('#s3-pa', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s03_pa')});
  tl.to('#s3-pa', {{ opacity:0, duration:0.4 }}, {s3_pa_out});
  // Phase B — Corpus + Task (s03_pb … s03_pc)
  ft('#s3-pb', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s03_pb')});
  tl.to('#s3-pb', {{ opacity:0, duration:0.4 }}, {s3_pb_out});
  // Phase C — Self-supervised + Base model (s03_pc … s03_pd)
  ft('#s3-pc', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s03_pc')});
  tl.to('#s3-pc', {{ opacity:0, duration:0.4 }}, {s3_pc_out});
  // Phase D — Compute cost (s03_pd …)
  ft('#s3-pd', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s03_pd')});
  tl.to('#s3', {{ opacity:0, duration:0.5 }}, {out('s03_pd')});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi('s03_pd')});
  tl.to('#flash', {{ opacity:0, duration:0.07 }}, {fo('s03_pd')});

  // ─── SCENE 4 ──────────────────────────────────────────────────────────────
  // SCENE 4
  tl.to('#s4', {{ opacity: 1, duration: 0.01 }}, {ns('s03_pd')});
  ft('#s4-title', {{ opacity:0, y:18 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04_title')});
  draw('#s4-uline', 800, 0.7, {at('s04_title', 0.5)});
  // Phase A — Instruction tuning card
  ft('#s4-pa', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04_title', 0.8)});
  tl.to('#s4-pa', {{ opacity:0, duration:0.4 }}, {s4_pa_out});
  // Phase B — RLHF 3 steps (s04_rlhf … s04_pc)
  ft('#s4-pb',    {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04_rlhf')});
  ft('#s4-step1', {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s04_s1')});
  ft('#s4-step2', {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s04_s2')});
  ft('#s4-step3', {{ opacity:0, x:-16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s04_s3')});
  tl.to('#s4-pb', {{ opacity:0, duration:0.4 }}, {s4_pb_out});
  // Phase C — Implications (s04_pc …)
  ft('#s4-pc', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04_pc')});
  tl.to('#s4', {{ opacity:0, duration:0.5 }}, {out('s04_cstr')});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi('s04_cstr')});
  tl.to('#flash', {{ opacity:0, duration:0.07 }}, {fo('s04_cstr')});

  // ─── SCENE 5 ──────────────────────────────────────────────────────────────
  // SCENE 5
  tl.to('#s5', {{ opacity: 1, duration: 0.01 }}, {ns('s04_cstr')});
  ft('#s5-title', {{ opacity:0, y:18 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s05_title')});
  draw('#s5-uline', 440, 0.7, {at('s05_title', 0.5)});
  ft('#s5-goal', {{ opacity:0, y:14 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s05_title', 0.8)});
  // Phase A — Two method panels
  ft('#s5-pa', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s05_pa')});
  tl.to('#s5-pa', {{ opacity:0, duration:0.4 }}, {s5_pa_out});
  // Phase B — CAI + Over-refusal
  ft('#s5-pb', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s05_pb')});
  tl.to('#s5', {{ opacity:0, duration:0.5 }}, {out('s05_warn')});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi('s05_warn')});
  tl.to('#flash', {{ opacity:0, duration:0.07 }}, {fo('s05_warn')});

  // ─── SCENE 6 ──────────────────────────────────────────────────────────────
  // SCENE 6
  tl.to('#s6', {{ opacity: 1, duration: 0.01 }}, {ns('s05_warn')});
  ft('#s6-title', {{ opacity:0, y:18 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s06_title')});
  draw('#s6-uline', 540, 0.7, {at('s06_title', 0.5)});
  // Phase A — Definition + timeline
  ft('#s6-pa', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s06_title', 0.8)});
  tl.to('#s6-tlbar',  {{ width:'72%', duration:1.4, ease:'power2.out' }}, {at('s06_tl')});
  ft('#s6-marker', {{ opacity:0 }}, {{ opacity:1, duration:0.4 }}, {at('s06_tl', 1.5)});
  tl.to('#s6-pa', {{ opacity:0, duration:0.4 }}, {s6_pa_out});
  // Phase B — Volume≠Truth + implications
  ft('#s6-pb',   {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s06_vol')});
  ft('#s6-imp1', {{ opacity:0, x:16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s06_i1')});
  ft('#s6-imp2', {{ opacity:0, x:16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s06_i2')});
  ft('#s6-imp3', {{ opacity:0, x:16 }}, {{ opacity:1, x:0, duration:0.4 }}, {at('s06_i3')});
  tl.to('#s6', {{ opacity:0, duration:0.5 }}, {out('s06_i3')});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi('s06_i3')});
  tl.to('#flash', {{ opacity:0, duration:0.07 }}, {fo('s06_i3')});

  // ─── SCENE 7 ──────────────────────────────────────────────────────────────
  // SCENE 7
  tl.to('#s7', {{ opacity: 1, duration: 0.01 }}, {ns('s06_i3')});
  ft('#s7-hd', {{ opacity:0, y:-10 }}, {{ opacity:1, y:0, duration:0.4 }}, {at('s07_c1', -0.2)});
  ft('#s7-c1', {{ opacity:0, y:18  }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s07_c1')});
  ft('#s7-c2', {{ opacity:0, y:18  }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s07_c2')});
  ft('#s7-c3', {{ opacity:0, y:18  }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s07_c3')});
  ft('#s7-trans', {{ opacity:0, y:12 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s07_trans')});
  ft('#s7-diag',  {{ opacity:0, y:12 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s07_diag')});
  tl.to('#s7', {{ opacity:0, duration:0.8 }}, {out('s07_diag', tail=2.5)});

  // Duration marker
  tl.set({{}}, {{}}, {total});

  window.__timelines = window.__timelines || {{}};
  window.__timelines['how-ai-is-trained'] = tl;"""

    return js


# ─── Step 5 — Patch HTML ──────────────────────────────────────────────────────

def patch_html(T, D):
    """Replace the last inline <script> block in index.html with new GSAP."""
    with open(HTML_PATH) as f:
        html = f.read()

    new_js  = make_gsap(T, D)
    # Match: <script src="...gsap..."> </script>  <script> CONTENT </script>
    pattern = r'(<script\s+src="[^"]*gsap[^"]*"[^>]*></script>\s*<script>)(.*?)(</script>)'
    match   = re.search(pattern, html, re.DOTALL)
    if not match:
        print("  ⚠  GSAP script block not found — check HTML structure")
        return

    html_new = html[:match.start(2)] + new_js + "\n" + html[match.end(2):]
    with open(HTML_PATH, "w") as f:
        f.write(html_new)
    print("  ✓  index.html GSAP script rewritten")


def patch_preview(total_dur):
    """Sync TOTAL in preview.html to compacted duration."""
    preview = os.path.join(COMP_DIR, "preview.html")
    if not os.path.exists(preview):
        return
    with open(preview) as f:
        html = f.read()
    html = re.sub(r'(max=")[^"]+(")',          rf'\g<1>{total_dur}\g<2>', html)
    html = re.sub(r'(const TOTAL\s*=\s*)[\d.]+', rf'\g<1>{total_dur}',   html)
    with open(preview, "w") as f:
        f.write(html)
    print(f"  ✓  preview.html TOTAL → {total_dur}s")


# ─── Entry points ─────────────────────────────────────────────────────────────

def build():
    os.chdir(COMP_DIR)
    sep = "=" * 62
    print(f"\n{sep}")
    print(f"  How AI Is Trained — Narration Build   ({len(BEATS)} beats)")
    print(f"{sep}\n")

    print("Step 1 — Generating TTS (one clip per beat) …")
    beat_wavs = build_beat_wavs()
    print()

    print("Step 2 — Stitching narration.wav (adelay) …")
    beat_starts, beat_durs = stitch(beat_wavs)
    print()

    print("Step 3 — Whisper word-level alignment …")
    words = run_whisper()
    aligned = words is not None
    if aligned:
        beat_starts, beat_durs = refine_with_whisper(beat_starts, beat_durs, words)

    # Save timestamps
    total_dur = round(
        max(beat_starts[b["id"]] + beat_durs[b["id"]] for b in BEATS) + 3.0, 2
    )
    ts = {
        "total_duration":   total_dur,
        "voice":            VOICE,
        "whisperx_aligned": aligned,
        "beats": [
            {"id":       b["id"],
             "scene":    b["scene"],
             "start":    beat_starts[b["id"]],
             "duration": beat_durs[b["id"]]}
            for b in BEATS
        ],
    }
    with open(TS_PATH, "w") as f:
        json.dump(ts, f, indent=2)
    print(f"✓  beat_timestamps.json  ({len(BEATS)} beats, {total_dur:.2f}s)\n")

    print("Step 4 — Rewriting GSAP script …")
    patch_html(beat_starts, beat_durs)
    patch_preview(total_dur)
    print()

    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print("✓  All done.\n")
    print("  Preview:  cd src/hyperframes/HowAIIsTrained && npx hyperframes preview")
    print("  Render:   npx hyperframes render src/hyperframes/HowAIIsTrained --output out/HowAIIsTrained.mp4\n")


def gsap_only():
    """Re-run make_gsap from saved beat_timestamps.json — no TTS, no WhisperX."""
    os.chdir(COMP_DIR)
    if not os.path.exists(TS_PATH):
        print("✗  beat_timestamps.json not found — run full build first")
        sys.exit(1)
    with open(TS_PATH) as f:
        ts = json.load(f)

    T = {b["id"]: b["start"]    for b in ts["beats"]}
    D = {b["id"]: b["duration"] for b in ts["beats"]}

    # If narration.json exists from a prior Whisper run, re-align
    cached = _load_cached_words()
    if cached:
        print(f"  Re-aligning from cached Whisper output ({len(cached)} words) …")
        T, D = refine_with_whisper(T, D, cached)
    print("Re-patching GSAP from saved timestamps …")
    patch_html(T, D)
    patch_preview(ts["total_duration"])
    print("✓  Done\n")


if __name__ == "__main__":
    if "--gsap-only" in sys.argv:
        gsap_only()
    else:
        build()

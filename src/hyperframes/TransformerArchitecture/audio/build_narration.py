#!/usr/bin/env python3
"""
build_narration.py — Beat-granular TTS for TransformerArchitecture.

Each BEAT = one TTS clip. Clips stitch sequentially (0-gap within a scene,
SCENE_GAP silence between scenes). The cumulative start time of each clip IS
the exact GSAP trigger time — no estimation, structurally guaranteed sync.

Usage:
  python3 audio/build_narration.py             # Full build (TTS + stitch + patch)
  python3 audio/build_narration.py --gsap-only # Re-patch index.html from beat_timestamps.json
"""

import subprocess, json, os, re, sys, shutil
from pathlib import Path

VOICE       = "bm_george"
AUDIO_DIR   = Path(__file__).parent.resolve()
COMP_DIR    = AUDIO_DIR.parent
HTML_PATH   = COMP_DIR / "index.html"
PREVIEW_PATH = COMP_DIR / "preview.html"
TMP_DIR     = AUDIO_DIR / "_tmp_beats"
BEATS_TS    = AUDIO_DIR / "beat_timestamps.json"
SAMPLE_RATE = 24000
SCENE_GAP   = 1.5   # silence (s) inserted between scenes

# ─── BEATS ───────────────────────────────────────────────────────────────────
# Each beat = one TTS clip. Beats within the same scene concatenate with 0 gap.
# SCENE_GAP silence is inserted between the last beat of scene N and the first
# beat of scene N+1. The start time of each clip is the GSAP trigger time.

BEATS = [
    # ── SCENE 1 ──────────────────────────────────────────────────────────────
    {"id": "s01a", "scene": 1,
     "text": "Nearly every major language model in production today is built on a transformer-based architecture."},
    {"id": "s01b", "scene": 1,
     "text": "GPT, Claude, Gemini, LLaMA. If you are making decisions about AI systems, whether technical or strategic, this is the architecture you need to understand."},

    # ── SCENE 2 ──────────────────────────────────────────────────────────────
    {"id": "s02a", "scene": 2,
     "text": "Before two thousand seventeen, the dominant approach processed language sequentially. One word at a time, each step waiting on the previous."},
    {"id": "s02b", "scene": 2,
     "text": "Models struggled to connect information across long distances in a sentence, and training on large datasets was slow."},
    {"id": "s02c", "scene": 2,
     "text": "The transformer, introduced in Attention Is All You Need, replaced this with self-attention. Every token in a sequence can directly reference every other token simultaneously."},
    {"id": "s02d", "scene": 2,
     "text": "A word at position one and a word at position fifty interact on equal footing, removing the strict sequential bottleneck."},
    {"id": "s02e", "scene": 2,
     "text": "Training can be parallelized across tokens within a sequence. That made training on massive datasets tractable. And that is why the transformer became the foundation of the modern AI stack."},

    # ── SCENE 3 ──────────────────────────────────────────────────────────────
    {"id": "s03a", "scene": 3,
     "text": "A transformer is built by stacking identical layers. Dozens in smaller models, up to around one hundred or more in large ones."},
    {"id": "s03a2", "scene": 3,
     "text": "Each layer does two things in sequence."},
    {"id": "s03b_sa", "scene": 3,
     "text": "First, self-attention. Tokens exchange information across the sequence. Each token identifies which other tokens are relevant to its meaning in context, and updates its own representation accordingly."},
    {"id": "s03b_ff", "scene": 3,
     "text": "Second, a feed-forward network. Two linear transformations applied independently to each token. No cross-token communication here. After attention distributes context, the feed-forward layer transforms each token on its own. Attend, then transform. That pair repeats at every layer."},
    {"id": "s03d", "scene": 3,
     "text": "Two components make deep stacking reliable. Residual connections, which add each layer's input directly to its output to preserve gradient flow. And layer normalization, which stabilizes activations across many layers. Without these, deep transformers are very difficult to train effectively."},

    # ── SCENE 4 ──────────────────────────────────────────────────────────────
    {"id": "s04a", "scene": 4,
     "text": "Not all transformers are structured the same way. The two dominant variants serve different purposes."},
    {"id": "s04b1", "scene": 4,
     "text": "Encoder-only models like BERT apply attention in both directions. Every token sees the full sequence."},
    {"id": "s04b2", "scene": 4,
     "text": "Built for comprehension tasks: classification, semantic search, document retrieval."},
    {"id": "s04b3", "scene": 4,
     "text": "They are not designed for text generation."},
    {"id": "s04c1", "scene": 4,
     "text": "Decoder-only models like GPT and Claude restrict attention so each token only sees what came before it. Trained to predict the next token, they generate text autoregressively."},
    {"id": "s04c2", "scene": 4,
     "text": "One token at a time, appending each output to the input and running again."},
    {"id": "s04d", "scene": 4,
     "text": "This distinction has practical consequences. A retrieval system typically relies on encoder-style models. A generative or conversational product calls for a decoder-only model. Choosing incorrectly is not just a performance issue. It is an architectural mismatch."},

    # ── SCENE 5 ──────────────────────────────────────────────────────────────
    {"id": "s05a", "scene": 5,
     "text": "At the final layer, each token has a rich contextual representation. That vector is projected across the full vocabulary to produce a probability distribution over what word comes next."},
    {"id": "s05b", "scene": 5,
     "text": "The model samples from that distribution, appends the token, and runs again."},
    {"id": "s05c", "scene": 5,
     "text": "Each new token requires a forward pass through the model, though cached attention reduces redundant computation. Generation still scales on the order of hundreds of forward steps for a typical response. This has direct implications for latency budgets and cost modeling in production systems."},

    # ── SCENE 6 ──────────────────────────────────────────────────────────────
    {"id": "s06a", "scene": 6,
     "text": "Most architectures hit a ceiling. Add more parameters and gains plateau unpredictably. The transformer has shown unusually smooth and predictable scaling behavior compared to earlier architectures."},
    {"id": "s06b", "scene": 6,
     "text": "Published scaling laws describe a consistent relationship between model size, training data, and capability. More compute and data, applied in proportion, reliably improves performance."},
    {"id": "s06c", "scene": 6,
     "text": "That predictability drove the last eight years of AI progress. Not constant reinvention, but disciplined scaling of a stable design."},
    {"id": "s06d", "scene": 6,
     "text": "When you evaluate a new model release, that context matters. Capability gains can come from architectural innovation. Or simply from more compute on the same design. Knowing the difference helps you cut through vendor positioning and evaluate claims rigorously."},

    # ── SCENE 7 ──────────────────────────────────────────────────────────────
    {"id": "s07a", "scene": 7,
     "text": "One infrastructure detail that directly affects what is feasible to build. During generation, the attention computations for all previous tokens would normally repeat on every step. The KV cache stores these intermediate values instead, keeping inference fast. But the cache grows with context length."},
    {"id": "s07b", "scene": 7,
     "text": "KV cache is one of the dominant memory costs of inference, alongside model weights themselves. And longer contexts limit how many users can be served concurrently."},
    {"id": "s07c", "scene": 7,
     "text": "Longer context is not just more expensive to compute. It reduces serving throughput. When scoping features or evaluating infrastructure costs, this is often the binding constraint."},

    # ── SCENE 8 ──────────────────────────────────────────────────────────────
    {"id": "s08a", "scene": 8,
     "text": "The transformer replaced sequential processing with parallelizable attention, making large-scale training feasible."},
    {"id": "s08b", "scene": 8,
     "text": "It stacks layers of attention and feed-forward operations, stabilized by residuals and normalization."},
    {"id": "s08c", "scene": 8,
     "text": "Encoder-only models handle comprehension. Decoder-only models handle generation."},
    {"id": "s08d", "scene": 8,
     "text": "The architecture scales predictably, which explains the pace of progress since two thousand seventeen."},
    {"id": "s08e", "scene": 8,
     "text": "And KV cache is one of the dominant memory costs of inference, with real consequences for serving economics and system design."},
]


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(f"✗ {cmd[0]}:\n{r.stderr[-1500:]}")
        sys.exit(1)
    return r


def get_duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "json", str(path)])
    return float(json.loads(r.stdout)["format"]["duration"])


def generate_tts(text, out_path):
    txt = str(out_path).replace(".wav", ".txt")
    with open(txt, "w") as f:
        f.write(text)
    run(["npx", "--yes", "hyperframes", "tts",
         "--file", txt, "--output", str(out_path), "--voice", VOICE])
    os.remove(txt)


def make_silence(duration, out_path):
    run(["ffmpeg", "-y", "-f", "lavfi",
         f"-i", f"anullsrc=r={SAMPLE_RATE}:cl=mono",
         "-t", str(duration), str(out_path)])


# ─── GSAP GENERATOR ──────────────────────────────────────────────────────────

def make_gsap(T, D):
    """
    Build complete GSAP script from beat start-times T and durations D.
    T[beat_id] = absolute start time (seconds)
    D[beat_id] = audio duration (seconds)
    """
    def at(bid, offset=0.0):
        return round(T[bid] + offset, 2)

    def lbe(bid):          # last-beat-end for a scene
        return round(T[bid] + D[bid], 2)

    def fade(end_t):       # scene fade-out: 0.3s after audio ends
        return round(end_t + 0.3, 2)

    def fi(end_t):         # flash-in
        return round(end_t + 0.7, 2)

    def fo(end_t):         # flash-out
        return round(end_t + 0.77, 2)

    s1e = lbe("s01b");  s2e = lbe("s02e");  s3e = lbe("s03d")
    s4e = lbe("s04d");  s5e = lbe("s05c");  s6e = lbe("s06d")
    s7e = lbe("s07c");  s8e = lbe("s08e")

    end_marker = round(s8e + 2.0, 2)

    # Scene 2 internal phase transitions
    s2a_fadeout = round(T["s02c"] - 0.4, 2)
    s2b_fadeout = round(T["s02e"] - 0.4, 2)

    js = f"""\
  const tl = gsap.timeline({{ paused: true }});
  const ft = (el, f, t, pos) => tl.fromTo(el, f, t, pos);
  const draw = (pathId, len, dur, pos, ease) =>
    tl.to(pathId, {{ strokeDashoffset: 0, duration: dur, ease: ease || 'power2.inOut' }}, pos);

  // SCENE 1 — Introduction
  tl.set('#s1', {{ opacity: 1 }}, {at('s01a')});
  ft('#s1-tag',    {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s01a', 0.2)});
  ft('#s1-t1',     {{ opacity:0, y:24 }}, {{ opacity:1, y:0, duration:0.5, ease:'power2.out' }}, {at('s01a', 0.6)});
  ft('#s1-t2',     {{ opacity:0, y:24 }}, {{ opacity:1, y:0, duration:0.5, ease:'power2.out' }}, {at('s01a', 1.1)});
  draw('#s1-uline', 760, 0.8, {at('s01a', 1.5)});
  ft('#s1-models', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5, ease:'power2.out' }}, {at('s01b')});
  ft('#s1-sub',    {{ opacity:0 }},       {{ opacity:1, duration:0.5 }}, {at('s01b', 0.5)});
  tl.to('#s1', {{ opacity:0, duration:0.5 }}, {fade(s1e)});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi(s1e)});
  tl.to('#flash', {{ opacity:0, duration:0.2  }}, {fo(s1e)});

  // SCENE 2 — What It Replaced
  tl.set('#s2',  {{ opacity: 1 }}, {at('s02a')});
  tl.set('#s2a', {{ opacity: 1 }}, {at('s02a')});
  ft('#s2a',        {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s02a')});
  ft('#s2a-tokens', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02a', 0.4)});
  tl.to('#s2a-arrows', {{ opacity:1, duration:0.3 }}, {at('s02a', 1.0)});
  draw('#s2a-a1', 120, 0.4, {at('s02a', 1.5)});
  draw('#s2a-a2', 120, 0.4, {at('s02a', 2.0)});
  draw('#s2a-a3', 120, 0.4, {at('s02a', 2.5)});
  draw('#s2a-a4', 120, 0.4, {at('s02a', 3.0)});
  draw('#s2a-a5', 120, 0.4, {at('s02a', 3.5)});
  draw('#s2a-a6', 120, 0.4, {at('s02a', 4.0)});
  ft('#s2a-p1', {{ opacity:0, y:12 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02b')});
  ft('#s2a-p2', {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s02b', 1.2)});
  tl.to('#s2a', {{ opacity:0, duration:0.4 }}, {s2a_fadeout});
  tl.set('#s2b', {{ opacity: 1 }}, {at('s02c')});
  ft('#s2b',        {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s02c')});
  ft('#s2b-tokens', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02c', 0.4)});
  ft('#s2b-matrix', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.6 }}, {at('s02c', 1.0)});
  tl.fromTo('[id^="s2b-m"]', {{ opacity:0 }}, {{ opacity:0.85, duration:0.8, stagger:0.02 }}, {at('s02c', 1.5)});
  ft('#s2b-label1', {{ opacity:0, y:12 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02d')});
  ft('#s2b-label2', {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s02d', 1.2)});
  tl.to('#s2b', {{ opacity:0, duration:0.4 }}, {s2b_fadeout});
  tl.set('#s2c', {{ opacity: 1 }}, {at('s02e')});
  ft('#s2c',       {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s02e')});
  ft('#s2c-l1',    {{ opacity:0, y:20 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02e', 0.5)});
  ft('#s2c-l2',    {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s02e', 2.5)});
  ft('#s2c-badge', {{ opacity:0, y:12 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s02e', 4.5)});
  tl.to('#s2', {{ opacity:0, duration:0.5 }}, {fade(s2e)});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi(s2e)});
  tl.to('#flash', {{ opacity:0, duration:0.2  }}, {fo(s2e)});

  // SCENE 3 — Building Block
  tl.set('#s3', {{ opacity: 1 }}, {at('s03a')});
  ft('#s3-header', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s03a', 0.2)});
  ft('#s3a',       {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s03a', 0.7)});
  ft('#s3a-input', {{ opacity:0 }},        {{ opacity:1, duration:0.4 }}, {at('s03a', 1.0)});
  ft('#s3a-l1',    {{ opacity:0, y:12 }},  {{ opacity:1, y:0, duration:0.4 }}, {at('s03a', 1.5)});
  ft('#s3a-l2',    {{ opacity:0, y:12 }},  {{ opacity:1, y:0, duration:0.4 }}, {at('s03a', 2.0)});
  ft('#s3a-ln',    {{ opacity:0, y:12 }},  {{ opacity:1, y:0, duration:0.4 }}, {at('s03a', 2.5)});
  ft('#s3b',        {{ opacity:0, x:20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s03a2')});
  ft('#s3b-input',  {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s03a2', 0.3)});
  ft('#s3b-arr-in', {{ opacity:0 }},       {{ opacity:1, duration:0.3 }}, {at('s03a2', 0.6)});
  ft('#s3b-sa',     {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5, ease:'back.out(1.2)' }}, {at('s03b_sa')});
  ft('#s3b-res1',   {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s03b_sa', 3.5)});
  ft('#s3b-ff',     {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5, ease:'back.out(1.2)' }}, {at('s03b_ff')});
  ft('#s3b-res2',   {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s03b_ff', 6.0)});
  ft('#s3b-output', {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s03b_ff', 6.5)});
  ft('#s3c', {{ opacity:0, y:20 }}, {{ opacity:1, y:0, duration:0.6 }}, {at('s03d')});
  tl.to('#s3', {{ opacity:0, duration:0.5 }}, {fade(s3e)});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi(s3e)});
  tl.to('#flash', {{ opacity:0, duration:0.2  }}, {fo(s3e)});

  // SCENE 4 — Encoder vs Decoder
  tl.set('#s4', {{ opacity: 1 }}, {at('s04a')});
  ft('#s4-header', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04a', 0.2)});
  tl.to('#s4-divider', {{ opacity:1, duration:0.3 }}, {at('s04a', 1.5)});
  draw('#s4-divider line', 700, 0.6, {at('s04a', 1.5)});
  ft('#s4-enc',      {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s04b1')});
  ft('#s4-enc-grid', {{ opacity:0 }},        {{ opacity:1, duration:0.4 }}, {at('s04b1', 0.3)});
  draw('#s4-enc-lines', 3000, 1.2, {at('s04b1', 0.6)});
  ft('#s4-enc-uses', {{ opacity:0, y:12 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04b2')});
  ft('#s4-enc-note', {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s04b3')});
  ft('#s4-dec',      {{ opacity:0, x:20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s04c1')});
  ft('#s4-dec-grid', {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s04c1', 0.3)});
  draw('#s4-dec-lines', 3000, 1.2, {at('s04c1', 0.6)});
  ft('#s4-dec-uses', {{ opacity:0, y:12 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04c2')});
  ft('#s4-dec-note', {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s04c2', 0.6)});
  ft('#s4-consequence', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s04d')});
  tl.to('#s4', {{ opacity:0, duration:0.5 }}, {fade(s4e)});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi(s4e)});
  tl.to('#flash', {{ opacity:0, duration:0.2  }}, {fo(s4e)});

  // SCENE 5 — How Generation Works
  tl.set('#s5', {{ opacity: 1 }}, {at('s05a')});
  ft('#s5-header',   {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s05a', 0.2)});
  ft('#s5-pipeline', {{ opacity:0 }},       {{ opacity:1, duration:0.4 }}, {at('s05a', 0.8)});
  ft('#s5-step1', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s05a', 1.5)});
  ft('#s5-arr1',  {{ opacity:0 }},        {{ opacity:1, duration:0.3 }}, {at('s05a', 2.2)});
  draw('#s5-arr1 line', 64, 0.3, {at('s05a', 2.2)});
  ft('#s5-step2', {{ opacity:0, y:16 }},  {{ opacity:1, y:0, duration:0.5 }}, {at('s05a', 3.2)});
  ft('#s5-arr2',  {{ opacity:0 }},        {{ opacity:1, duration:0.3 }}, {at('s05a', 3.9)});
  draw('#s5-arr2 line', 64, 0.3, {at('s05a', 3.9)});
  ft('#s5-step3', {{ opacity:0, y:16 }},  {{ opacity:1, y:0, duration:0.5 }}, {at('s05a', 4.8)});
  tl.to('#s5-bar1', {{ width:'42%', duration:0.6, ease:'power2.out' }}, {at('s05a', 7.0)});
  tl.to('#s5-bar2', {{ width:'28%', duration:0.6, ease:'power2.out' }}, {at('s05a', 7.5)});
  tl.to('#s5-bar3', {{ width:'14%', duration:0.6, ease:'power2.out' }}, {at('s05a', 8.0)});
  ft('#s5-sample', {{ opacity:0, x:16 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s05b')});
  ft('#s5-loop',   {{ opacity:0 }},       {{ opacity:1, duration:0.5 }}, {at('s05b', 0.5)});
  draw('#s5-loop-path', 4000, 1.2, {at('s05b', 1.0)});
  ft('#s5-cost', {{ opacity:0, y:20 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s05c')});
  tl.to('#s5', {{ opacity:0, duration:0.5 }}, {fade(s5e)});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi(s5e)});
  tl.to('#flash', {{ opacity:0, duration:0.2  }}, {fo(s5e)});

  // SCENE 6 — Why It Scales
  tl.set('#s6', {{ opacity: 1 }}, {at('s06a')});
  ft('#s6-header', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s06a', 0.2)});
  ft('#s6a', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s06a', 2.0)});
  draw('#s6-curve-old', 700, 1.2, {at('s06a', 2.5)});
  ft('#s6-label-old', {{ opacity:0 }}, {{ opacity:1, duration:0.4 }}, {at('s06a', 4.0)});
  draw('#s6-curve-new', 700, 1.4, {at('s06a', 5.0)});
  ft('#s6-label-new', {{ opacity:0 }}, {{ opacity:1, duration:0.4 }}, {at('s06a', 6.5)});
  ft('#s6b',       {{ opacity:0, x:20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s06b')});
  ft('#s6b-years', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s06c')});
  ft('#s6c',       {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s06d')});
  tl.to('#s6', {{ opacity:0, duration:0.5 }}, {fade(s6e)});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi(s6e)});
  tl.to('#flash', {{ opacity:0, duration:0.2  }}, {fo(s6e)});

  // SCENE 7 — KV Cache
  tl.set('#s7', {{ opacity: 1 }}, {at('s07a')});
  ft('#s7-header', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s07a', 0.2)});
  ft('#s7a', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s07a', 4.5)});
  ft('#s7a-r1', {{ opacity:0 }}, {{ opacity:1, duration:0.3 }}, {at('s07a', 5.0)});
  tl.to('#s7a-bar1', {{ width:'14%', duration:0.5, ease:'power2.out' }}, {at('s07a', 5.2)});
  ft('#s7a-r2', {{ opacity:0 }}, {{ opacity:1, duration:0.3 }}, {at('s07a', 7.5)});
  tl.to('#s7a-bar2', {{ width:'30%', duration:0.5, ease:'power2.out' }}, {at('s07a', 7.7)});
  ft('#s7a-r3', {{ opacity:0 }}, {{ opacity:1, duration:0.3 }}, {at('s07a', 9.5)});
  tl.to('#s7a-bar3', {{ width:'60%', duration:0.5, ease:'power2.out' }}, {at('s07a', 9.7)});
  ft('#s7a-r4', {{ opacity:0 }}, {{ opacity:1, duration:0.3 }}, {at('s07a', 12.0)});
  tl.to('#s7a-bar4', {{ width:'92%', duration:0.6, ease:'power2.out' }}, {at('s07a', 12.2)});
  ft('#s7a-note', {{ opacity:0 }}, {{ opacity:1, duration:0.4 }}, {at('s07a', 14.0)});
  ft('#s7b', {{ opacity:0, x:20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s07b')});
  ft('#s7b-r1', {{ opacity:0 }}, {{ opacity:1, duration:0.3 }}, {at('s07b', 1.0)});
  tl.to('#s7b-mw', {{ width:'52%', duration:0.6, ease:'power2.out' }}, {at('s07b', 1.2)});
  ft('#s7b-r2', {{ opacity:0 }}, {{ opacity:1, duration:0.3 }}, {at('s07b', 4.0)});
  tl.to('#s7b-kv', {{ width:'72%', duration:0.8, ease:'power2.out' }}, {at('s07b', 4.2)});
  ft('#s7b-label', {{ opacity:0 }}, {{ opacity:1, duration:0.4 }}, {at('s07b', 5.5)});
  ft('#s7c', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s07c')});
  tl.to('#s7', {{ opacity:0, duration:0.5 }}, {fade(s7e)});
  tl.to('#flash', {{ opacity:1, duration:0.07 }}, {fi(s7e)});
  tl.to('#flash', {{ opacity:0, duration:0.2  }}, {fo(s7e)});

  // SCENE 8 — Summary
  tl.set('#s8', {{ opacity: 1 }}, {at('s08a')});
  ft('#s8-header', {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.5 }}, {at('s08a', 0.2)});
  draw('#s8-uline', 480, 0.7, {at('s08a', 0.5)});
  ft('#s8-b1', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s08a', 0.8)});
  ft('#s8-b2', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s08b')});
  ft('#s8-b3', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s08c')});
  ft('#s8-b4', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s08d')});
  ft('#s8-b5', {{ opacity:0, x:-20 }}, {{ opacity:1, x:0, duration:0.5 }}, {at('s08e')});

  // End marker
  tl.set({{}}, {{}}, {end_marker});

  window.__timelines = window.__timelines || {{}};
  window.__timelines['transformer-architecture'] = tl;"""
    return js


# ─── HTML PATCHER ────────────────────────────────────────────────────────────

def patch_html(T, D):
    """Replace inline <script> in index.html with freshly generated GSAP."""
    html = HTML_PATH.read_text()
    new_script = make_gsap(T, D)
    patched = re.sub(
        r'(<script>)(.*?)(</script>)',
        lambda m: m.group(1) + "\n" + new_script + "\n" + m.group(3),
        html, flags=re.DOTALL
    )
    if patched == html:
        print("  ⚠ <script> block not found — index.html not updated")
        return
    HTML_PATH.write_text(patched)
    print("  ✓ index.html GSAP rewritten from beat timestamps")


def patch_preview(T, D):
    """Update TOTAL and SCENES in preview.html."""
    if not PREVIEW_PATH.exists():
        return
    scene_first = {}
    for b in BEATS:
        sn = b["scene"]
        if sn not in scene_first:
            scene_first[sn] = T[b["id"]]

    labels = {
        1: "01 — Introduction",  2: "02 — What It Replaced",
        3: "03 — Building Block", 4: "04 — Encoder vs Decoder",
        5: "05 — How Generation Works", 6: "06 — Why It Scales",
        7: "07 — KV Cache",       8: "08 — Summary",
    }
    scenes_js = ",\n    ".join(
        f'{{ t: {round(scene_first[s], 1)}, label: \'{labels[s]}\' }}'
        for s in sorted(scene_first)
    )
    total = round(T["s08e"] + D["s08e"] + 2.0, 2)

    html = PREVIEW_PATH.read_text()
    html = re.sub(r'const SCENES\s*=\s*\[.*?\];',
                  f'const SCENES = [\n    {scenes_js}\n  ];', html, flags=re.DOTALL)
    html = re.sub(r'const TOTAL\s*=\s*[\d.]+;', f'const TOTAL   = {total};', html)
    html = re.sub(r'max="[\d.]+"', f'max="{total}"', html)
    PREVIEW_PATH.write_text(html)
    print(f"  ✓ preview.html updated  (TOTAL={total}s)")


# ─── MAIN ────────────────────────────────────────────────────────────────────

def build():
    TMP_DIR.mkdir(exist_ok=True)
    os.chdir(COMP_DIR)

    print(f"\n{'='*60}")
    print(f"  Beat-granular TTS  —  voice: {VOICE}  —  {len(BEATS)} beats")
    print(f"{'='*60}\n")

    beat_wavs = []
    beat_durations = {}

    for i, beat in enumerate(BEATS):
        out = TMP_DIR / f"{beat['id']}.wav"
        print(f"[{i+1:02d}/{len(BEATS)}] {beat['id']}  {beat['text'][:60]}...")
        generate_tts(beat["text"], out)
        dur = get_duration(out)
        beat_durations[beat["id"]] = round(dur, 3)
        beat_wavs.append((beat, out))
        print(f"        → {dur:.2f}s\n")

    # ── Compute cumulative start times ────────────────────────────────────────
    beat_starts = {}
    cursor = 0.0
    prev_scene = None
    for beat, _ in beat_wavs:
        if prev_scene is not None and beat["scene"] != prev_scene:
            cursor = round(cursor + SCENE_GAP, 3)
        beat_starts[beat["id"]] = round(cursor, 3)
        cursor = round(cursor + beat_durations[beat["id"]], 3)
        prev_scene = beat["scene"]

    total_dur = round(cursor + 2.0, 2)

    print("Beat start times:")
    for beat, _ in beat_wavs:
        bid = beat["id"]
        print(f"  {bid:<12}  {beat_starts[bid]:>7.2f}s  (dur={beat_durations[bid]:.2f}s)")
    print(f"\n  Total: {total_dur:.2f}s\n")

    # ── Stitch with ffmpeg concat ─────────────────────────────────────────────
    # Build list of clips in order (with silence inserted between scenes)
    silence_path = TMP_DIR / "silence.wav"
    make_silence(SCENE_GAP, silence_path)

    concat_list = TMP_DIR / "concat.txt"
    with open(concat_list, "w") as f:
        prev_scene = None
        for beat, wav_path in beat_wavs:
            if prev_scene is not None and beat["scene"] != prev_scene:
                f.write(f"file '{silence_path}'\n")
            f.write(f"file '{wav_path}'\n")
            prev_scene = beat["scene"]

    narration_path = AUDIO_DIR / "narration.wav"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0",
         "-i", str(concat_list), str(narration_path)])
    actual_dur = get_duration(narration_path)
    print(f"✓ narration.wav  —  {actual_dur:.2f}s\n")

    # ── Save beat_timestamps.json ─────────────────────────────────────────────
    ts_data = {
        "total_duration": actual_dur,
        "voice": VOICE,
        "beats": [
            {
                "id": b["id"],
                "scene": b["scene"],
                "start": beat_starts[b["id"]],
                "duration": beat_durations[b["id"]],
                "text_preview": b["text"][:60],
            }
            for b in BEATS
        ]
    }
    BEATS_TS.write_text(json.dumps(ts_data, indent=2))
    print("✓ beat_timestamps.json written\n")

    # ── Patch index.html and preview.html ────────────────────────────────────
    print("Patching index.html...")
    patch_html(beat_starts, beat_durations)
    print("Patching preview.html...")
    patch_preview(beat_starts, beat_durations)

    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print("\n✓ Done — run: npx hyperframes render src/hyperframes/TransformerArchitecture\n")


def gsap_only():
    """Re-patch index.html from saved beat_timestamps.json (no TTS re-run)."""
    if not BEATS_TS.exists():
        print("✗ beat_timestamps.json not found — run without --gsap-only first")
        sys.exit(1)
    data = json.loads(BEATS_TS.read_text())
    T = {b["id"]: b["start"]    for b in data["beats"]}
    D = {b["id"]: b["duration"] for b in data["beats"]}
    os.chdir(COMP_DIR)
    print("Patching index.html from saved beat_timestamps.json...")
    patch_html(T, D)
    print("Patching preview.html...")
    patch_preview(T, D)
    print("✓ Done\n")


if __name__ == "__main__":
    if "--gsap-only" in sys.argv:
        gsap_only()
    else:
        build()

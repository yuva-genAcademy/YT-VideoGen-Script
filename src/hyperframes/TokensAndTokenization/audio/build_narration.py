#!/usr/bin/env python3
"""
Build tokens-narration.wav for the Tokens and Tokenization video.
Generates each section's TTS audio, compacts the timeline to eliminate
dead gaps, mixes all sections, and writes timestamps.json for Remotion.

Voice: bm_george (British male — expressive, natural intonation)
Output: <project_root>/public/tokens-narration.wav
"""

import subprocess
import json
import os
import sys
import shutil

VOICE = "bm_george"
AUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
COMP_DIR  = os.path.dirname(AUDIO_DIR)
# Navigate up: audio/ → TokensAndTokenization/ → hyperframes/ → src/ → project root
OUTPUT_WAV = os.path.join(AUDIO_DIR, "narration.wav")

TMP_DIR            = os.path.join(AUDIO_DIR, "_tmp_sections")
SCRIPT_CLEAN_PATH  = os.path.join(COMP_DIR, "SCRIPT_CLEAN.md")
TIMESTAMPS_PATH    = os.path.join(AUDIO_DIR, "timestamps.json")


def load_narration_texts():
    """
    Parse SCRIPT_CLEAN.md and return a list of paragraph strings,
    one per scene, in order.
    """
    with open(SCRIPT_CLEAN_PATH) as f:
        content = f.read()
    marker = "## Full narration"
    idx = content.index(marker)
    block = content[content.index("\n", idx) + 1:]
    paragraphs = [p.strip() for p in block.split("\n\n")
                  if p.strip() and not p.strip().startswith("#")]
    return paragraphs


# ─── SECTION DEFINITIONS ────────────────────────────────────────────────────
# start/end come from the SCRIPT_CLEAN.md timing map.
# Text is loaded from SCRIPT_CLEAN.md at runtime.

SECTIONS = [
    { "id": "s01", "label": "What Is a Token",        "start":   0.00, "end":  18.00 },
    { "id": "s02", "label": "Why Tokenization Exists", "start":  18.00, "end":  42.00 },
    { "id": "s03", "label": "How BPE Works",           "start":  41.50, "end":  77.00 },
    { "id": "s04", "label": "Tokens Are Not Words",    "start":  76.50, "end": 103.00 },
    { "id": "s05", "label": "Cost",                    "start": 102.50, "end": 127.00 },
    { "id": "s06", "label": "Context Window",          "start": 126.50, "end": 159.00 },
    { "id": "s07", "label": "Model Behavior",          "start": 158.50, "end": 190.00 },
    { "id": "s08", "label": "Practical Design Rules",  "start": 189.50, "end": 222.00 },
    { "id": "s09", "label": "Conclusion",              "start": 221.50, "end": 249.00 },
]

TAIL_SILENCE = 1.5   # seconds after audio ends before scene fades out
GAP          = 0.5   # seconds between previous scene fade-out and next scene start

# Inject narration text from SCRIPT_CLEAN.md
_narration_texts = load_narration_texts()
if len(_narration_texts) != len(SECTIONS):
    print(f"✗ SCRIPT_CLEAN.md has {len(_narration_texts)} paragraphs but SECTIONS has {len(SECTIONS)} entries")
    sys.exit(1)
for _sec, _text in zip(SECTIONS, _narration_texts):
    _sec["text"] = _text


# ─── HELPERS ────────────────────────────────────────────────────────────────

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(f"Error running {cmd[0]}:\n{r.stderr[-1500:]}")
        sys.exit(1)
    return r


def get_duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "json", path])
    return float(json.loads(r.stdout)["format"]["duration"])


def generate_tts(text, out_path, speed=1.0):
    txt = out_path.replace(".wav", ".txt")
    with open(txt, "w") as f:
        f.write(text)
    run(["npx", "--yes", "hyperframes", "tts",
         "--file", txt, "--output", out_path,
         "--voice", VOICE, "--speed", str(round(speed, 4))])


def fit_section(section, tmp_dir):
    """Generate TTS for one section; speed up if it overflows its window."""
    window = section["end"] - section["start"]
    wav    = os.path.join(tmp_dir, f"{section['id']}.wav")
    speed  = 1.0

    for attempt in range(4):
        generate_tts(section["text"], wav, speed=speed)
        dur = get_duration(wav)
        print(f"    attempt {attempt+1}: speed={speed:.3f}  dur={dur:.2f}s  window={window:.2f}s")
        if dur <= window + 0.3:
            print("    ✓ fits")
            return wav, dur
        speed = min(speed * (dur / window) * 1.02, 1.6)

    # Force with atempo as last resort
    print("    forcing with atempo...")
    fitted = wav.replace(".wav", "_fitted.wav")
    tempo  = min(dur / window, 2.0)
    run(["ffmpeg", "-y", "-i", wav, "-filter:a", f"atempo={tempo:.4f}", fitted])
    return fitted, get_duration(fitted)


# ─── TIMELINE COMPACTOR ─────────────────────────────────────────────────────

def compact_timeline(section_durations):
    """
    Eliminate dead gaps between scenes. Each scene starts right after
    the previous scene's audio ends + TAIL_SILENCE + GAP.
    Updates SECTIONS in-memory and returns the new total video duration.
    """
    new_starts = []
    t = 0.0
    for sec in SECTIONS:
        new_starts.append(round(t, 2))
        audio_end = t + section_durations[sec["id"]]
        t = round(audio_end + TAIL_SILENCE + GAP, 2)
    new_total = round(t, 2)

    print(f"  Original end: {SECTIONS[-1]['end']}s  →  Compact end: {new_total}s")

    for i in range(len(SECTIONS)):
        window_len = SECTIONS[i]["end"] - SECTIONS[i]["start"]
        old_s = SECTIONS[i]["start"]
        SECTIONS[i]["start"] = new_starts[i]
        SECTIONS[i]["end"]   = round(new_starts[i] + window_len, 2)
        delta = round(old_s - new_starts[i], 3)
        if abs(delta) >= 0.005:
            print(f"  {SECTIONS[i]['id']}: {old_s}s → {new_starts[i]}s  (−{delta:.2f}s)")

    return new_total


# ─── MAIN ───────────────────────────────────────────────────────────────────

def build():
    os.makedirs(TMP_DIR, exist_ok=True)
    os.makedirs(AUDIO_DIR, exist_ok=True)
    os.chdir(COMP_DIR)

    total = len(SECTIONS)
    print(f"\n{'='*60}")
    print(f"  Tokens & Tokenization narration  —  voice: {VOICE}")
    print(f"{'='*60}\n")

    # ── Step 1: Generate TTS for all sections ────────────────────────────
    section_wavs      = []
    section_durations = {}

    for i, sec in enumerate(SECTIONS):
        window = sec["end"] - sec["start"]
        print(f"[{i+1:02d}/{total}] {sec['id']} — {sec['label']}  window={window:.2f}s")
        wav, dur = fit_section(sec, TMP_DIR)
        section_wavs.append(wav)
        section_durations[sec["id"]] = dur
        print()

    # ── Step 2: Compact timeline — eliminate all dead gaps ───────────────
    print("Compacting timeline (cutting dead gaps)...")
    new_total = compact_timeline(section_durations)
    print()

    # ── Step 3: Mix audio at compacted start times ───────────────────────
    print("Mixing sections with ffmpeg...")
    inputs = []
    for wav in section_wavs:
        inputs += ["-i", wav]

    filter_parts = []
    mix_labels   = []
    for idx, sec in enumerate(SECTIONS):
        delay_ms = int(sec["start"] * 1000)
        label = f"[a{idx}]"
        filter_parts.append(f"[{idx}]adelay={delay_ms}|{delay_ms}{label}")
        mix_labels.append(label)

    n = len(SECTIONS)
    filter_complex  = ";".join(filter_parts)
    filter_complex += f";{''.join(mix_labels)}amix=inputs={n}:normalize=0:dropout_transition=0[out]"

    run(["ffmpeg", "-y"] + inputs + [
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-t", str(new_total),
        OUTPUT_WAV,
    ])

    final_dur = get_duration(OUTPUT_WAV)
    print(f"\n✓ tokens-narration.wav  —  {final_dur:.2f}s\n")
    print(f"  Saved to: {OUTPUT_WAV}\n")

    # ── Step 4: Write timestamps.json ────────────────────────────────────
    ts = {
        "total_duration": final_dur,
        "voice": VOICE,
        "output_wav": "tokens-narration.wav",
        "sections": [
            {
                "id":             s["id"],
                "label":          s["label"],
                "start":          s["start"],
                "audio_duration": round(section_durations[s["id"]], 3),
                "end":            s["end"],
            }
            for s in SECTIONS
        ],
    }
    with open(TIMESTAMPS_PATH, "w") as f:
        json.dump(ts, f, indent=2)
    print("✓ timestamps.json written\n")

    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print("✓ Done — open src/hyperframes/TokensAndTokenization/index.html to preview\n")


if __name__ == "__main__":
    build()

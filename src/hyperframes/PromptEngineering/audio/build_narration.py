#!/usr/bin/env python3
"""
Build narration.wav — generates each section at its exact GSAP start time,
then auto-patches the GSAP fade-out timings so there's no dead silence
between technique scenes.

Voice: bm_george (British male — expressive, natural intonation)
"""

import subprocess
import json
import os
import re
import sys
import shutil

VOICE = "bm_george"
AUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
COMP_DIR = os.path.dirname(AUDIO_DIR)
HTML_PATH = os.path.join(COMP_DIR, "index.html")
TMP_DIR = os.path.join(AUDIO_DIR, "_tmp_sections")

# ─── SECTION DEFINITIONS ────────────────────────────────────────────────────
# start/end come from the GSAP tl.set / tl.to timestamps.
# Narration is written to match the Python code optimisation prompt shown
# visually throughout the video.

SECTIONS = [
    # ── Target pace: 130 wpm  (words ÷ 130 × 60 = seconds) ────────────────
    {
        "id": "s01",
        "label": "Hook",
        "start": 0.0,
        "end": 25.25,
        # 52 words → 24.0s  ✓
        "text": (
            "You're using AI wrong. And so is almost everyone else. "
            "Not because the AI is broken — but because of how you talk to it. "
            "Same model. Completely different results. "
            "The difference is the technique. "
            "There are eight prompt engineering techniques. "
            "Master them, and your AI becomes a completely different tool."
        ),
    },
    {
        "id": "s02",
        "label": "Base Prompt",
        "start": 25.75,
        "end": 34.0,
        # 18 words → 8.3s  ✓
        "text": (
            "One prompt. Eight techniques. "
            "My Python code is slow — how do I make it faster? "
            "Watch what changes."
        ),
    },
    {
        "id": "s03",
        "label": "Zero-Shot",
        "start": 34.5,
        "end": 53.25,
        # 37 words → 17.1s  ✓
        "text": (
            "Technique one. Zero-Shot. "
            "You ask the question directly — no context, no guidance, no examples. "
            "The response is correct but generic. "
            "The AI doesn't know your specific codebase. "
            "Use this for quick lookups where precision isn't critical."
        ),
    },
    {
        "id": "s04",
        "label": "Role Prompting",
        "start": 53.75,
        "end": 72.12,
        # 34 words → 15.7s  ✓
        "text": (
            "Technique two. Role Prompting. "
            "Give the AI a persona. "
            "You are a senior Python performance engineer. "
            "Now it responds like one — precise, experienced, actionable. "
            "Use it whenever expertise level or audience matters."
        ),
    },
    {
        "id": "s05",
        "label": "Few-Shot",
        "start": 72.62,
        "end": 91.0,
        # 35 words → 16.2s  ✓
        "text": (
            "Technique three. Few-Shot Prompting. "
            "We lead with two examples that show the AI the style we want. "
            "It recognises the pattern and mirrors it exactly. "
            "Use it whenever consistency and output format matter."
        ),
    },
    {
        "id": "s06",
        "label": "Chain of Thought",
        "start": 91.5,
        "end": 117.75,
        # 55 words → 25.4s  ✓
        "text": (
            "Technique four. Chain of Thought. "
            "Add just a few words: Think step by step. "
            "Instead of jumping to an answer, "
            "the AI walks through full reasoning — "
            "diagnosing the bottleneck, profiling it, identifying the fix, then summarising. "
            "Each step builds on the last toward a clear conclusion. "
            "Use it whenever the quality of reasoning matters more than speed."
        ),
    },
    {
        "id": "s07",
        "label": "Self-Consistency",
        "start": 118.25,
        "end": 136.25,
        # 38 words → 17.5s  ✓
        # Video shows 3 differently-phrased versions of the same question
        "text": (
            "Technique five. Self-Consistency. "
            "Ask the same question three different ways. "
            "Compare all three responses and look for consensus. "
            "The idea that appears across multiple answers is the most reliable one. "
            "Use it when accuracy matters most."
        ),
    },
    {
        "id": "s08",
        "label": "Tree of Thoughts",
        "start": 136.75,
        "end": 154.85,
        # 39 words → 18.0s  ✓
        # Video shows 3 parallel branches all contributing to a synthesised answer
        "text": (
            "Technique six. Tree of Thoughts. "
            "Instead of one reasoning path, the AI explores three in parallel. "
            "It evaluates all three approaches "
            "and synthesises the best elements into one recommendation. "
            "Use it for architecture decisions or any multi-path problem."
        ),
    },
    {
        "id": "s09",
        "label": "ReAct",
        "start": 155.35,
        "end": 173.35,
        # 37 words → 17.1s  ✓
        "text": (
            "Technique seven. ReAct. Reasoning plus Acting. "
            "The AI thinks, takes an action, observes the result — then repeats. "
            "Profile code, spot the bottleneck, fix it precisely. "
            "This is how real AI agents like Cursor and Claude work."
        ),
    },
    {
        "id": "s10",
        "label": "Prompt Chaining",
        "start": 173.85,
        "end": 192.25,
        # 37 words → 17.1s  ✓
        "text": (
            "Technique eight. Prompt Chaining. "
            "Break complex tasks into a sequence of focused prompts. "
            "Feed each response as input to the next. "
            "First diagnose the root causes, then plan the fix. "
            "Each step builds on the last."
        ),
    },
    {
        "id": "s11",
        "label": "Comparison",
        "start": 192.75,
        "end": 237.25,
        # 94 words → 43.4s  ✓  (rows timed to match narration in GSAP)
        "text": (
            "Now let's look at all eight techniques side by side. "
            "Zero-Shot — generic, no direction. "
            "Role Prompting — targeted, tailored to your audience. "
            "Few-Shot — precise, pattern-matched quality. "
            "Chain of Thought — structured, deep, reasoned logic. "
            "Self-Consistency — reliable, verified across multiple answers. "
            "Tree of Thoughts — exploratory, following the strongest path. "
            "ReAct — dynamic, reasoning and acting in real time. "
            "Prompt Chaining — powerful, building step by step toward complex goals. "
            "Same question. Every single time. "
            "The only variable is the prompt. "
            "Stack these techniques, and you don't just get better answers — "
            "you unlock what AI was actually built to do."
        ),
    },
    {
        "id": "s12",
        "label": "Outro",
        "start": 237.75,
        "end": 258.75,
        # 46 words → 21.2s  ✓
        "text": (
            "Prompt engineering isn't magic — it's communication. "
            "The clearer you are, the better the AI performs. "
            "These eight techniques are skills anyone can learn. "
            "And once you have them, every AI tool you use "
            "becomes ten times more powerful. "
            "Master the prompt. Master the AI."
        ),
    },
]

# ─── GSAP PATCH MAP ─────────────────────────────────────────────────────────
# format: (gsap_selector, has_flash_after)
# Current fade-out time is read dynamically from the HTML — no hardcoded values.
GSAP_FADEOUTS = {
    "s01": ("s1",  True),
    "s02": ("s2",  False),
    "s03": ("s3",  False),
    "s04": ("s4",  False),
    "s05": ("s5",  False),
    "s06": ("s6",  False),
    "s07": ("s7",  True),
    "s08": ("s8",  True),
    "s09": ("s9",  True),
    "s10": ("s10", True),
    "s11": ("s11", False),
    # s12 has no explicit fade-out (video just ends)
}

TAIL_SILENCE = 1.5   # seconds after audio ends before scene fades out
FLASH_OFFSET = 0.40  # seconds after fadeout when flash fires


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
    wav = os.path.join(tmp_dir, f"{section['id']}.wav")
    speed = 1.0

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
    tempo = min(dur / window, 2.0)
    run(["ffmpeg", "-y", "-i", wav, "-filter:a", f"atempo={tempo:.4f}", fitted])
    return fitted, get_duration(fitted)


# ─── TIMELINE COMPACTOR ─────────────────────────────────────────────────────

def shift_line_ts(line, delta):
    """
    Shift the GSAP timestamp argument in one GSAP call line by -delta seconds.
    Handles: tl.to/tl.set/ft (last arg after final '}'), draw() (4th arg),
             const rowT arrays, and forEach(BASE + i * STEP) patterns.
    """
    stripped = line.strip()
    if not stripped or stripped.startswith('//'):
        return line

    # draw(id, len, dur, TIME[, ease]) — shift 4th argument
    if re.search(r'\bdraw\s*\(', line) and \
       re.search(r'draw\s*\([^,]+,\s*[\d.]+,\s*[\d.]+,\s*[\d.]', line):
        return re.sub(
            r'(draw\s*\([^,]+,\s*[\d.]+,\s*[\d.]+,\s*)([\d.]+)',
            lambda m: m.group(1) + str(round(float(m.group(2)) - delta, 2)),
            line
        )

    # const rowT = [T1, T2, ...] — shift every float in the array
    if re.match(r'\s*const rowT\s*=', line):
        return re.sub(r'[\d]+\.[\d]+',
                      lambda m: str(round(float(m.group(0)) - delta, 1)), line)

    # forEach with computed time (BASE + i * STEP) — shift BASE only
    if 'forEach' in line and re.search(r'[\d.]+\s*\+\s*i\s*\*', line):
        return re.sub(
            r'([\d.]+)(\s*\+\s*i\s*\*)',
            lambda m: str(round(float(m.group(1)) - delta, 2)) + m.group(2),
            line
        )

    # General case: time argument follows the last '}' in tl.to/tl.set/ft calls
    return re.sub(
        r'(\}\s*,\s*)([\d.]+)(\s*(?:,\s*[\'"][^\'"]*[\'"])?\s*\)\s*;)',
        lambda m: m.group(1) + str(round(float(m.group(2)) - delta, 2)) + m.group(3),
        line
    )


def compact_timeline(section_durations):
    """
    Eliminate dead gaps between scenes by shifting each scene to start
    right after the previous scene's audio ends + tail silence + a small gap.

    Patches all absolute timestamps in index.html and updates SECTIONS in-memory.
    Returns the new total video duration.
    """
    GAP = 0.5  # seconds between previous scene's fade-out and next scene start

    # Calculate compact start times
    new_starts = []
    t = 0.0
    for sec in SECTIONS:
        new_starts.append(round(t, 2))
        audio_end = t + section_durations[sec["id"]]
        t = round(audio_end + TAIL_SILENCE + GAP, 2)
    new_total = round(t, 2)

    deltas = [round(SECTIONS[i]["start"] - new_starts[i], 3)
              for i in range(len(SECTIONS))]

    print(f"  Original end: {SECTIONS[-1]['end']}s  →  Compact end: {new_total}s")

    with open(HTML_PATH) as f:
        html = f.read()

    # Find <script> block
    sm = re.search(r'(<script>)(.*?)(</script>)', html, re.DOTALL)
    if not sm:
        print("  ⚠ <script> not found — skipping compact")
        return new_total

    script = sm.group(2)

    # Process line-by-line; track current scene via '// SCENE N' comment
    out_lines = []
    current_delta = 0.0
    for line in script.split('\n'):
        scene_m = re.search(r'//\s*SCENE\s+(\d+)', line)
        if scene_m:
            idx = int(scene_m.group(1)) - 1  # 0-indexed
            current_delta = deltas[idx] if idx < len(deltas) else 0.0
        shifted = shift_line_ts(line, current_delta) if abs(current_delta) >= 0.005 else line
        out_lines.append(shifted)

    new_script = '\n'.join(out_lines)
    html = html[:sm.start(2)] + new_script + html[sm.end(2):]

    with open(HTML_PATH, 'w') as f:
        f.write(html)

    # Update SECTIONS in-memory
    for i in range(len(SECTIONS)):
        window_len = SECTIONS[i]["end"] - SECTIONS[i]["start"]
        old_s = SECTIONS[i]["start"]
        SECTIONS[i]["start"] = new_starts[i]
        SECTIONS[i]["end"] = round(new_starts[i] + window_len, 2)
        if abs(deltas[i]) >= 0.005:
            print(f"  {SECTIONS[i]['id']}: {old_s}s → {new_starts[i]}s  (−{deltas[i]:.2f}s)")

    return new_total


# ─── GSAP PATCHER ───────────────────────────────────────────────────────────

def patch_gsap(section_durations):
    """
    Set each scene's GSAP fade-out time to audio_end + TAIL_SILENCE,
    extended to next_scene_start - 0.5s if audio ends early (no blank screen).
    Uses regex exclusively — no hardcoded old timestamps.
    """
    with open(HTML_PATH, "r") as f:
        html = f.read()

    for sec in SECTIONS:
        sid = sec["id"]
        if sid not in GSAP_FADEOUTS:
            continue

        gsap_sel, has_flash = GSAP_FADEOUTS[sid]
        audio_dur = section_durations[sid]
        audio_end = sec["start"] + audio_dur
        min_fade  = audio_end + TAIL_SILENCE

        sec_idx = next(j for j, s in enumerate(SECTIONS) if s["id"] == sid)
        if sec_idx + 1 < len(SECTIONS):
            next_start = SECTIONS[sec_idx + 1]["start"]
            max_fade = min(next_start - 0.5, sec["end"] - 0.1)
        else:
            max_fade = sec["end"] - 0.1

        new_fade = round(max(min_fade, max_fade) if max_fade > min_fade else min_fade, 2)

        dur_str = "0.6" if gsap_sel == "s11" else "0.5"

        # Read current fade-out value from HTML (for flash offset calculation)
        cur_m = re.search(
            rf"tl\.to\('#{re.escape(gsap_sel)}',\s*\{{\s*opacity:0,\s*duration:{re.escape(dur_str)}\s*\}},\s*([\d.]+)\s*\);",
            html
        )
        cur_fade = float(cur_m.group(1)) if cur_m else min_fade

        # Patch the fade-out line using regex
        pattern = rf"(tl\.to\('#{re.escape(gsap_sel)}',\s*\{{\s*opacity:0,\s*duration:{re.escape(dur_str)}\s*\}},\s*)([\d.]+)(\s*\);)"
        cur_m2 = re.search(pattern, html)
        if cur_m2 and abs(float(cur_m2.group(2)) - new_fade) < 0.005:
            print(f"  #{gsap_sel} fade-out already correct ({new_fade}s) ✓")
        else:
            html_new = re.sub(pattern, rf"\g<1>{new_fade}\g<3>", html)
            if html_new == html:
                print(f"  ⚠ could not patch fade-out for #{gsap_sel}")
                continue
            html = html_new
            print(f"  patched #{gsap_sel} fade-out → {new_fade}s")

        # Update flash transitions (relative to old fade-out → new fade-out)
        if has_flash:
            cur_flash_in  = round(cur_fade + FLASH_OFFSET, 2)
            cur_flash_out = round(cur_flash_in + 0.07, 2)
            new_flash_in  = round(new_fade + FLASH_OFFSET, 2)
            new_flash_out = round(new_flash_in + 0.07, 2)

            for old_t, new_t in [(cur_flash_in, new_flash_in),
                                  (cur_flash_out, new_flash_out)]:
                fp = rf"(tl\.to\('#flash',\s*\{{[^}}]+\}},\s*){re.escape(str(old_t))}(\s*\);)"
                html_new = re.sub(fp, rf"\g<1>{new_t}\g<2>", html)
                if html_new != html:
                    html = html_new
                    print(f"    flash {old_t} → {new_t}s")

    with open(HTML_PATH, "w") as f:
        f.write(html)
    print("  ✓ index.html updated")


# ─── MAIN ───────────────────────────────────────────────────────────────────

def build():
    os.makedirs(TMP_DIR, exist_ok=True)
    os.chdir(COMP_DIR)

    total = len(SECTIONS)
    print(f"\n{'='*58}")
    print(f"  Building narration  —  voice: {VOICE}")
    print(f"{'='*58}\n")

    # ── Step 1: Generate TTS for all sections ────────────────────────────
    section_wavs = []     # wav paths (in SECTIONS order)
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
    mix_labels = []
    for idx, sec in enumerate(SECTIONS):
        delay_ms = int(sec["start"] * 1000)   # use COMPACTED start time
        label = f"[a{idx}]"
        filter_parts.append(f"[{idx}]adelay={delay_ms}|{delay_ms}{label}")
        mix_labels.append(label)

    n = len(SECTIONS)
    filter_complex = ";".join(filter_parts)
    filter_complex += f";{''.join(mix_labels)}amix=inputs={n}:normalize=0:dropout_transition=0[out]"

    output = os.path.join(AUDIO_DIR, "narration.wav")
    run(["ffmpeg", "-y"] + inputs + [
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-t", str(new_total),   # trim to compacted video length
        output,
    ])

    final_dur = get_duration(output)
    print(f"\n✓ narration.wav  —  {final_dur:.2f}s\n")

    # ── Step 4: Write timestamps.json ────────────────────────────────────
    ts = {
        "total_duration": final_dur,
        "voice": VOICE,
        "sections": [
            {
                "id": s["id"],
                "label": s["label"],
                "start": s["start"],
                "audio_duration": round(section_durations[s["id"]], 3),
                "end": s["end"],
            }
            for s in SECTIONS
        ],
    }
    ts_path = os.path.join(AUDIO_DIR, "timestamps.json")
    with open(ts_path, "w") as f:
        json.dump(ts, f, indent=2)
    print("✓ timestamps.json written")

    # ── Step 5: Patch GSAP fade-out timings in index.html ────────────────
    print("\nPatching GSAP fade-out timings...")
    patch_gsap(section_durations)

    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print("\n✓ Done\n")


def patch_only():
    """Re-patch GSAP fade-out timings using saved timestamps.json (no TTS re-generation)."""
    os.chdir(COMP_DIR)
    ts_path = os.path.join(AUDIO_DIR, "timestamps.json")
    if not os.path.exists(ts_path):
        print("✗ timestamps.json not found — run without --patch-only first")
        sys.exit(1)
    with open(ts_path) as f:
        ts = json.load(f)
    section_durations = {s["id"]: s["audio_duration"] for s in ts["sections"]}

    # Restore compacted start/end times from timestamps.json into SECTIONS
    for s_data in ts["sections"]:
        for sec in SECTIONS:
            if sec["id"] == s_data["id"]:
                window = sec["end"] - sec["start"]
                sec["start"] = s_data["start"]
                sec["end"]   = round(s_data["start"] + window, 2)
                break

    print("\nPatching GSAP fade-out timings (patch-only mode)...")
    patch_gsap(section_durations)
    print("\n✓ Done\n")


if __name__ == "__main__":
    if "--patch-only" in sys.argv:
        patch_only()
    else:
        build()

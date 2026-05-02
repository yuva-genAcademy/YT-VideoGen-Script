# Script Generation Prompt — Gen Academy

Use this prompt when generating a new course module script. Paste the topic into the placeholder and send to Claude (or any capable model).

---

## Prompt

```
Write a script for a Gen Academy course module on the following topic:

TOPIC: [Enter topic here — e.g. "Tokens and Tokenization" or "How Transformers Work"]

---

AUDIENCE
This is for the Gen Academy AI Engineering program. The audience is sharp and professional:
engineers, product managers, data scientists, founders, and senior leaders who want deep
technical understanding without hand-holding. Do not dumb it down. Do not add hype.

TONE
Confident, crisp, and direct. Like a brilliant instructor who respects the audience's time.
Not YouTube-style — no dramatic hooks, no "let's dive in", no "smash that subscribe button."
Think: lecture at a top-tier engineering school, distilled to its sharpest form.

FORMAT
Produce two outputs:

1. SCRIPT.md — the full annotated script with:
   - Total duration target and word count
   - Scene-by-scene breakdown in a table: Scene | Start | End | Window | Words
   - For each scene:
     - Scene title and timing window
     - Narration text in blockquote format
     - "On screen:" line describing the visual elements
     - "Beat:" line describing when animations trigger
   - Recording notes at the end (pace, pauses, emphasis words, tone guidance)

2. SCRIPT_CLEAN.md — narration only, no timestamps, no symbols, no stage directions:
   - One paragraph per scene, separated by blank lines
   - Expand ALL contractions (it's → it is, don't → do not, you'll → you will)
   - Write ALL numbers as words (30,000 → thirty thousand; 128 → one hundred twenty eight)
   - No symbols in text (≠ → is not equal to; % → percent; → → to)
   - Acronyms that are read as words: write as capitalised word (RAG → Rag, not R-A-G)
   - Acronyms that are spelled out letter by letter: keep as-is (RLHF, GPT)
   - This file is pasted directly into a TTS model — every character matters

CONSTRAINTS
- Total duration: 4 minutes 45 seconds maximum (~720 words at 160 wpm)
- 6–8 scenes maximum
- Each scene: 30–90 seconds
- Every sentence must teach something — no filler, no repetition, no padding
- End on a diagnostic or actionable insight — not a teaser for a next module

SCENE STRUCTURE GUIDE
Scene 1 — Intro (~30s, ~80 words)
  Hook: the core question or surprising insight this module answers.
  Three-line body: what the viewer will understand after watching.

Scene 2 — Architecture overview (~35s, ~90 words)
  If the topic has a pipeline or system diagram, this scene shows the full picture
  before drilling into each part. Numbered list format works best.

Scenes 3–6 — Core concepts (60–90s each, 150–200 words each)
  One major concept per scene. Use sub-phases:
  sub-phase A: define it
  sub-phase B: show how it works mechanically
  sub-phase C: the implication or tradeoff that practitioners care about

Scene 7 (optional) — Close (~35s, ~85 words)
  Three-phase recap. One diagnostic callout: "when X fails, the root cause is Y."
  No next-module teasers.

BEAT MARKERS (for SCRIPT.md only)
For each scene, list the individual visual beats — moments when a new element
should appear on screen. Each beat = one sentence or clause. Use this format:
  Beat 1: [element that appears] — "[first few words of the narration that triggers it]"
  Beat 2: [next element] — "[triggering phrase]"

Example beats for a scene about self-supervised learning:
  Beat 1: Title + underline — "This is self-supervised learning."
  Beat 2: Definition card — "No human labels required."
  Beat 3: Base model callout — "What you get is a base model"
```

---

## What to do with the output

1. Save as `src/hyperframes/<ModuleName>/SCRIPT.md` and `SCRIPT_CLEAN.md`
2. Use `VIDEO_PROMPT.md` to generate the HyperFrames composition from the script
3. Run `python3 audio/build_narration.py` to generate audio and sync

---

## Example topics used in this project

- How AI Is Trained — The Internet in a Box
- Prompt Engineering
- Neural Networks and Backpropagation
- Tokens and Tokenization
- Transformer Architecture

---

## Quality checklist before accepting a script

- [ ] Total word count is within ~720 words (≤4:45 at 160 wpm)
- [ ] No contractions in SCRIPT_CLEAN.md
- [ ] No symbols or numerals in SCRIPT_CLEAN.md
- [ ] Each scene has clear beat markers in SCRIPT.md
- [ ] Every sentence teaches something — no filler
- [ ] Tone is lecture-style, not YouTube-style
- [ ] Ends on a diagnostic or actionable insight, not a teaser

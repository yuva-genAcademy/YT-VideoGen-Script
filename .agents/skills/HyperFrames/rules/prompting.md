---
name: prompting
description: Vocabulary and patterns for describing videos to AI agents when using HyperFrames
metadata:
  tags: prompting, vocabulary, ai, agents, style, motion, tone
---

## Starting a session

Always load the skill context first (Claude Code):

```
/hyperframes
```

Then describe your video. The agent will scaffold, iterate, and render for you.

---

## Cold start — describe from scratch

Give: duration, subject, visual tone, and any specific scenes.

```
Create a 10-second product intro with:
- Dark background, teal accent color
- Fade-in title over blurred background
- Subtle upward slide for subtitle
- Soft background music
```

```
Build a 25-second explainer for a B2B SaaS product.
Clean white background, corporate blue accents.
Show 3 feature callouts with icons, end with a CTA button reveal.
```

## Warm start — from a URL

```
Turn this website into a 25-second product launch video:
https://example.com
Bold, cinematic, dark theme energy.
```

```
Create a 15-second social reel from https://example.com.
Portrait format (1080×1920), hype energy, fast cuts.
```

---

## Motion vocabulary

Use these exact words — agents map them to GSAP eases:

| Word | Resulting ease |
|------|---------------|
| "smooth" | `power2.out` |
| "snappy" | `quint.out` |
| "bouncy" | `back.out(1.7)` |
| "gentle" | `power1.out` |
| "cinematic" | `power4.inOut` |
| "elastic" | `elastic.out(1, 0.4)` |
| "heavy" | `power4.out` |
| "instant" | GSAP `set` (no easing) |

## Caption / text style vocabulary

| Word | Result |
|------|--------|
| "hype" | Heavy font, scale-pop entrance, high contrast |
| "corporate" | Clean sans-serif, fade + slide up |
| "playful" | Rounded font, bounce entrance |
| "minimal" | Thin weight, fade only |
| "cinematic" | Large display font, slow reveal |
| "sketch-educational" | Nunito 800 headings, thick-border cards, straight diagonal underlines, warm white bg — see `rules/sketch-educational-style.md` |

## Transition vocabulary

| Phrase | Transition |
|--------|-----------|
| "calm blur crossfade" | Blur + opacity blend |
| "high zoom through" | `cinematic-zoom` block |
| "hard cut" | No transition, instant switch |
| "flash cut" | `flash-through-white` block |
| "glitch break" | `glitch` block |
| "wipe right" | `clip-path` reveal |
| "dissolve" | Crossfade or `domain-warp-dissolve` |

## Format vocabulary

| Phrase | Setting |
|--------|---------|
| "landscape / YouTube" | 1920×1080 |
| "portrait / reels / TikTok" | 1080×1920 |
| "square / Instagram" | 1080×1080 |
| "cinematic / 24fps" | `--fps 24` |
| "smooth / 60fps" | `--fps 60` |
| "draft / iterate" | `--quality draft` |
| "final / delivery" | `--quality high` |

---

## Anatomy of a good prompt

```
[Duration] [Subject/Purpose]
[Visual style: background, colors, typography tone]
[Scene breakdown: what appears when]
[Motion energy: calm / snappy / cinematic / hype]
[Format: landscape / portrait / square]
[Audio: voiceover text, music style, or "no audio"]
```

### Example — sketch-educational prompt

```
205-second educational explainer on prompt engineering.
Style: sketch-educational (white background, Nunito headings, bold colored cards, straight diagonal underlines).
Warm white background (#FDFCFB) with subtle graph-paper grid.
Four techniques shown in sequence: Zero-Shot → Role Prompting → Few-Shot → Chain of Thought.
Each technique: label appears, prompt card slides in, response appears faded, verdict underlined.
Comparison table at 125s: horizontal quality bars animate in row by row.
Formula section at 155s: four ingredient boxes cascade in (Context → Role → Task → Format).
Outro at 180s: bold tagline holds on screen.
Format: landscape (1920×1080), 30fps. Narration-driven — minimal on-screen text.
```

### Example — complete prompt

```
20-second product announcement video.
Dark background (#0a0a0a), electric blue accents (#4fc3f7), large clean sans-serif.

Scene 1 (0–5s): Fade in headline "The future is here" with smooth upward slide.
Scene 2 (5–15s): Three feature cards appear one-by-one with snappy scale entrances.
  Card 1 at 5s: "10x faster"
  Card 2 at 7s: "Zero config"
  Card 3 at 9s: "AI-native"
Scene 3 (15–20s): Logo appears with cinematic fade, tagline slides in below.

Transitions: blur crossfade between scenes.
Format: landscape (1920×1080), 30fps.
No audio needed.
```

---

## Anti-patterns (avoid these)

- Don't request React components — HyperFrames is HTML-only
- Don't ask for 4K or 60fps unless necessary — doubles render time
- Don't paste error logs without the composition HTML that caused them
- Don't assume the agent knows asset file paths — explicitly state `src="filename.mp4"`
- Don't skip `/hyperframes` at session start — the agent needs the skill context

---

## Iterating on a composition

```
"Make the title entrance more dramatic — bouncy instead of smooth"
"Slow down the transition between scene 1 and 2 to 1 second"
"Change the accent color to #ff5050"
"Add a subtle scale zoom to the background video"
"The subtitle should appear 0.5s after the title, not at the same time"
```

Each change is small and surgical — HyperFrames compositions are easy to edit because all timing is explicit in data attributes and GSAP position parameters.

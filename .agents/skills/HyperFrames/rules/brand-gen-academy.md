---
name: brand-gen-academy
description: The Gen Academy brand color system — palette, white-background adaptation rules, card classes, and anti-patterns for HyperFrames compositions
metadata:
  tags: brand, colors, gen-academy, palette, white-background, cards
---

## The Gen Academy brand

The Gen Academy's primary brand uses **Academy Yellow on Black**. When building HyperFrames compositions on a white background, the palette must be adapted so yellow is used for graphical/decorative elements only — never for body text on white.

---

## Core palette

| Name | Hex | Role in white-bg compositions |
|------|-----|-------------------------------|
| Academy Yellow | `#FEFB41` | Borders, underlines, highlights, bar fills, accents |
| Black | `#000000` | All headings, technique names, verdicts, primary text |
| Deep Navy | `#202E4A` | Secondary accent text, outro elements, arrows |
| Light Grey | `#D0D0D0` | Neutral/dashed card borders, dividers |
| Off White | `#F5F5F5` | Card backgrounds, inner fills |

---

## White-background adaptation rules

The brand normally uses yellow on a black canvas. Flip it for white-background video:

1. **Yellow never on body text** — unreadable on white. Use for borders, strokes, backgrounds only.
2. **Black for all headings and verdicts** — replaces yellow as the dominant ink color.
3. **Deep Navy as secondary accent** — used for sub-headings, outro lines, secondary labels.
4. **Yellow borders/underlines** — all SVG draw-on underlines and card borders use `#FEFB41`.
5. **Yellow highlight blocks** — `rgba(254,251,65,0.4)` as inline background highlight behind key words.
6. **Decorative yellow** — background numbers, stars, bar fills can use `#FEFB41` or `rgba(254,251,65,0.15)`.

---

## Card classes (white background)

```css
.card { position: absolute; background: #FFFFFF; border-radius: 8px; padding: 36px 44px; }

/* Input / prompt card — black border */
.card-black   { border: 3.5px solid #000000; box-shadow: 5px 5px 0 rgba(0,0,0,0.10); }

/* Good response / output card — yellow border */
.card-yellow  { border: 3.5px solid #FEFB41; box-shadow: 5px 5px 0 rgba(254,251,65,0.30); }

/* Base prompt / formula card — navy border */
.card-navy    { border: 3.5px solid #202E4A; box-shadow: 5px 5px 0 rgba(32,46,74,0.15); }

/* Neutral / dashed / weak card */
.card-neutral { border: 3.5px solid #D0D0D0; box-shadow: 5px 5px 0 rgba(0,0,0,0.06); }
```

**Usage guide:**
- `card-black` — user prompt / input side
- `card-yellow` — good/best response / output side
- `card-navy` — base prompt, formula sections, anchor cards
- `card-neutral` (optionally dashed border) — weak or baseline responses

---

## SVG arrows

```html
<!-- Use the yellow arrow for highlight arrows in technique scenes -->
<marker id="arrow-yellow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
  <path d="M0,0 L0,6 L8,3 z" fill="#FEFB41"/>
</marker>

<!-- Use dark arrow for neutral / explanatory arrows -->
<marker id="arrow-dark" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
  <path d="M0,0 L0,6 L8,3 z" fill="#1C1917"/>
</marker>
```

---

## Draw-on underlines

All technique name underlines use Academy Yellow:

```html
<svg viewBox="0 0 600 16" style="width:600px;height:16px;">
  <path id="uline" d="M4,12 L596,8"
        stroke="#FEFB41" stroke-width="3.5" fill="none"
        stroke-linecap="round"
        stroke-dasharray="600" stroke-dashoffset="600"/>
</svg>
```

Animate with GSAP:
```js
tl.to('#uline', { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, T);
```

---

## Comparison / quality bars

Technique bars in comparison sections:
- **Techniques 1–4** (basic): `background: #000000`
- **Techniques 5–8** (advanced): `background: #202E4A`
- Bar tracks: `background: #F5F5F4; border: 2px solid #E7E5E4`

---

## Outro / badge elements

Technique name badges in the outro:
```css
background: #FEFB41;
color: #000000;
font-weight: 800;
```

Accent lines and closing taglines: `color: #202E4A`

---

## Anti-patterns

| ❌ Don't | ✅ Do instead |
|---------|-------------|
| Yellow text on white background | Black text, yellow border/underline only |
| Technique-specific colors (red, blue, green, purple per technique) | Unified black + yellow palette across all techniques |
| Pure white `#FFFFFF` background | Warm off-white `#FDFCFB` with subtle graph-paper grid |
| White text on yellow badges | Black text on yellow badges |

---

## Narration pace

The Gen Academy videos are recorded at **160 wpm**.  
Use `words ÷ 160 × 60 = seconds` to set scene durations from script word counts.

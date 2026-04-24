---
name: sketch-educational-style
description: Design system for white-background sketch-inspired educational videos — fonts, underlines, cards, colors, anti-patterns
metadata:
  tags: design, style, sketch, educational, fonts, typography, cards, underlines, white
---

## What this style is

A clean white-background educational video style inspired by StatQuest — upright bold typography, thick colored borders, draw-on underlines, and bold marker-style colors. The "sketch" quality comes from border texture and draw-on effects, **not** from slanted text or wavy lines.

---

## Typography — the most important decision

### Use Nunito for all display/heading text

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

| Role | Font | Weight |
|------|------|--------|
| Display / headings / verdicts | **Nunito** | 800 |
| Body / descriptions / labels | **DM Sans** | 400–600 |
| Prompts / code / mono labels | **JetBrains Mono** | 400–600 |

### Never use Caveat or other calligraphy fonts for headings

**Caveat is forbidden for headings.** It has naturally slanted, calligraphic letterforms that make all text appear italic even when it isn't. Users consistently flag this as "too sketchy" and "too slanting."

```css
/* ✅ CORRECT */
.display {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  line-height: 1;
}

/* ❌ WRONG — calligraphic slant on every letter */
.display {
  font-family: 'Caveat', cursive;
}

/* ❌ ALSO WRONG — same problem */
.display {
  font-family: 'Kalam', cursive;
}
.display {
  font-family: 'Patrick Hand', cursive;
}
```

Nunito has:
- Completely upright letterforms (no calligraphic slant)
- Rounded terminals that give warmth without script feel
- Bold weights up to 900 for impactful headings
- Educational, friendly personality — the StatQuest sweet spot

---

## Underlines — draw-on SVG lines

### Use straight diagonal lines, not wavy paths

The underline should look like a pen stroke drawn quickly with a ruler — very slightly not-horizontal, but essentially straight. **Never use multiple Q (quadratic bezier) control points** — that creates a wavy, sea-wave effect.

```html
<!-- ✅ CORRECT — straight diagonal, hand-drawn feel -->
<svg viewBox="0 0 600 16" style="width:600px;height:16px;">
  <path id="my-uline"
        d="M4,12 L596,8"
        stroke="#7C3AED" stroke-width="3.5" fill="none"
        stroke-linecap="round"
        stroke-dasharray="600" stroke-dashoffset="600"/>
</svg>
```

The pattern: `M4,12 L[width-4],8`
- Start 4px from left, at y=12 (near bottom of viewbox)
- End 4px from right, at y=8 (slightly higher)
- The 4px rise over full width = natural hand-drawn diagonal, not wavy

```html
<!-- ❌ WRONG — multi-hump wave looks like a school notebook scribble -->
<path d="M0,10 Q88,4 175,10 Q262,16 350,10 Q438,4 525,10 Q612,16 700,10"/>

<!-- ❌ ALSO WRONG — single deep curve is too dramatic -->
<path d="M0,5 Q350,18 700,5"/>
```

### Animating the draw-on effect

Always set `stroke-dasharray` and `stroke-dashoffset` to the path length, then animate `strokeDashoffset` to 0:

```js
// Draw the underline in 0.8s starting at time T
tl.to('#my-uline', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, T);
```

**Dasharray value** = approximately the path length. For `M4,12 L[w-4],8`, the length is roughly `w - 8` (the 4px diagonal barely adds length). Use the viewBox width as a safe approximation.

---

## Cards — sketch border style

### Thick border + offset box-shadow

The "sketched marker stroke" look comes from two layers — a thick colored border and a slightly offset box-shadow of the same color at low opacity:

```css
.card {
  position: absolute;
  background: #FFFFFF;
  border-radius: 8px;    /* nearly square — hand-drawn boxes aren't very rounded */
  padding: 44px 52px;
}

/* Per-color variants */
.card-red    { border: 3.5px solid #DC2626; box-shadow: 5px 5px 0 rgba(220,38,38,0.22); }
.card-blue   { border: 3.5px solid #2563EB; box-shadow: 5px 5px 0 rgba(37,99,235,0.20); }
.card-green  { border: 3.5px solid #16A34A; box-shadow: 5px 5px 0 rgba(22,163,74,0.20); }
.card-amber  { border: 3.5px solid #D97706; box-shadow: 5px 5px 0 rgba(217,119,6,0.20); }
.card-purple { border: 3.5px solid #7C3AED; box-shadow: 5px 5px 0 rgba(124,58,237,0.20); }
.card-neutral{ border: 3.5px solid #44403C; box-shadow: 5px 5px 0 rgba(68,64,60,0.15); }
```

### Never rotate cards

`transform: rotate()` on a card makes all text inside look slanted, even if the font is upright. This is one of the most common complaints.

```html
<!-- ✅ CORRECT — no rotation -->
<div class="card card-blue" style="top:340px; left:160px; width:760px; filter:url(#sketch);">

<!-- ❌ WRONG — the whole card + text tilts, looks wrong -->
<div class="card card-blue" style="top:340px; left:160px; width:760px; transform:rotate(-0.4deg);">
```

### Never rotate cards in GSAP entrance animations

```js
// ✅ CORRECT — clean pop-up entrance
tl.fromTo('#card', { opacity:0, y:28 }, { opacity:1, y:0, duration:0.6, ease:'back.out(1.4)' }, T);

// ❌ WRONG — the card arrives tilted, text looks skewed
tl.fromTo('#card', { opacity:0, y:28, rotate:-2 }, { opacity:1, y:0, rotate:-0.5, duration:0.6 }, T);
```

### Optional: SVG sketch filter for subtle border wobble

A very mild `feTurbulence` filter adds a slight hand-drawn quality to borders without making text appear slanted. The **seed must be fixed** for deterministic rendering.

```html
<svg style="position:absolute;width:0;height:0;overflow:hidden;">
  <defs>
    <filter id="sketch" x="-5%" y="-5%" width="110%" height="110%">
      <!-- seed="3" is fixed → same noise every render (deterministic) -->
      <feTurbulence type="fractalNoise" baseFrequency="0.022"
                    numOctaves="3" seed="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise"
                         scale="2.8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>
```

Apply with `filter:url(#sketch)` on the card element. Keep `scale` at 2–3. Higher values make borders visibly jagged.

---

## Background

```css
#root {
  background-color: #FDFCFB;   /* warm white — not pure #FFF */
  /* Subtle graph-paper grid — educational feel */
  background-image:
    linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

---

## Color palette

| Role | Hex | Usage |
|------|-----|-------|
| Page background | `#FDFCFB` | Root canvas |
| Primary text | `#1C1917` | All body copy |
| Muted text | `#78716C` | Descriptions, subtitles |
| Faint label | `#A8A29E` | Card labels, timestamps |
| Red (weak/baseline) | `#DC2626` | Technique 01 / error states |
| Blue (targeted) | `#2563EB` | Technique 02 / role/persona |
| Green (pattern) | `#16A34A` | Technique 03 / examples |
| Amber (structured) | `#D97706` | Technique 04 / steps/logic |
| Purple (formula/accent) | `#7C3AED` | Scene titles, formula, CTA |

---

## Highlight spans (marker brush behind key words)

A semi-transparent background behind an inline span, giving a marker-highlight effect:

```html
<style>
  .hl { position: relative; display: inline; }
  .hl::before {
    content: '';
    position: absolute;
    inset: 0px -6px;
    border-radius: 3px;
    /* No rotate — flat highlight, not tilted */
    z-index: -1;
  }
  .hl-purple::before { background: rgba(124,58,237,0.12); }
  .hl-red::before    { background: rgba(220,38,38,0.14); }
  .hl-blue::before   { background: rgba(37,99,235,0.12); }
  .hl-green::before  { background: rgba(22,163,74,0.12); }
  .hl-amber::before  { background: rgba(217,119,6,0.14); }
</style>

<!-- Usage -->
<span class="hl hl-purple" style="color:#7C3AED;">Communication</span>
```

---

## Quality bar comparison (StatQuest-inspired)

Instead of four equal-sized cards in a grid, use a table of horizontal bars that animate in row by row. This is cleaner, more educational, and maps directly to how StatQuest presents comparisons.

```html
<!-- Row structure -->
<div style="display:flex; align-items:center; gap:0;">
  <!-- Technique name -->
  <div style="width:320px;">
    <span style="font-family:'Nunito',sans-serif; font-size:36px; font-weight:800; color:#DC2626;">
      Zero-Shot
    </span>
  </div>
  <!-- Quality bar track -->
  <div style="flex:1; height:36px; background:#F5F5F4; border-radius:4px;
              overflow:hidden; border:2px solid #E7E5E4; margin-right:40px;">
    <div id="bar1" style="height:100%; width:0%; background:#DC2626; border-radius:2px;"></div>
  </div>
  <!-- Key benefit -->
  <div style="width:360px; font-size:19px; color:#78716C;">
    Quick start — no prep needed
  </div>
</div>
```

```js
// Animate bar filling in
tl.fromTo('#row1', { opacity:0, x:-20 }, { opacity:1, x:0, duration:0.5 }, T);
tl.to('#bar1', { width:'32%', duration:0.8, ease:'power2.out' }, T + 0.5);
```

Suggested bar widths for the four technique levels:
- Zero-Shot: 32%
- Role Prompting: 62%
- Few-Shot: 74%
- Chain of Thought: 96%

---

## Summary: what to do vs. what NOT to do

| | ✅ Do | ❌ Don't |
|--|-------|---------|
| Heading font | Nunito 800 | Caveat, Kalam, Patrick Hand |
| Underlines | `M4,12 L[w-4],8` (straight diagonal) | Multi-Q wavy paths |
| Cards | Flat, no rotation | `transform:rotate(±0.x deg)` |
| GSAP card entrance | `fromTo({y:28}, {y:0})` | Include `rotate` in from/to |
| Sketch feel source | Border thickness + box-shadow offset | Rotating text or elements |
| Highlight blocks | Flat `::before` pseudo | Rotating highlight backgrounds |

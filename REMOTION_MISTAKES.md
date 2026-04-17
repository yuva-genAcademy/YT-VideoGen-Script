# Remotion: Common Mistakes to Avoid

A living reference of real mistakes made in this project. Check this file before starting any new Remotion composition.

---

## 1. SVG diagram elements overlapping the title heading

**What happened:** SVG nodes were positioned at `y=75` and `y=170` while the scene title `div` sat at `top: 28` (~80px tall). The nodes rendered behind the text, cluttering the heading area.

**Root cause:** The SVG uses the full `1280×720` viewBox with `position: absolute`. A floating title `div` is layered over it, but if SVG elements occupy the same y-range, they visually bleed through or create a messy composition.

**Rule:** Before placing any node, label, or element in the SVG, define the **safe zones** for the specific scene layout:
- **Top reserved:** title + subtitle typically occupy `y = 0` → `y ≈ 100`. SVG content must start at `y ≥ 108`.
- **Bottom reserved:** description/footer panels at `bottom: 28` with ~90px height occupy `y ≈ 620` → `y = 720`. SVG content must end at `y ≤ 615`.
- **Available diagram space:** `y = 108` to `y = 615` (507px of vertical room in a 720px canvas).

**How to check:** After placing nodes, verify:
```
top_node.y - top_node.r  >= 108
bottom_node.y + bottom_node.r <= 615
```

---

## 2. Blank flash between scene transitions when using `<Series>`

**What happened:** Using `<Series>` caused a ~10-frame black screen between every scene. Scene A finished fading out (opacity → 0) and Scene B only started mounting and fading in after Scene A's `durationInFrames` elapsed — leaving a window where both were fully transparent.

**Root cause:** `<Series>` is purely sequential. It does not overlap adjacent sequences. If Scene A fades out over its last 12 frames and Scene B fades in over its first 10 frames, there is a ~2-frame gap where neither has any opacity. Even a 1-frame gap at 30fps is a visible flash.

**Fix:** Replace `<Series>` with explicit `<Sequence from={...}>` components, each starting `OVERLAP` frames before the previous one ends. Both scenes are mounted simultaneously during the crossfade window — one fading out while the other fades in.

```tsx
const OVERLAP = 15; // frames of crossfade

<AbsoluteFill>
  <Sequence from={0}            durationInFrames={90}  premountFor={OVERLAP}><SceneA /></Sequence>
  <Sequence from={90 - OVERLAP} durationInFrames={210} premountFor={OVERLAP}><SceneB /></Sequence>
  <Sequence from={285 - OVERLAP} durationInFrames={210} premountFor={OVERLAP}><SceneC /></Sequence>
</AbsoluteFill>
```

**Rule:** Every scene must have a **matching fade-in and fade-out** of exactly `OVERLAP` frames:
```tsx
const fadeIn  = interpolate(frame, [0, OVERLAP], [0, 1], { extrapolateRight: 'clamp' });
const fadeOut = interpolate(frame, [duration - OVERLAP, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const opacity = Math.min(fadeIn, fadeOut);
```
If these timings do not match the overlap offset in the parent, the crossfade will be asymmetric or still show a flash.

---

## 3. CSS transitions and animations are forbidden

`transition-*`, `animate-*` (Tailwind or inline CSS) do NOT work in Remotion — they run in real time, not frame time. The renderer captures one frame at a time; CSS animations may be at frame 0 in every captured frame.

**All motion must go through:**
- `useCurrentFrame()` + `interpolate()`
- `spring()` from `remotion`

---

## 4. Always `premountFor` on every `<Sequence>`

Without `premountFor`, a component only mounts at its `from` frame. If it has expensive setup (e.g. measuring DOM nodes, loading fonts), the first frames may render incorrectly.

```tsx
// Always add premountFor equal to at least the fade-in duration
<Sequence from={75} durationInFrames={210} premountFor={15}>
  <MyScene />
</Sequence>
```

---

## 5. SVG arrowhead markers must use unique IDs per SVG

If two SVGs in the same document define `<marker id="arrow">`, the second definition silently wins. Always namespace marker IDs per scene:

```tsx
// In SingleAgentScene:
<marker id="sa-arrow" ...>

// In MultiAgentScene:
<marker id="ma-arrow" ...>
```

---

## 6. Total `durationInFrames` in `Root.tsx` must stay in sync

When you change scene durations or crossfade overlap, the composition `durationInFrames` in `Root.tsx` must be recalculated. Best practice is to export the constant from the composition file and import it in Root:

```tsx
// AgentArchitecture.tsx
export const TOTAL_DURATION = 615;

// Root.tsx
import { AgentArchitecture, TOTAL_DURATION } from './AgentArchitecture/AgentArchitecture';
<Composition durationInFrames={TOTAL_DURATION} ... />
```

Never hardcode a magic number for total duration in Root — it will silently drift.

---

## 7. Verify `y` positions when description panels use `position: absolute; bottom: N`

A panel with `bottom: 28` and height `~90px` occupies `y = 720 - 28 - 90 = 602` upward. SVG circles or labels whose `y + r > 602` will visually overlap the panel even though both are technically "in the DOM" correctly.

---

## 8. "Safe zone" calculations must account for real font metrics, not just CSS geometry

**What happened:** The title `div` at `top: 28` with `fontSize: 38` (Georgia bold) was computed to end at `y ≈ 80`. The input rect was placed at `y = 90` — only 10px gap — and it visually appeared to bleed into the title.

**Root cause:** The CSS box model reports the font's line box height (≈ `fontSize × lineHeight`). But the **visual rendering** of Georgia 38px bold plus the underline `div` (with `margin-top: 8px, height: 3px`) fills to:

```
28 (top offset)
+ 46 (38px × 1.2 lineHeight)
+ 8  (underline margin)
+ 3  (underline height)
= 85px
```

A 5px gap from 85 to 90 is invisible at normal viewing distance — the next element looks like it's touching the title.

**Rule:** Always maintain at least **15px of breathing room** between the computed bottom of any CSS `div` and the topmost SVG element below it. Use a script or `console.log` to verify gaps before finalising positions.

```
minimum: top_svg_element.y >= title_div_bottom + 15
```

In this project that means SVG content starts at `y ≥ 100`.

---

## 9. Arrow/line endpoints must align with element edges, not element centers

**What happened:** The input arrow in `MultiAgentScene` had `y1=118`, but the rect it was supposed to emerge from had `y = 90, height = 38` (bottom edge at `y = 128`). The arrow started **inside** the rect, making the line appear to be cut short or invisible.

**Root cause:** The arrow `y1` was set to an approximation rather than being derived from the actual rect geometry. When the rect was later adjusted, `y1` was not updated to match.

**Fix:** Always compute arrow endpoints **from the element constants**, not freehand numbers:

```tsx
const INPUT_RECT   = { x: 560, y: 102, w: 160, h: 26 };
const ARROW_START_Y = INPUT_RECT.y + INPUT_RECT.h; // 128 — always the bottom edge

<AnimLine x1={640} y1={ARROW_START_Y} x2={ORC.x} y2={ORC.y - ORC.r} ... />
```

This pattern is immune to future rect repositioning because the arrow start is derived, not hardcoded.

---

## 10. Check all inter-element vertical gaps, not just top and bottom safe zones

**What happened:** After fixing the title and description panel overlaps, a secondary overlap appeared between the parallel-execution badge and the worker node glow circles. Badge bottom was at `y = 388`, worker glow top was at `y = 390` — a 2px gap that looks like a collision.

**Rule:** After placing every element, audit **every adjacent pair** vertically, not just the outermost edges:

| Pair | Minimum gap |
|---|---|
| Title bottom → first SVG element | ≥ 15 px |
| Node bottom → badge top | ≥ 10 px |
| Badge bottom → next node top | ≥ 15 px |
| Last node bottom → tool pills top | ≥ 10 px |
| Tool pills bottom → description panel top | ≥ 10 px |

Run a quick audit script (Node.js) with all your constants before committing:</p>

```js
const gaps = [
  ['title→pill',    pillTop - titleBottom],
  ['ORC→badge',     badgeTop - orcBottom],
  ['badge→workers', workerTop - badgeBottom],
  ['workers→pills', pillTop - workerBottom],
  ['pills→desc',    descTop - pillMaxBottom],
];
gaps.forEach(([name, g]) => console.log(name, g, g >= 10 ? '✓' : '❌ TOO SMALL'));
```

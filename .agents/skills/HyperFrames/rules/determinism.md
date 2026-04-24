---
name: determinism
description: Determinism rules — what is and isn't allowed in HyperFrames scripts
metadata:
  tags: determinism, random, reproducibility, rendering, rules
---

## Why determinism matters

HyperFrames renders by seeking the GSAP timeline to exact frame positions — it doesn't play through in real time. Every frame must produce **identical output** no matter when or where it's rendered. This makes videos:

- Reproducible for debugging and regression testing
- Safe for CI/CD pipelines
- Identical across machines and OS versions (especially with `--docker`)

## Forbidden in scripts

### `Math.random()`

```js
// ❌ WRONG — produces different results every render
const x = Math.random() * 1920;
tl.from(".particle", { x, opacity: 0, duration: 0.5 }, 0);
```

```js
// ✅ OK — seeded pseudo-random values
function seededRand(seed) {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
const x = seededRand(42) * 1920;
tl.from(".particle", { x, opacity: 0, duration: 0.5 }, 0);
```

### `Date.now()` / `new Date()`

```js
// ❌ WRONG — depends on wall-clock time
const timestamp = new Date().toLocaleString();
```

```js
// ✅ OK — pass the date as a static value baked into the HTML
const timestamp = "2025-01-15 09:30:00";
```

### Network fetches at render time

```js
// ❌ WRONG — async at render time
fetch("/api/data").then(r => r.json()).then(data => {
  tl.from(".chart", { ... });
});
```

All data must be **inlined in the HTML** before rendering. Fetch data at build time, inject into HTML.

### Media playback control

```js
// ❌ WRONG — framework controls playback
document.getElementById("video").play();
document.getElementById("video").currentTime = 2;
```

Use data attributes (`data-start`, `data-media-start`) to control media timing.

### `setTimeout` / `setInterval`

```js
// ❌ WRONG — wall-clock dependent
setTimeout(() => {
  tl.from(".element", { opacity: 0 });
}, 1000);
```

All timeline setup must be synchronous.

### `requestAnimationFrame`

```js
// ❌ WRONG — tied to display refresh
requestAnimationFrame(() => {
  tl.from(".element", { opacity: 0 });
});
```

### Reading DOM layout in script body

```js
// ❌ WRONG — layout hasn't stabilized at parse time
const width = document.getElementById("box").offsetWidth;
```

Use hardcoded values or CSS `var()` for layout-dependent calculations.

## Safe patterns

```js
// ✅ Seeded random positions
const positions = [42, 17, 83, 61, 29].map(seed => {
  const x = Math.sin(seed) * 10000;
  return (x - Math.floor(x)) * 1920;
});

// ✅ Static timestamp
const releaseDate = "April 2025";

// ✅ Pre-computed data arrays
const chartData = [45, 72, 38, 91, 55]; // fetched at build time, inlined

// ✅ CSS custom properties for layout (resolved by browser, stable at seek)
const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--accent").trim();
```

## Docker rendering for guaranteed determinism

For the highest level of reproducibility (e.g., regression testing, CI):

```bash
npx hyperframes render --docker
```

This uses a pinned Chrome version and controlled environment, eliminating any host-system variation in font rendering, GPU behavior, or Chrome version differences.

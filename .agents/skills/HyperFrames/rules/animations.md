---
name: animations
description: GSAP animation patterns for HyperFrames — timeline registration, easing, common effects
metadata:
  tags: gsap, animation, timeline, easing, keyframes
---

## The golden rule

HyperFrames renders by **seeking** the GSAP timeline frame-by-frame. The GSAP timeline must be:
- Created with `{ paused: true }`
- Registered on `window.__timelines["composition-id"]`
- Built synchronously (no async/await in script body)

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script>
  const tl = gsap.timeline({ paused: true });

  // all animations go here

  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;  // must match data-composition-id
</script>
```

## GSAP timing syntax

All `gsap.to/from/fromTo/set` calls take a **position parameter** (3rd or last argument) — the absolute time in seconds on the timeline.

```js
tl.from(".title", { opacity: 0, y: -60, duration: 0.6 }, 0);      // starts at 0s
tl.from(".subtitle", { opacity: 0, duration: 0.4 }, 0.8);          // starts at 0.8s
tl.to(".logo", { scale: 1.1, duration: 0.3 }, 2);                  // starts at 2s
tl.to(".bg", { opacity: 0, duration: 0.5 }, "+=0");                // relative: after last
```

## Common animation patterns

### Fade in

```js
tl.from("#element", { opacity: 0, duration: 0.5 }, 0);
```

### Slide up + fade in

```js
tl.from("#title", { opacity: 0, y: 60, duration: 0.6, ease: "power2.out" }, 0);
```

### Scale pop entrance

```js
tl.from("#badge", { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(1.7)" }, 1);
```

### Staggered list items

```js
tl.from(".item", { opacity: 0, x: -40, duration: 0.4, stagger: 0.15, ease: "power2.out" }, 0.5);
```

### Fade out (exit)

```js
tl.to("#element", { opacity: 0, duration: 0.4 }, 4.6);  // disappears at 4.6s
```

### Cinematic slow zoom

```js
tl.to("#bg-video-wrapper", { scale: 1.05, duration: 8, ease: "none" }, 0);
```

### Text reveal (clip-path)

```js
tl.from("#headline", {
  clipPath: "inset(0 100% 0 0)",
  duration: 0.8,
  ease: "power3.out"
}, 0);
```

### Color change

```js
tl.to("#accent", { backgroundColor: "#ff5050", duration: 0.3 }, 2);
```

## Easing vocabulary

| Feel | GSAP ease |
|------|-----------|
| Smooth, no bounce | `"power2.out"` |
| Snappy, sharp stop | `"quint.out"` |
| Bouncy entrance | `"back.out(1.7)"` |
| Heavy, slow | `"power4.out"` |
| Elastic pop | `"elastic.out(1, 0.4)"` |
| Linear (constant) | `"none"` |
| Natural in-out | `"power2.inOut"` |

Vocabulary → easing mapping (use when user describes motion in words):
- "smooth" → `power2.out`
- "snappy" → `quint.out`
- "bouncy" → `back.out`
- "gentle" → `power1.out`
- "cinematic" → `power4.inOut`
- "elastic" → `elastic.out`

## Extending timeline to match video length

If your animations end before the video duration, GSAP's `timeline.duration()` will be shorter than the video. Fix this:

```js
const VIDEO_LENGTH = 10; // seconds
tl.set({}, {}, VIDEO_LENGTH); // extends timeline to 10s without adding visual change
```

This is important — if the timeline is shorter than the video, the render will truncate.

## Plugins

GSAP plugins that work in HyperFrames (include via CDN):

```html
<!-- ScrollTrigger is NOT used (no scrolling). Use these instead: -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/TextPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/MotionPathPlugin.min.js"></script>
```

Register plugins before creating the timeline:

```js
gsap.registerPlugin(TextPlugin);
```

## What CANNOT be done in scripts

- `Math.random()` — breaks determinism. Use a seeded PRNG if you need pseudo-random values.
- `video.play()` / `video.pause()` / `video.currentTime = x` — framework controls media
- `fetch()` / `XMLHttpRequest` — no runtime network calls
- `setTimeout` / `setInterval` — not render-safe
- `document.getElementById("x").offsetWidth` in script body — layout not ready at script parse time

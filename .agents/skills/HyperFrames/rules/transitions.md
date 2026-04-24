---
name: transitions
description: Scene transitions — GSAP crossfades and the shader-transitions catalog
metadata:
  tags: transitions, crossfade, shader, gsap, dissolve, wipe
---

## GSAP crossfade (no package required)

The simplest transition: fade out scene A while scene B fades in. Use different track indices for the overlap window.

```html
<!-- Scene A ends at 5s, Scene B starts at 4.5s (0.5s overlap) -->
<video id="sceneA" class="clip" src="a.mp4"
       data-start="0" data-duration="5" data-track-index="0" muted
       style="position:absolute; width:100%; height:100%; object-fit:cover;">
</video>

<video id="sceneB" class="clip" src="b.mp4"
       data-start="4.5" data-track-index="1" muted
       style="position:absolute; width:100%; height:100%; object-fit:cover;">
</video>
```

```js
// Fade out scene A over 0.5s starting at 4.5s
tl.to("#sceneA", { opacity: 0, duration: 0.5 }, 4.5);
// Fade in scene B over 0.5s starting at 4.5s
tl.from("#sceneB", { opacity: 0, duration: 0.5 }, 4.5);
```

## GSAP-only transition patterns

### Wipe right (clip-path)

```js
tl.from("#sceneB", {
  clipPath: "inset(0 100% 0 0)",
  duration: 0.6,
  ease: "power2.inOut"
}, 4.5);
```

### Scale through white

```js
// Flash white, then reveal new scene
tl.to("#flash", { opacity: 1, duration: 0.1 }, 4.5);
tl.to("#flash", { opacity: 0, duration: 0.3 }, 4.6);
tl.from("#sceneB", { scale: 1.1, opacity: 0, duration: 0.4 }, 4.6);
```

### Blur crossfade

```js
tl.to("#sceneA", { filter: "blur(20px)", opacity: 0, duration: 0.5 }, 4.5);
tl.from("#sceneB", { filter: "blur(20px)", opacity: 0, duration: 0.5 }, 4.5);
```

### Push left

```js
tl.to("#sceneA", { x: "-100%", duration: 0.5, ease: "power2.inOut" }, 4.5);
tl.from("#sceneB", { x: "100%", duration: 0.5, ease: "power2.inOut" }, 4.5);
```

## @hyperframes/shader-transitions (GPU effects)

Install the catalog block for GPU-accelerated shader transitions:

```bash
npx hyperframes add shader-transitions
```

Available shader effects (19 transitions):

| ID | Description |
|----|-------------|
| `blur` | Gaussian blur blend |
| `cover` | Directional coverage |
| `destruction` | Shatters into pieces |
| `dissolve` | Pixel dissolve |
| `distortion` | Wave distortion blend |
| `grid` | Grid wipe |
| `light` | Light streak transition |
| `mechanical` | Gear/mechanical wipe |
| `push-down` | Slide down push |
| `push-left` | Slide left push |
| `push-right` | Slide right push |
| `push-up` | Slide up push |
| `radial` | Iris/radial wipe |
| `scale-down` | Scale shrink blend |
| `scale-up` | Scale grow blend |
| `3d-flip` | 3D page flip |
| `3d-cube` | 3D cube rotate |
| `3d-door` | 3D door open |
| `3d-book` | 3D book page turn |

## VFX catalog (12 visual effects)

Install with `npx hyperframes add <name>`:

| Block | Effect |
|-------|--------|
| `chromatic-radial-split` | RGB aberration burst |
| `cinematic-zoom` | Lens zoom punch |
| `cross-warp-morph` | Warp morph between frames |
| `domain-warp-dissolve` | Organic dissolve |
| `flash-through-white` | Flash white frame |
| `glitch` | Digital glitch break |
| `gravitational-lens` | Lens distortion |
| `light-leak` | Warm light overlay |
| `ripple-waves` | Water ripple warp |
| `sdf-iris` | SDF iris wipe |
| `swirl-vortex` | Spiral vortex |
| `thermal-distortion` | Heat haze shimmer |

## Transition selection by tone

| Scene mood | Recommended transition |
|-----------|----------------------|
| Calm / documentary | Crossfade, blur crossfade |
| Energetic / hype | Flash through white, glitch, cinematic-zoom |
| Corporate / clean | Wipe right, push, radial |
| Cinematic / premium | Domain warp dissolve, light leak |
| Playful / social | Scale pop, swirl vortex |

## Multi-scene template

```html
<!-- Scene 1: 0–5s -->
<div id="s1" class="clip" data-start="0" data-duration="5.5" data-track-index="0"
     style="position:absolute; width:100%; height:100%; background:#111;">
  <h1 id="s1-title" style="color:#fff; font-size:80px; position:absolute; top:40%; left:50%; transform:translate(-50%,-50%);">Scene One</h1>
</div>

<!-- Scene 2: starts at 4.5s (0.5s crossfade overlap) -->
<div id="s2" class="clip" data-start="4.5" data-duration="5.5" data-track-index="1"
     style="position:absolute; width:100%; height:100%; background:#1a1a4a;">
  <h1 id="s2-title" style="color:#4fc3f7; font-size:80px; position:absolute; top:40%; left:50%; transform:translate(-50%,-50%);">Scene Two</h1>
</div>
```

```js
const tl = gsap.timeline({ paused: true });

// Scene 1 animations
tl.from("#s1-title", { opacity: 0, y: 40, duration: 0.5 }, 0);
tl.to("#s1", { opacity: 0, duration: 0.5 }, 4.5);  // fade out

// Scene 2 animations
tl.from("#s2", { opacity: 0, duration: 0.5 }, 4.5); // fade in
tl.from("#s2-title", { opacity: 0, y: 40, duration: 0.5 }, 5);

tl.set({}, {}, 10); // total 10s

window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
```

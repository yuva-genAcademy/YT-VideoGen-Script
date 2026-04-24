---
name: common-mistakes
description: Top HyperFrames pitfalls and how to fix them
metadata:
  tags: mistakes, pitfalls, debugging, errors, common
---

## 1. Animating video element dimensions directly

**Wrong:**
```js
tl.to("#my-video", { width: 1920, height: 1080, duration: 1 }, 0);
```

**Right — wrap the video, animate the wrapper:**
```html
<div id="video-wrapper" style="position:absolute; width:100%; height:100%; overflow:hidden;">
  <video id="my-video" class="clip" src="bg.mp4" data-start="0" data-track-index="0" muted
         style="width:100%; height:100%; object-fit:cover;">
  </video>
</div>
```
```js
tl.to("#video-wrapper", { scale: 1.05, duration: 8 }, 0);
```

---

## 2. Controlling media playback in scripts

**Wrong:**
```js
document.getElementById("my-video").play();
document.getElementById("my-video").currentTime = 2;
```

**Right — use data attributes:**
```html
<video id="my-video" class="clip" src="video.mp4"
       data-start="0"
       data-media-start="2"
       data-duration="8"
       data-track-index="0"
       muted>
</video>
```

---

## 3. GSAP timeline duration shorter than video

If your animations end at 3s but the video has 30 seconds of clips, the timeline is only 3s. The render will truncate.

**Fix — extend the timeline:**
```js
const VIDEO_LENGTH = 30; // total video duration in seconds
tl.set({}, {}, VIDEO_LENGTH); // no visual change, just extends duration
```

---

## 4. Missing `class="clip"` on timed elements

**Wrong:**
```html
<video id="bg" src="bg.mp4" data-start="0" data-duration="10" data-track-index="0" muted>
```

**Right:**
```html
<video id="bg" class="clip" src="bg.mp4" data-start="0" data-duration="10" data-track-index="0" muted>
```

Without `class="clip"`, visibility management won't work and the element will be visible at all times.

---

## 5. Timeline key mismatch

**Wrong:**
```html
<div data-composition-id="main-video">
```
```js
window.__timelines["main"] = tl; // ❌ key doesn't match
```

**Right:**
```html
<div data-composition-id="main-video">
```
```js
window.__timelines["main-video"] = tl; // ✅ exact match
```

---

## 6. Oversized images

Decoded bitmaps are loaded fully into memory. A 10MB JPEG decodes to ~100MB+ of raw RGBA.

**Rule:** Keep images ≤ 2× canvas dimensions.

| Canvas | Max image size |
|--------|---------------|
| 1920×1080 | 3840×2160 |
| 1080×1920 | 2160×3840 |

**Fix:**
```bash
mogrify -path resized -resize 3840x3840\> *.jpg
```

---

## 7. Stacked `backdrop-filter: blur`

Multiple blur layers compound rendering cost dramatically.

**Rule:** Limit to 2–3 `backdrop-filter: blur()` layers per frame.

**Alternative:** Pre-render the blur as a PNG overlay instead of using live CSS blur.

---

## 8. Forgetting `muted` on video elements

**Wrong:**
```html
<video id="bg" class="clip" src="bg.mp4" data-start="0" data-track-index="0">
```

**Right:**
```html
<video id="bg" class="clip" src="bg.mp4" data-start="0" data-track-index="0"
       data-has-audio="true" muted>
```

Always add `muted`. Use `data-has-audio="true"` to re-enable audio through the framework.

---

## 9. Track overlap on same track index

**Wrong:**
```html
<!-- Both on track 0, but they overlap in time (5s → 9s is in both) -->
<video id="a" class="clip" src="a.mp4" data-start="0" data-duration="7" data-track-index="0" muted>
<video id="b" class="clip" src="b.mp4" data-start="5" data-track-index="0" muted>
```

**Right — use different track indices for overlap windows:**
```html
<video id="a" class="clip" src="a.mp4" data-start="0" data-duration="7" data-track-index="0" muted>
<video id="b" class="clip" src="b.mp4" data-start="5" data-track-index="1" muted>
```

---

## 10. Async GSAP setup

**Wrong:**
```js
fetch("/data.json").then(data => {
  const tl = gsap.timeline({ paused: true });
  tl.from(".bar", { height: 0, duration: 1 }, 0);
  window.__timelines["main"] = tl;
});
```

**Right — inline data in HTML, setup synchronously:**
```html
<!-- Data baked in at build time -->
<script>
  const chartData = [45, 72, 38, 91]; // pre-fetched, inlined
  const tl = gsap.timeline({ paused: true });
  tl.from(".bar", { height: 0, duration: 1, stagger: 0.2 }, 0);
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
</script>
```

---

## Diagnostic workflow

```bash
npx hyperframes lint       # catch structural issues
npx hyperframes doctor     # verify environment (Chrome, FFmpeg, Docker)
npx hyperframes snapshot   # visual check before full render
npx hyperframes render --quality draft  # fast render for review
```

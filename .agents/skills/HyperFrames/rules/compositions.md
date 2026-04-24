---
name: compositions
description: HTML composition structure — root element, clip types, data-* attributes, canvas dimensions
metadata:
  tags: composition, html, data-attributes, canvas, clips
---

## Root element

Every composition is an HTML file. The root element **must** have `data-composition-id`:

```html
<div id="root"
     data-composition-id="main"
     data-width="1920"
     data-height="1080">
  <!-- clips go here -->
</div>
```

`data-width` and `data-height` define the canvas. Standard dimensions:

```
Landscape: 1920 × 1080
Portrait:  1080 × 1920
Square:    1080 × 1080
```

## Clip types

Every timed element needs `class="clip"`. The type is determined by the HTML tag.

### Video clip

```html
<video id="intro"
       class="clip"
       src="video.mp4"
       data-start="0"
       data-duration="5"
       data-track-index="0"
       data-has-audio="true"
       muted
       style="position:absolute; width:100%; height:100%; object-fit:cover;">
</video>
```

Always add `muted` — the framework handles audio separately via `data-has-audio`.

### Image clip

```html
<img id="logo"
     class="clip"
     src="logo.png"
     data-start="2"
     data-duration="3"
     data-track-index="1"
     style="position:absolute; width:400px; top:100px; left:100px;">
```

Images require `data-duration` because they have no intrinsic length.

### Audio clip

```html
<audio id="bgm"
       class="clip"
       src="music.mp3"
       data-start="0"
       data-track-index="2">
</audio>
```

Audio duration is read from the file. Override with `data-duration` to trim.

### Nested composition

```html
<div id="scene2"
     class="clip"
     data-composition-id="scene-2"
     data-composition-src="scene2.html"
     data-start="7"
     data-duration="10"
     data-track-index="0">
</div>
```

## Track index rule

Clips on the **same track cannot overlap in time**. Use different `data-track-index` values for overlapping content.

```
Track 0: background video (0s → 10s)
Track 1: logo overlay (2s → 5s)  ← overlaps track 0, different track OK
Track 2: audio (0s → 10s)
```

## Full minimal template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Composition</title>
  <style>
    body { margin: 0; padding: 0; background: #000; }
    #root {
      position: relative;
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #000;
    }
    video, img { display: block; }
  </style>
</head>
<body>
  <div id="root"
       data-composition-id="main"
       data-width="1920"
       data-height="1080">

    <video id="clip1"
           class="clip"
           src="video.mp4"
           data-start="0"
           data-duration="10"
           data-track-index="0"
           muted
           style="position:absolute; width:100%; height:100%; object-fit:cover;">
    </video>

    <audio id="music"
           class="clip"
           src="bg.mp3"
           data-start="0"
           data-track-index="2">
    </audio>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });

    tl.from("#clip1", { opacity: 0, duration: 0.5 }, 0);

    window.__timelines = window.__timelines || {};
    window.__timelines["main"] = tl;
  </script>
</body>
</html>
```

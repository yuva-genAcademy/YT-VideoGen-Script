---
name: media
description: Video, image, audio — embedding, trimming, volume, layering
metadata:
  tags: video, image, audio, media, muted, volume, object-fit
---

## Video

Always add `muted` to `<video>` elements. The framework controls audio separately via `data-has-audio`.

```html
<!-- Full-screen background video -->
<video id="bg"
       class="clip"
       src="background.mp4"
       data-start="0"
       data-duration="10"
       data-track-index="0"
       data-has-audio="true"
       muted
       style="position:absolute; width:100%; height:100%; object-fit:cover;">
</video>

<!-- Cropped/positioned video -->
<video id="sidebar"
       class="clip"
       src="interview.mp4"
       data-start="2"
       data-duration="8"
       data-track-index="1"
       muted
       style="position:absolute; right:0; top:0; width:50%; height:100%; object-fit:cover;">
</video>
```

### Trimming a video

Skip the first 3 seconds of source footage:

```html
<video id="trimmed"
       class="clip"
       src="long-clip.mp4"
       data-start="0"
       data-media-start="3"
       data-duration="5"
       data-track-index="0"
       muted
       style="position:absolute; width:100%; height:100%; object-fit:cover;">
</video>
```

### Video with separate audio channel

```html
<!-- Silent video track -->
<video id="broll" class="clip" src="broll.mp4"
       data-start="0" data-duration="5" data-track-index="0"
       muted style="position:absolute; width:100%; height:100%; object-fit:cover;">
</video>

<!-- Audio from same source file -->
<audio id="broll-audio" class="clip" src="broll.mp4"
       data-start="0" data-track-index="2"
       data-volume="0.8">
</audio>
```

## Image

Images need explicit `data-duration` (no intrinsic length):

```html
<!-- Full-screen image -->
<img id="slide"
     class="clip"
     src="slide.jpg"
     data-start="0"
     data-duration="5"
     data-track-index="0"
     style="position:absolute; width:100%; height:100%; object-fit:cover;">

<!-- Positioned logo -->
<img id="logo"
     class="clip"
     src="logo.png"
     data-start="0"
     data-duration="10"
     data-track-index="1"
     style="position:absolute; top:40px; left:40px; width:200px;">
```

### Image size limit

Keep images at **≤ 2× canvas dimensions** to avoid memory issues.

| Canvas | Max image size |
|--------|---------------|
| 1920 × 1080 | 3840 × 2160 |
| 1080 × 1920 | 2160 × 3840 |

Resize with: `mogrify -path resized -resize 3840x3840\> *.jpg`

## Audio

```html
<!-- Background music at 40% volume -->
<audio id="bgm"
       class="clip"
       src="music.mp3"
       data-start="0"
       data-volume="0.4"
       data-track-index="2">
</audio>

<!-- Voiceover at full volume -->
<audio id="vo"
       class="clip"
       src="narration.mp3"
       data-start="0"
       data-volume="1"
       data-track-index="3">
</audio>
```

Audio duration is read from the file. Use `data-duration` to cut it short.

## DOM wrappers for animated videos

Never animate video width/height directly — GSAP won't produce correct results. Always wrap and animate the wrapper:

```html
<!-- Wrapper for animation -->
<div id="video-wrapper"
     style="position:absolute; width:100%; height:100%; overflow:hidden;">
  <video id="bg" class="clip" src="bg.mp4"
         data-start="0" data-duration="10" data-track-index="0"
         muted
         style="width:100%; height:100%; object-fit:cover;">
  </video>
</div>
```

```js
// Animate the wrapper, not the video
tl.to("#video-wrapper", { scale: 1.05, duration: 8, ease: "none" }, 0);
```

## Positioning patterns

```css
/* Full bleed */
position: absolute; width: 100%; height: 100%; object-fit: cover;

/* Centered at fixed size */
position: absolute; width: 600px; height: 400px;
top: 50%; left: 50%; transform: translate(-50%, -50%);

/* Bottom-right corner */
position: absolute; bottom: 40px; right: 40px; width: 300px;

/* Top bar */
position: absolute; top: 0; left: 0; width: 100%; height: 120px;
```

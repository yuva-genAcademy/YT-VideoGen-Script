---
name: timing
description: Data attributes for clip timing — data-start, data-duration, data-track-index, relative references
metadata:
  tags: timing, data-start, data-duration, data-track-index, relative, trim
---

## Core timing attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-start` | Yes | When the clip appears on the timeline (seconds) |
| `data-duration` | Images only | How long the clip lasts (seconds). Videos/audio infer from file. |
| `data-track-index` | Yes | Z-order layer (clips on same track cannot overlap) |
| `data-media-start` | No | Trim — skip this many seconds from the start of the media |
| `data-volume` | No | Audio volume, 0–1. Default: 1 |
| `data-has-audio` | No | Mark a video as having audio: `data-has-audio="true"` |

## Absolute timing

```html
<video id="intro" class="clip" src="intro.mp4"
       data-start="0" data-duration="5" data-track-index="0" muted>
</video>

<video id="main" class="clip" src="main.mp4"
       data-start="5" data-track-index="0" muted>
</video>
```

## Relative timing

Reference another clip's ID in `data-start`:

```html
<!-- main starts exactly when intro ends -->
<video id="main" class="clip" src="main.mp4"
       data-start="intro" data-track-index="0" muted>
</video>

<!-- 1 second after intro ends -->
<video id="b-roll" class="clip" src="b.mp4"
       data-start="intro + 1" data-track-index="0" muted>
</video>

<!-- 0.5 second overlap (crossfade region) -->
<video id="scene2" class="clip" src="s2.mp4"
       data-start="scene1 - 0.5" data-track-index="1" muted>
</video>
```

Relative expressions: `"clipId"`, `"clipId + N"`, `"clipId - N"` where N is seconds.

## Media trimming

Skip the first 2 seconds of a video:

```html
<video id="cut" class="clip" src="long.mp4"
       data-start="0"
       data-media-start="2"
       data-duration="8"
       data-track-index="0"
       muted>
</video>
```

## Volume control

```html
<!-- 50% volume background music -->
<audio id="bgm" class="clip" src="music.mp3"
       data-start="0"
       data-volume="0.5"
       data-track-index="2">
</audio>

<!-- Full-volume voiceover -->
<audio id="vo" class="clip" src="narration.mp3"
       data-start="0"
       data-volume="1"
       data-track-index="3">
</audio>
```

## Track overlap rule

Clips **on the same `data-track-index` cannot overlap in time**. Overlapping layers require different track indices.

```
✅ OK — different tracks overlap:
  Track 0: video    (0s → 10s)
  Track 1: overlay  (3s → 7s)

❌ WRONG — same track, overlapping:
  Track 0: clip-a   (0s → 5s)
  Track 0: clip-b   (4s → 9s)  ← starts before clip-a ends = conflict
```

## Timeline duration

The total video length is determined by the last clip to end. Ensure your GSAP animation timeline covers this full duration:

```js
const TOTAL = 12; // 12-second video
tl.set({}, {}, TOTAL); // extend GSAP timeline to match
```

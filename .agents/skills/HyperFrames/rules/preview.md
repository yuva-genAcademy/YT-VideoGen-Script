---
name: preview
description: Standard preview.html template — always create alongside index.html; never render until user asks
metadata:
  tags: preview, development, playback, scrubber, no-render
---

## Rule: preview before render

**Never run `npx hyperframes render` unless the user explicitly asks to render or create a video.**

After creating or modifying a composition, always start the HyperFrames dev server and ask the user to run it in a separate terminal:

```
Please run this in a separate terminal to preview your video:

cd src/hyperframes/<CompositionName> && npx hyperframes preview
```

**Do NOT use `open preview.html`** — opening the HTML file directly via `file://` blocks audio autoplay. The dev server serves over `localhost`, which allows audio to play in sync with the animation.

The dev server provides:
- Full audio + animation playback in sync
- Hot-reload on file changes
- Correct relative asset paths (fonts, audio, images)

---

## Standard preview.html template

Copy this verbatim for every new composition. Replace the two `REPLACE_*` placeholders:

- `REPLACE_TITLE` — human-readable title, e.g. `Tokens and Tokenization`
- `REPLACE_SCENES` — the scene map array (see below)
- `REPLACE_TOTAL` — total duration in seconds (match `tl.set({}, {}, N)` in index.html)
- `REPLACE_COMPOSITION_ID` — must match `data-composition-id` on the root element and the `window.__timelines` key

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preview — REPLACE_TITLE</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #111;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      overflow: hidden;
    }

    #stage {
      position: relative;
      width: 100vw;
      height: calc(100vw * 9 / 16);
      max-height: 100vh;
      max-width: calc(100vh * 16 / 9);
      overflow: hidden;
    }

    #scaler {
      position: absolute;
      top: 0; left: 0;
      width: 1920px;
      height: 1080px;
      transform-origin: top left;
    }

    iframe {
      border: none;
      width: 1920px;
      height: 1080px;
      display: block;
    }

    #controls {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(0,0,0,0.80);
      backdrop-filter: blur(12px);
      border-radius: 40px;
      padding: 10px 20px;
      z-index: 9999;
    }

    button {
      background: #2563EB;
      color: #fff;
      border: none;
      border-radius: 20px;
      padding: 8px 20px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 0.03em;
      transition: background 0.15s;
    }
    button:hover { background: #3B82F6; }
    button:disabled { background: #444; color: #888; cursor: default; }

    #scrubber {
      width: 360px;
      accent-color: #2563EB;
      cursor: pointer;
    }

    #timecode {
      color: #ccc;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      min-width: 80px;
      text-align: right;
    }

    #scene-label {
      color: #93C5FD;
      font-size: 12px;
      font-weight: 600;
      min-width: 200px;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>

<div id="stage">
  <div id="scaler">
    <iframe id="comp" src="index.html"></iframe>
  </div>
</div>

<div id="controls">
  <span id="scene-label">Loading…</span>
  <button id="playBtn" disabled>▶ Play</button>
  <button id="restartBtn" disabled>↺ Restart</button>
  <input id="scrubber" type="range" min="0" max="REPLACE_TOTAL" step="0.1" value="0">
  <span id="timecode">0:00 / 0:00</span>
</div>

<script>
  // ── Scale the 1920×1080 canvas to fill viewport ──────────────────────────
  const stage  = document.getElementById('stage');
  const scaler = document.getElementById('scaler');

  function rescale() {
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const scale = Math.min(sw / 1920, sh / 1080);
    scaler.style.transform = `scale(${scale})`;
    scaler.style.left = Math.round((sw - 1920 * scale) / 2) + 'px';
    scaler.style.top  = Math.round((sh - 1080 * scale) / 2) + 'px';
  }
  rescale();
  window.addEventListener('resize', rescale);

  // ── Scene map — replace with actual scene start times ──────────────────
  // Format: { t: <start_seconds>, label: '<scene label>' }
  const SCENES = REPLACE_SCENES;

  const TOTAL = REPLACE_TOTAL;
  const COMP_ID = 'REPLACE_COMPOSITION_ID';

  function currentScene(t) {
    let s = SCENES[0];
    for (const sc of SCENES) { if (t >= sc.t) s = sc; else break; }
    return s;
  }

  function fmt(s) {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  }

  // ── Wire up after iframe loads ──────────────────────────────────────────
  const iframe     = document.getElementById('comp');
  const playBtn    = document.getElementById('playBtn');
  const restartBtn = document.getElementById('restartBtn');
  const scrubber   = document.getElementById('scrubber');
  const timecode   = document.getElementById('timecode');
  const sceneLabel = document.getElementById('scene-label');

  let tl, playing = false, rafId;

  timecode.textContent = `0:00 / ${fmt(TOTAL)}`;

  iframe.addEventListener('load', () => {
    const win = iframe.contentWindow;
    tl = win.__timelines?.[COMP_ID];

    if (!tl) {
      sceneLabel.textContent = `⚠ Timeline "${COMP_ID}" not found`;
      return;
    }

    tl.seek(0);
    scrubber.max = TOTAL;
    playBtn.disabled    = false;
    restartBtn.disabled = false;
    sceneLabel.textContent = 'Ready — press Play';
    timecode.textContent   = `0:00 / ${fmt(TOTAL)}`;
  });

  function tick() {
    const t = tl.time();
    scrubber.value = t;
    timecode.textContent = `${fmt(t)} / ${fmt(TOTAL)}`;
    sceneLabel.textContent = currentScene(t).label;
    if (t >= TOTAL || !playing) { stopPlay(); return; }
    rafId = requestAnimationFrame(tick);
  }

  function startPlay() {
    playing = true;
    playBtn.textContent = '⏸ Pause';
    tl.play();
    rafId = requestAnimationFrame(tick);
  }

  function stopPlay() {
    playing = false;
    playBtn.textContent = '▶ Play';
    tl.pause();
    cancelAnimationFrame(rafId);
  }

  playBtn.addEventListener('click', () => {
    if (playing) stopPlay(); else startPlay();
  });

  restartBtn.addEventListener('click', () => {
    stopPlay();
    tl.seek(0);
    scrubber.value = 0;
    sceneLabel.textContent = SCENES[0].label;
    timecode.textContent = `0:00 / ${fmt(TOTAL)}`;
    setTimeout(startPlay, 100);
  });

  scrubber.addEventListener('input', () => {
    const t = parseFloat(scrubber.value);
    const wasPlaying = playing;
    stopPlay();
    tl.seek(t);
    timecode.textContent = `${fmt(t)} / ${fmt(TOTAL)}`;
    sceneLabel.textContent = currentScene(t).label;
    if (wasPlaying) setTimeout(startPlay, 50);
  });
</script>
</body>
</html>
```

---

## How to fill in the placeholders

### REPLACE_TITLE
The human-readable composition name:
```
Tokens and Tokenization
```

### REPLACE_COMPOSITION_ID
Must exactly match both `data-composition-id` on `#root` and the `window.__timelines` key in `index.html`:
```
tokens-and-tokenization
```

### REPLACE_TOTAL
The total video duration in seconds — must match the final `tl.set({}, {}, N)` marker in `index.html`:
```
249
```

### REPLACE_SCENES
An array of `{ t, label }` objects — one entry per scene, `t` is the scene's start time in seconds:
```js
[
  { t:   0.0, label: '01 — What Is a Token' },
  { t:  18.0, label: '02 — Why Tokenization Exists' },
  { t:  41.5, label: '03 — How BPE Works' },
  { t:  76.5, label: '04 — Tokens ≠ Words' },
  { t: 102.5, label: '05 — Cost' },
  { t: 126.5, label: '06 — Context Window' },
  { t: 158.5, label: '07 — Model Behavior' },
  { t: 189.5, label: '08 — Design Rules' },
  { t: 221.5, label: '09 — Conclusion' },
]
```

---

## Opening the preview

After writing `preview.html`, always open it immediately:

```bash
open preview.html
# or on Linux:
xdg-open preview.html
```

The user sees a scaled 16:9 player with Play/Pause, Restart, and a scrubber. No audio is needed — the GSAP timeline runs on its own clock.

---

## Portrait (9:16) compositions

For portrait videos (1080×1920), change the stage aspect ratio in the CSS:

```css
#stage {
  height: 100vh;
  width: calc(100vh * 9 / 16);
  max-width: 100vw;
  max-height: calc(100vw * 16 / 9);
}
```

And update the scaler dimensions:
```js
const scale = Math.min(sw / 1080, sh / 1920);
scaler.style.left = Math.round((sw - 1080 * scale) / 2) + 'px';
scaler.style.top  = Math.round((sh - 1920 * scale) / 2) + 'px';
```

---

## Checklist — after every composition change

- [ ] `index.html` has `window.__timelines["<id>"] = tl` at the end of the script
- [ ] `index.html` has `tl.set({}, {}, <total_duration>)` as the last timeline entry
- [ ] `preview.html` exists in the same directory
- [ ] `REPLACE_COMPOSITION_ID` in `preview.html` matches `data-composition-id` in `index.html`
- [ ] `open preview.html` was run so the user can review
- [ ] **`npx hyperframes render` was NOT run** unless the user explicitly asked

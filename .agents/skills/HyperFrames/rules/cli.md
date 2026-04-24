---
name: cli
description: Full HyperFrames CLI reference — init, preview, lint, snapshot, tts, transcribe, capture, doctor
metadata:
  tags: cli, init, preview, lint, snapshot, tts, transcribe, capture, doctor
---

## Installation

HyperFrames CLI runs via `npx` — no global install required:

```bash
npx hyperframes <command>
```

To add AI skill integrations (Claude Code, etc.):

```bash
npx skills add heygen-com/hyperframes
```

## Create & scaffold

### `init` — scaffold a new project

```bash
npx hyperframes init my-video          # scaffold from examples
npx hyperframes init my-video --blank  # start from blank template
```

Creates a project directory with `index.html`, `package.json`, and sample assets.

### `add` — install a catalog block

```bash
npx hyperframes add light-leak
npx hyperframes add spotify-card
npx hyperframes add shader-transitions
npx hyperframes catalog              # list all available blocks
```

## Develop & preview

### `preview` — live dev server

```bash
npx hyperframes preview              # starts at http://localhost:3000
npx hyperframes preview --port 4000  # custom port
```

Hot-reloads on file save. Use this for iteration before rendering.

### `lint` — check composition structure

```bash
npx hyperframes lint
npx hyperframes lint --file index.html
```

Catches: missing `class="clip"`, track conflicts, missing `data-composition-id`, timeline key mismatches.

### `snapshot` — capture frames as PNG

```bash
npx hyperframes snapshot                  # captures key frames
npx hyperframes snapshot --frame 30       # specific frame number
npx hyperframes snapshot --time 1.5       # specific time in seconds
npx hyperframes snapshot --output frame.png
```

Use this to review visual state before committing to a full render.

### `info` — show composition metadata

```bash
npx hyperframes info
```

Outputs: composition ID, canvas dimensions, total duration, clip count.

## Media tools

### `tts` — text-to-speech

```bash
npx hyperframes tts "Hello world" --output vo.mp3
npx hyperframes tts --file script.txt --output narration.mp3
npx hyperframes tts --voice en-us-1     # specify voice
```

Powered by Kokoro-82M. Runs locally, no API key required.

### `transcribe` — audio/video to timestamps

```bash
npx hyperframes transcribe audio.mp3 --output timestamps.json
npx hyperframes transcribe video.mp4
```

Outputs word-level timestamps for syncing animations to narration. Uses Whisper.

### `capture` — extract assets from a website

```bash
npx hyperframes capture https://example.com
```

Outputs: screenshots, colors, fonts, logos, and a brand reference guide. Used as the first step of the website-to-video pipeline.

## Production & environment

### `doctor` — verify environment

```bash
npx hyperframes doctor
```

Checks: Node version, Chrome/Chromium, FFmpeg, Docker (if `--docker` used).

### `browser` — manage Chrome installation

```bash
npx hyperframes browser install  # install bundled Chrome
npx hyperframes browser check    # verify Chrome path
```

### `upgrade` — check for updates

```bash
npx hyperframes upgrade
```

### `benchmark` — test render performance

```bash
npx hyperframes benchmark
```

## Common workflows

```bash
# New project from scratch
npx hyperframes init my-video && cd my-video
npx hyperframes preview

# Add voiceover
npx hyperframes tts "Your script text here" --output vo.mp3
npx hyperframes transcribe vo.mp3 --output timing.json

# Validate before rendering
npx hyperframes lint
npx hyperframes snapshot --time 2

# Final render
npx hyperframes render --output final.mp4 --quality high
```

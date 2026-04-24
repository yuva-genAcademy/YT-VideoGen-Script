---
name: rendering
description: CLI render command — format, quality, fps, GPU, Docker options
metadata:
  tags: render, mp4, webm, mov, quality, fps, gpu, docker, cli
---

## Basic render

```bash
npx hyperframes render --output out.mp4
```

Default: 1920×1080, 30fps, standard quality, MP4.

## Format options

```bash
npx hyperframes render --format mp4    # H.264 MP4 (default)
npx hyperframes render --format webm   # VP9 WebM (smaller, web-friendly)
npx hyperframes render --format mov    # ProRes 4444 (transparency, post-production)
```

Use MOV/ProRes when you need an alpha channel or will composite in another tool.

## Quality presets

```bash
npx hyperframes render --quality draft     # CRF 28, fast iteration
npx hyperframes render --quality standard  # CRF 18, visually lossless at 1080p (default)
npx hyperframes render --quality high      # CRF 15, final delivery
```

During development, always use `--quality draft` for speed.

## Frame rate

```bash
npx hyperframes render --fps 24   # Cinematic
npx hyperframes render --fps 30   # Standard (default)
npx hyperframes render --fps 60   # Smooth motion / gaming
```

Don't request 60fps unnecessarily — doubles render time.

## Performance options

```bash
# GPU hardware acceleration (requires compatible GPU)
npx hyperframes render --gpu

# Multi-worker parallel rendering
npx hyperframes render --workers 4
npx hyperframes render --workers auto   # auto-detect CPU cores

# Combined: fast high-quality render
npx hyperframes render --quality high --gpu --workers auto
```

## Deterministic Docker render

For CI/CD or cross-machine consistency:

```bash
npx hyperframes render --docker
```

Docker rendering guarantees bit-identical output regardless of host OS or Chrome version.

## Full example commands

```bash
# Fast draft preview
npx hyperframes render --output draft.mp4 --quality draft

# Final landscape delivery
npx hyperframes render --output final.mp4 --quality high --fps 30 --gpu

# Social portrait video
npx hyperframes render --output reel.mp4 --quality standard --fps 30

# Transparent overlay (for post)
npx hyperframes render --output overlay.mov --format mov

# CI deterministic render
npx hyperframes render --output ci.mp4 --docker

# Render a specific composition (multi-composition project)
npx hyperframes render --composition intro --output intro.mp4
```

## Benchmark

Test render performance on your machine before committing to settings:

```bash
npx hyperframes benchmark
```

## Output location

If `--output` is omitted, the video is saved to `./out/output.mp4` by default.

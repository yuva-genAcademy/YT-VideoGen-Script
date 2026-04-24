---
name: HyperFrames Skill
description: AI agent skill for HyperFrames — HTML-native video generation by HeyGen
---

# HyperFrames Skill

This skill provides domain knowledge for building videos with [HyperFrames](https://github.com/heygen-com/hyperframes) — HeyGen's open-source, HTML-native video rendering framework.

## What HyperFrames does

Converts HTML compositions + GSAP animations into MP4/WebM/MOV video files.
- No React, no build step — just HTML + JavaScript
- Deterministic: same input always produces the same video
- AI-agent optimized — designed for LLM-driven video generation
- Apache 2.0 — no per-render fees

## Quick start

```bash
npx hyperframes init my-video
npx hyperframes preview
npx hyperframes render --output out.mp4
```

## Skill files

| File | Purpose |
|------|---------|
| [SKILL.md](SKILL.md) | Entry point — mandatory rules and topic index |
| [rules/compositions.md](rules/compositions.md) | HTML structure, root element, clip types |
| [rules/animations.md](rules/animations.md) | GSAP timeline patterns and easing |
| [rules/timing.md](rules/timing.md) | `data-*` timing attributes |
| [rules/media.md](rules/media.md) | Video, image, audio embedding |
| [rules/transitions.md](rules/transitions.md) | Scene transitions (GSAP + shader catalog) |
| [rules/catalog.md](rules/catalog.md) | 50+ pre-built blocks |
| [rules/rendering.md](rules/rendering.md) | Render CLI options |
| [rules/cli.md](rules/cli.md) | Full CLI reference |
| [rules/determinism.md](rules/determinism.md) | Determinism rules |
| [rules/common-mistakes.md](rules/common-mistakes.md) | Top pitfalls |
| [rules/website-to-video.md](rules/website-to-video.md) | Website capture pipeline |
| [rules/prompting.md](rules/prompting.md) | Motion/style vocabulary for AI prompts |

## How to update this skill

Each rule file is self-contained Markdown with a YAML frontmatter block. To update:
1. Edit the relevant rule file directly
2. Add new rule files in `rules/` for new topics
3. Add an entry to the `## How to use` table in `SKILL.md`

To add a new topic area:
```bash
# Create new rule file
touch .agents/skills/HyperFrames/rules/my-topic.md

# Add frontmatter + content, then register in SKILL.md
```

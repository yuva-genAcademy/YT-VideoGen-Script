---
name: catalog
description: 50+ pre-built blocks — social cards, UI components, VFX, transitions. Install with npx hyperframes add
metadata:
  tags: catalog, blocks, components, social, ui, vfx, add
---

## Installing catalog blocks

```bash
npx hyperframes add <block-name>     # install to current project
npx hyperframes catalog              # browse all available blocks
```

Blocks are copied into your project as editable HTML/JS files.

---

## Social media blocks (5)

Ready-to-use animated social cards with realistic styling.

| Block name | Description |
|-----------|-------------|
| `instagram-follow` | Animated Instagram follow notification |
| `reddit-post` | Reddit post card with votes and metadata |
| `spotify-card` | Now Playing card with album art and waveform |
| `tiktok-follow` | TikTok follow notification overlay |
| `x-post` | X (Twitter) post card with engagement metrics |
| `youtube-lower-third` | YouTube subscribe/name banner |

Usage example:
```bash
npx hyperframes add spotify-card
# Edit the generated block HTML with your track data
```

---

## UI & presentation blocks (9)

| Block name | Description |
|-----------|-------------|
| `app-showcase` | App screen mockup with device frame |
| `data-chart` | Animated bar/line chart |
| `flowchart` | Animated process flowchart |
| `logo-outro` | Branded logo outro with call-to-action |
| `macos-notification` | macOS system notification pop-up |
| `ui-3d-reveal` | 3D perspective UI reveal |
| `whip-pan` | Fast whip-pan transition effect |
| `grain-overlay` | Film grain texture overlay |
| `shimmer-sweep` | Shimmer/sheen highlight effect |

---

## Visual effects blocks (12)

| Block name | Effect |
|-----------|--------|
| `chromatic-radial-split` | RGB channel split burst |
| `cinematic-zoom` | Lens punch zoom |
| `cross-warp-morph` | Warp morph between two frames |
| `domain-warp-dissolve` | Organic/fluid dissolve |
| `flash-through-white` | Single white flash frame |
| `glitch` | Digital glitch/corruption break |
| `gravitational-lens` | Spacetime lens distortion |
| `light-leak` | Warm film light overlay |
| `ripple-waves` | Water surface ripple warp |
| `sdf-iris` | SDF-based iris wipe |
| `swirl-vortex` | Spiral vortex transition |
| `thermal-distortion` | Heat haze shimmer |

---

## Shader transitions (19)

GPU-accelerated transition effects between scenes.

```bash
npx hyperframes add shader-transitions
```

| ID | Type |
|----|------|
| `blur` | Gaussian blur blend |
| `cover` | Directional coverage slide |
| `destruction` | Shatters into pieces |
| `dissolve` | Pixel-based dissolve |
| `distortion` | Wave distortion blend |
| `grid` | Grid-cell wipe |
| `light` | Light streak sweep |
| `mechanical` | Gear/mechanical plate wipe |
| `push-down` | Push down |
| `push-left` | Push left |
| `push-right` | Push right |
| `push-up` | Push up |
| `radial` | Iris/radial wipe |
| `scale-down` | Scale shrink reveal |
| `scale-up` | Scale grow reveal |
| `3d-flip` | 3D page flip |
| `3d-cube` | 3D cube rotate |
| `3d-door` | 3D door swing open |
| `3d-book` | 3D book page turn |

---

## Reusable components (3)

| Component | Description |
|-----------|-------------|
| `grain-overlay` | Film grain texture (add cinematic texture) |
| `grid-pixelate-wipe` | Grid-based pixelate reveal/hide |
| `shimmer-sweep` | Highlight shimmer sweep animation |

---

## Choosing catalog blocks by video style

| Style | Recommended blocks |
|-------|--------------------|
| Product launch | `cinematic-zoom`, `app-showcase`, `ui-3d-reveal`, `logo-outro` |
| Social content | `spotify-card`, `instagram-follow`, `tiktok-follow`, `x-post` |
| Corporate/explainer | `data-chart`, `flowchart`, `youtube-lower-third`, `macos-notification` |
| Cinematic/film | `light-leak`, `grain-overlay`, `domain-warp-dissolve`, `thermal-distortion` |
| High energy/hype | `glitch`, `flash-through-white`, `chromatic-radial-split`, `swirl-vortex` |

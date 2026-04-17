# YT-VideoGen Skill — User Guide

This directory contains the **YT-VideoGen Skill**, an AI-powered system designed to be used with **Claude Code** to build high-quality, professional videos using [Remotion](https://www.remotion.dev/).

## 🛠️ How to Run this Skill

This skill is built directly into the repository. To use it, you simply need to have **Claude Code** installed and run it from the project root.

### 1. Install Claude Code (Optional)
If you haven't already, install the Claude Code CLI:
```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Start Claude Code
Open your terminal in the `YT-VideoGen Skill` project root and run:
```bash
claude
```

### 3. Automatic Detection
The AI agent will automatically detect the **Remotion Best Practices** defined in the `.agents/skills` directory. You can start asking it to build or modify videos right away, and it will apply the rules defined here.

## 🤖 Using this Skill with the AI Agent

You don't need to read every rule file yourself! This skill is designed for your AI assistant to follow. Here is how you can use it:

### 1. Direct Prompting
When you want the AI to build a video, mention specific rules to ensure it follows these best practices.

**Example Prompts:**
- *"Build a 30-second narrated video about Agent Architecture using the **narrated-video** rule."*
- *"Sync these scene animations to the script using the **160wpm** formula from the skills."*
- *"Add a smooth transition between these two scenes using the **transitions** rule."*
- *"Create a data chart for this component using the **charts** best practices."*

### 2. Automatic Application
Whenever you ask the AI to "Create a Remotion composition" or "Fix this animation," it will automatically look into the `rules/` directory to ensure it uses:
- `useCurrentFrame` for all animations (no CSS animations).
- `interpolate` or `spring` for smooth motion.
- Properly calculated durations for TTS voiceovers.

### 3. Understanding Rules
If you are curious about a specific constraint (like the **4:20 hard cap**), you can ask the AI:
- *"What are the timing constraints for narrated videos in this repo?"*
- *"Show me the formula for frames-per-word at 30fps."*

### 📋 What the AI Follows

These are the core constraints your AI agent will adhere to when building videos for this project:

#### 🎙️ Narrated & TTS Videos
- **Hard Cap**: The AI will keep videos under **4:20** to ensure they are manageable and engaging.
- **Narrator Rate**: It defaults to **160 words per minute** (the sweet spot for educational content).
- **Automatic Timing**: The AI calculates frame triggers using the formula: `(60 / wpm) * fps` (approx. **11.25 frames per word** at 30fps).

#### 🎨 Animation & Visuals
- **Beat Mapping**: The AI maps animations to specific script word indices for perfect sync.
- **Micro-animations**: It uses `spring` and `Easing` functions for a premium, non-robotic feel.
- **Spotlights**: When mentioned in the script, the AI can automatically dim background elements to "spotlight" the current topic.

### 📂 Rule Reference List
If you want to dive deeper, you can explore the raw rule files that the AI uses:
- `animations.md`: Fundamental animation techniques.
- `audio.md`: Handling audio and trimming.
- `voiceover.md`: TTS integration (ElevenLabs).
- `text-animations.md`: Typography and text effects.
- `transitions.md`: Scene-to-scene transitions.
- `3d.md`: Three.js integration.
- `charts.md`: Data visualization patterns.

---

## 🛠️ Local Development

- **Preview**: Run `npm run dev` to launch the Remotion Studio and see the AI's work live.
- **Structure**: All new compositions created by the AI are placed in `src/compositions/` to keep the project organized.

---

# Prompt Engineering — Narration Script (v3)

**Total Duration:** ~4:01 (241s)
**Speaking pace:** ~130 wpm (calm, clear, educational)
**Style:** Calm, clear, educational — knowledgeable friend explaining, not a lecturer

Formula: `words ÷ 130 × 60 = seconds`

---

## Scene timing map

| Scene | Start | End | Window | Words |
|-------|-------|-----|--------|-------|
| 1 — Introduction | 0s | 20s | ~20s | 44 |
| 2 — Base Prompt | 19.5s | 31.5s | ~12s | 27 |
| 3 — Zero-Shot | 31s | 49s | ~18s | 40 |
| 4 — Role Prompting | 48.5s | 65.5s | ~17s | 36 |
| 5 — Few-Shot | 65s | 82s | ~17s | 36 |
| 6 — Chain of Thought | 81.5s | 101.5s | ~20s | 44 |
| 7 — Self-Consistency | 101s | 121s | ~20s | 43 |
| 8 — Tree of Thoughts | 120.5s | 140.5s | ~20s | 43 |
| 9 — ReAct | 140s | 159s | ~19s | 41 |
| 10 — Prompt Chaining | 158.5s | 177.5s | ~19s | 42 |
| 11 — Comparison | 177s | 223s | ~46s | 100 |
| 12 — Conclusion | 222.5s | 241.5s | ~19s | 42 |

---

## Scene 1 — Introduction (~20s | 44 words)

> Prompt engineering is the practice of structuring your inputs to get better, more reliable outputs from AI language models. Rather than accepting whatever the model produces by default, you can guide it — through technique — toward precise, useful answers. This video covers eight core techniques.

**On screen:** Bad prompt → vague response → insight "The problem isn't the AI. It's the technique." → 8 techniques list  
**Beat:** Hard cut on "eight core techniques" when the technique list appears

---

## Scene 2 — Base Prompt (~12s | 27 words)

> We'll test each technique on the same prompt: "My Python code is slow. How do I make it faster?" — so you can directly compare what each technique produces.

**On screen:** Large prompt card — "My Python code is slow. How do I make it faster?"  
**Beat:** Prompt card snaps in on "same prompt"

---

## Scene 3 — Zero-Shot (~18s | 40 words)

> Zero-shot means asking directly — no instructions or examples. The model relies entirely on its training data and produces a generic, technically correct baseline. It works for simple queries, but offers no way to shape tone, depth, or format.

**On screen:** "01 — Zero-shot" header → prompt card → response appears  
**Beat:** Response appears on "technically correct baseline"

---

## Scene 4 — Role Prompting (~17s | 36 words)

> Role prompting assigns a persona before your question. Specifying "You are a senior Python engineer" anchors the model's perspective, vocabulary, and depth. The response becomes expert-level and audience-aware — same question, fundamentally different output.

**On screen:** "02 — Role Prompting" header → prompt with persona → expert-level response  
**Beat:** Response appears on "expert-level"

---

## Scene 5 — Few-Shot (~17s | 36 words)

> Few-shot prompting provides example question-answer pairs before your actual question. The model recognises the pattern and replicates it. This is effective when you need consistent output format, tone, or length — your examples define the standard.

**On screen:** "03 — Few-shot" header → prompt showing examples → pattern-matched response  
**Beat:** Response appears on "replicates it"

---

## Scene 6 — Chain of Thought (~20s | 44 words)

> Chain-of-thought prompting instructs the model to reason before answering. Adding "Think step by step" surfaces intermediate logic — the model diagnoses first, evaluates options, then recommends. For technical or multi-step problems, showing the reasoning makes the answer verifiable and more reliable.

**On screen:** "04 — Chain-of-Thought" header → prompt with "Think step by step" → step-by-step response  
**Beat:** Each step appears as narrator walks through them

---

## Scene 7 — Self-Consistency (~20s | 43 words)

> Self-consistency runs the same prompt multiple times and selects the most frequent answer. Language models are probabilistic — the same prompt can produce different outputs. Majority voting across multiple samples improves accuracy, especially for tasks where a single unreliable answer carries risk.

**On screen:** "05 — Self-Consistency" header → 3 independent reasoning paths → consensus callout  
**Beat:** Callout appears on "majority voting"

---

## Scene 8 — Tree of Thoughts (~20s | 43 words)

> Tree-of-thoughts extends chain-of-thought by exploring multiple reasoning paths simultaneously. The model evaluates each path, prunes weaker approaches, and synthesises a final answer from the strongest. It's effective for complex, open-ended problems where there is no single obvious solution path.

**On screen:** "06 — Tree-of-Thoughts" header → 3 approach cards → synthesis box  
**Beat:** Synthesis box appears on "synthesises a final answer"

---

## Scene 9 — ReAct (~19s | 41 words)

> ReAct — Reasoning and Acting — interleaves thinking with tool use. The model follows a Thought-Action-Observation loop: form a hypothesis, take an action, observe the result, then reason again. This is the pattern underlying most autonomous AI agent systems.

**On screen:** "07 — ReAct" header → Thought-Action-Observation steps appearing sequentially  
**Beat:** Each step appears as narrator names it

---

## Scene 10 — Prompt Chaining (~19s | 42 words)

> Prompt chaining breaks a complex task into a sequence of smaller prompts, where each output feeds into the next. Rather than asking one prompt to do everything, you decompose the problem — each step specialises and builds on the last.

**On screen:** "08 — Prompt Chaining" header → Step 1 (diagnose) → arrow → Step 2 (action plan)  
**Beat:** Arrow appears on "feeds into the next"

---

## Scene 11 — Comparison (~46s | 100 words)

> Now let's review all eight techniques. Zero-shot gives a generic baseline — useful as a starting point. Role prompting adds context and expertise, shaping tone and depth. Few-shot enforces format and style through examples. Chain-of-thought forces explicit reasoning, ideal for complex problems. Self-consistency improves reliability by sampling multiple outputs. Tree-of-thoughts explores competing approaches and synthesises the best. ReAct integrates tool use with reasoning for dynamic tasks. Prompt chaining decomposes complexity across a structured sequence. These techniques are not mutually exclusive — they can be combined. Role prompting paired with chain-of-thought, or few-shot paired with chaining, often outperforms either technique alone.

**On screen:** 8 technique cards appearing staggered → combination callout  
**Beat:** Each card appears as narrator names each technique  
**Beat:** Combination callout on "not mutually exclusive"

---

## Scene 12 — Conclusion (~19s | 42 words)

> Prompt engineering is a design skill, not a shortcut. Understanding which technique suits which task will consistently improve your results across any language model. These eight techniques form the core toolkit — practice them, combine them, and apply them deliberately.

**On screen:** "8 techniques. One question." → technique recap grid → "Prompt engineering is a design skill. Not a shortcut."  
**Beat:** Closing line lands as punchy finale with a beat of silence

---

## Recording Notes

- **Pace:** ~130 wpm — calm, consistent throughout
- **Pauses:** 0.5s before each technique number ("Zero-shot." [pause] narration)
- **Emphasis:** Stress the key differentiators: *generic*, *expert-level*, *pattern-matched*, *reasoning*, *probabilistic*, *exploring*, *tool use*, *sequence*
- **Tone:** Confident and clear — educational, not hyped
- **Energy arc:** Start with framing (intro) → establish anchor (base prompt) → build through techniques → land strongly (comparison + conclusion)
- **Sync:** Each section's in-point matches the visual beat listed. Stay on script — ad-lib will drift from the animation.

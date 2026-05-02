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

## Full narration (TTS-ready)

Prompt engineering is the practice of structuring your inputs to get better, more reliable outputs from AI language models. Rather than accepting whatever the model produces by default, you can guide it through technique toward precise, useful answers. This video covers eight core techniques.

We will test each technique on the same prompt: My Python code is slow. How do I make it faster? So you can directly compare what each technique produces.

Zero-shot means asking directly, no instructions or examples. The model relies entirely on its training data and produces a generic, technically correct baseline. It works for simple queries, but offers no way to shape tone, depth, or format.

Role prompting assigns a persona before your question. Specifying You are a senior Python engineer anchors the model perspective, vocabulary, and depth. The response becomes expert-level and audience-aware. Same question, fundamentally different output.

Few-shot prompting provides example question answer pairs before your actual question. The model recognises the pattern and replicates it. This is effective when you need consistent output format, tone, or length. Your examples define the standard.

Chain-of-thought prompting instructs the model to reason before answering. Adding Think step by step surfaces intermediate logic. The model diagnoses first, evaluates options, then recommends. For technical or multi-step problems, showing the reasoning makes the answer verifiable and more reliable.

Self-consistency runs the same prompt multiple times and selects the most frequent answer. Language models are probabilistic. The same prompt can produce different outputs. Majority voting across multiple samples improves accuracy, especially for tasks where a single unreliable answer carries risk.

Tree-of-thoughts extends chain-of-thought by exploring multiple reasoning paths simultaneously. The model evaluates each path, prunes weaker approaches, and synthesises a final answer from the strongest. It is effective for complex, open-ended problems where there is no single obvious solution path.

ReAct, Reasoning and Acting, interleaves thinking with tool use. The model follows a Thought, Action, Observation loop: form a hypothesis, take an action, observe the result, then reason again. This is the pattern underlying most autonomous AI agent systems.

Prompt chaining breaks a complex task into a sequence of smaller prompts, where each output feeds into the next. Rather than asking one prompt to do everything, you decompose the problem. Each step specialises and builds on the last.

Now let us review all eight techniques. Zero-shot gives a generic baseline, useful as a starting point. Role prompting adds context and expertise, shaping tone and depth. Few-shot enforces format and style through examples. Chain-of-thought forces explicit reasoning, ideal for complex problems. Self-consistency improves reliability by sampling multiple outputs. Tree-of-thoughts explores competing approaches and synthesises the best. ReAct integrates tool use with reasoning for dynamic tasks. Prompt chaining decomposes complexity across a structured sequence. These techniques are not mutually exclusive. They can be combined. Role prompting paired with chain-of-thought, or few-shot paired with chaining, often outperforms either technique alone.

Prompt engineering is a design skill, not a shortcut. Understanding which technique suits which task will consistently improve your results across any language model. These eight techniques form the core toolkit. Practice them, combine them, and apply them deliberately.

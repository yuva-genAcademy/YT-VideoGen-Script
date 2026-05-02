# How AI Is Trained — The Internet in a Box
## Narration Script

**Total Duration:** ~4:45 (285s)
**Speaking pace:** ~160 wpm
**Formula:** `words ÷ 160 × 60 = seconds`

---

## Scene timing map

| Scene | Start | End | Window | Words |
|-------|-------|-----|--------|-------|
| 1 — Intro | 0s | 32s | ~32s | ~70 |
| 2 — Architecture Flowchart | 34s | 72s | ~38s | ~90 |
| 3 — Pre-Training | 75s | 145s | ~70s | ~170 |
| 4 — Instruction Tuning & RLHF | 148s | 195s | ~47s | ~105 |
| 5 — Alignment | 198s | 232s | ~34s | ~75 |
| 6 — Knowledge Cutoff | 235s | 280s | ~45s | ~105 |
| 7 — Close | 283s | 318s | ~35s | ~85 |

---

## Scene 1 — Intro (~32s | ~70 words)

> You have heard that large language models learned from the internet. That is true — but it flattens a process with three distinct phases, each with different goals, different data, and different costs. Understanding these phases changes how you evaluate models, interpret their failures, and make smarter decisions about when and how to use them.

**On screen:** Module tag → Large title "How AI Is Trained" → Subtitle "The Internet in a Box" + yellow underline → Three-line body paragraph
**Beat:** Each line of the paragraph staggered in as narrator speaks

---

## Scene 2 — Architecture Flowchart (~38s | ~90 words)

> Here is the full pipeline at a glance. Raw text corpus feeds into pre-training, where a transformer learns next-token prediction and attention weights capture relationships across tokens. That produces the base model. From there, instruction tuning shapes behavior, RLHF aligns it to human preference, and alignment tuning adds safety and honesty. The result is the deployed model you call via API — sitting inside your system of prompts, retrieval, and guardrails. Each stage inherits from the one before it. Each introduces tradeoffs.

**On screen:** Title "The Training Pipeline" → 8 flowchart boxes appear one by one with arrows → closing callout
**Beat:** Each box appears as narrator names it

---

## Scene 3 — Pre-Training (~70s | ~170 words)

> Pre-training is where the model builds its world model — its understanding of language, facts, reasoning, and structure. The model being trained is a transformer: an architecture built around attention mechanisms that learns which tokens in a sequence are relevant to each other, regardless of their distance apart. Every major language model today — GPT, Claude, Gemini — is a transformer at its core.

> The input is a massive corpus: web crawls, books, code, scientific papers. Trillions of tokens. The entire English Wikipedia is roughly four billion tokens — a rounding error at this scale.

> The training task is deceptively simple: predict the next token. But solving this across all of human writing forces the transformer to internalize grammar, logic, facts, and code — because all of it helps prediction.

> This is self-supervised learning. No human-labeled data required. The label is always the next word, already in the text. That is why pre-training can scale so aggressively.

> What you get is a base model — a powerful text predictor with no particular goal and no safety properties. Not a product. A starting point.

> Pre-training is also where the massive compute cost lives — tens to hundreds of millions of dollars, months of GPU time. This is the moat separating a handful of labs from everyone else.

**On screen:** Title → Transformer keyword card → LLM logos row → Corpus stat → Predict-next-token task card → Self-supervised label → Base model callout → Compute cost line
**Beat:** Each concept block appears as narrator introduces it

---

## Scene 4 — Instruction Tuning & RLHF (~47s | ~105 words)

> Fine-tuning makes the base model useful. The most common approach is instruction tuning — training on examples of human instructions paired with high-quality responses. The model learns to follow directives, not just complete text.

> A critical variant is RLHF — Reinforcement Learning from Human Feedback. Human raters compare two outputs and pick the better one. A reward model learns to predict those preferences. The main model is then optimized to maximize that reward.

> RLHF is why ChatGPT felt different. The model was not just more capable — it had been shaped toward outputs humans actually prefer. That is a different optimization target than raw prediction.

> One key constraint: fine-tuning shapes behavior, but it does not update knowledge. If you need the model to know something new, you either retrain it or inject the information at inference time — which is what RAG does.

**On screen:** Title → Instruction tuning definition card → RLHF 3-step visual → "Shaped by human preference" callout → Constraint note
**Beat:** RLHF steps appear one at a time as narrator names each

---

## Scene 5 — Alignment (~34s | ~75 words)

> The final phase makes the model safe and honest.

> This includes both hard content filtering and preference-based tuning — teaching the model to be helpful without being harmful. Anthropic's approach, Constitutional AI, trains a model to critique and revise its own outputs against a written set of principles, reducing dependence on continuous human feedback.

> Here is the practical tradeoff: safety tuning can cause over-refusal — declining legitimate requests because they superficially resemble harmful ones. Knowing this helps you write better prompts and choose the right model for your context.

**On screen:** Title → Two panels: content filtering + preference tuning → Constitutional AI card → Over-refusal warning
**Beat:** Warning card hits on "over-refusal"

---

## Scene 6 — Knowledge Cutoff (~45s | ~105 words)

> Because pre-training happens once on a static dataset, every model has a knowledge cutoff — a date beyond which it has no information. Anything after that date does not exist to the model unless you tell it.

> This also affects confidence. An event documented across millions of web pages carries far more statistical weight than a recent one with sparse coverage. The model's certainty reflects volume in the training data, not ground truth. This is part of why models can be confidently wrong.

> For builders, this matters in concrete ways: RAG supplements frozen knowledge with live retrieval; telling the model today's date shifts its behavior; and a recent cutoff does not automatically mean better — training quality and fine-tuning matter more.

**On screen:** Title → Timeline with cutoff marker → "Volume ≠ Ground Truth" callout → Three builder implications appearing staggered
**Beat:** Each implication appears as narrator states it

---

## Scene 7 — Close (~35s | ~85 words)

> Three phases: pre-training builds the world model, fine-tuning shapes behavior, alignment tunes for safety and preference. And underneath all of it — a transformer, learning from patterns in text at a scale that is genuinely hard to reason about intuitively.

> When a model fails — hallucinating, refusing, being inconsistent — the root cause lives in one of these phases. That diagnostic ability separates engineers who understand the stack from those who are just prompting and hoping.

**On screen:** Three-phase recap cards → Transformer underlining → Failure diagnostic callout
**Beat:** Each phase card appears as narrator names it

---

## Recording Notes

- **Pace:** 160 wpm — clear and measured, not rushed
- **Pauses:** 0.5s before each new section heading; 0.3s after colons introducing lists
- **Emphasis:** *transformer*, *self-supervised*, *base model*, *over-refusal*, *knowledge cutoff*
- **Tone:** Confident, crisp, lecture-style — no upward inflection on factual statements
- **Sync:** Animation beats are keyed to the bold terms above — stay on script

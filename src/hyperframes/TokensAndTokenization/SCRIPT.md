# Tokens and Tokenization — Maven Course Script

**Total Duration:** ~4:05 (245s)
**Speaking pace:** ~130 wpm (confident, authoritative, lecture cadence)
**Style:** Crisp, direct — precise technical instruction without hand-waving

Formula: `words ÷ 130 × 60 = seconds`

---

## Scene timing map

| Scene | Start | End | Window | Words |
|-------|-------|-----|--------|-------|
| 1 — What Is a Token | 0s | 18s | ~18s | 39 |
| 2 — Why Tokenization Exists | 18s | 42s | ~24s | 52 |
| 3 — How BPE Works | 41.5s | 77s | ~36s | 78 |
| 4 — Tokens Are Not Words | 76.5s | 103s | ~27s | 59 |
| 5 — Cost | 102.5s | 127s | ~24s | 53 |
| 6 — Context Window | 126.5s | 159s | ~33s | 72 |
| 7 — Model Behavior | 158.5s | 190s | ~31s | 67 |
| 8 — Practical Design Rules | 189.5s | 222s | ~33s | 71 |
| 9 — Conclusion | 221.5s | 249s | ~28s | 61 |
| **Total** | | | **~249s** | **~552** |

---

## Scene 1 — What Is a Token (~18s | 39 words)

> Language models don't read text the way humans do. They operate on tokens — fragments of text that sit somewhere between characters and words. Tokenization is the process of converting raw text into these fragments before the model sees anything.

**On screen:** The word "Tokenization" → splits into "Token" + "ization" → label: *Not a word. Not a character. A token.*
**Beat:** Split animation fires on "fragments of text"

---

## Scene 2 — Why Tokenization Exists (~24s | 52 words)

> Computers process numbers, not text. To pass language into a neural network, every piece of text must first be converted to integers. Tokenization is that conversion step. Each token maps to a unique ID in the model's vocabulary. Those IDs are then projected into dense numerical vectors — called embeddings — which the model actually computes on.

**On screen:** Pipeline: `"Hello world"` → tokens → integer IDs → embedding vectors → model
**Beat:** Each pipeline stage appears as narrator names it
**Beat:** "Embeddings" label with small vector notation appears on "numerical vectors"

---

## Scene 3 — How BPE Works (~36s | 78 words)

> The most widely used algorithm is Byte Pair Encoding — BPE. It starts with individual characters, then iteratively merges the most frequent adjacent pairs into single tokens, building up a vocabulary until it reaches a fixed size — typically between 30,000 and 100,000 tokens. Common English words like "the" become a single token. Rare or technical terms get fragmented. The word "tokenization" itself tokenizes as "token" and "ization." The vocabulary is learned from a training corpus. It is not hand-coded.

**On screen:** Step-by-step merge diagram: characters → pairs → tokens → vocabulary
**Beat:** Each merge step appears as narrator walks through the process
**Beat:** Vocabulary size range appears on "30,000 to 100,000"

---

## Scene 4 — Tokens Are Not Words (~27s | 59 words)

> Tokens are not words. One hundred words of English prose maps to roughly 75 tokens. The same passage in Thai or Arabic may cost twice as many — those languages are underrepresented in training data, so the tokenizer uses smaller fragments. Code behaves differently from prose. Emojis can cost multiple tokens each. Word count and token count are different numbers.

**On screen:** Side-by-side: "100 English words → ~75 tokens" vs "100 Thai words → ~150+ tokens"
**Beat:** Comparison callout appears on "twice as many"
**Beat:** Emoji token cost example appears on "multiple tokens each"

---

## Scene 5 — Cost (~24s | 53 words)

> API pricing for language models is denominated in tokens — input and output billed separately, often at different rates. If you are passing long documents and generating verbose responses, consumption compounds quickly. Token efficiency is not premature optimization. For any application running at scale, it is a direct input to unit economics.

**On screen:** Billing diagram: input token meter + output token meter → total cost callout
**Beat:** Cost callout appears on "unit economics"

---

## Scene 6 — Context Window (~33s | 72 words)

> Every model has a context window — the maximum number of tokens it can process in a single call, across both input and output combined. Exceed it and the model either truncates, errors, or silently drops earlier content. A 128,000-token context sounds substantial until you factor in a system prompt, retrieved documents, conversation history, and structured output formatting. Context fills faster than expected. This is a hard engineering constraint, not a soft guideline.

**On screen:** Context window bar filling up: system prompt → documents → history → output → overflow marker
**Beat:** Each segment fills as narrator names it
**Beat:** "Hard engineering constraint" label snaps in on that phrase

---

## Scene 7 — Model Behavior (~31s | 67 words)

> Tokens are the unit of attention inside the transformer. The model attends to tokens — not to words, syllables, or characters. It has no native sense of spelling. Ask a model to count the letters in a word, or to reverse a string character by character, and it will often fail — not because it is unintelligent, but because those operations require character-level reasoning that tokens do not preserve.

**On screen:** Transformer attention diagram — arrows connecting tokens, not characters
**Beat:** Attention arrows appear on "attends to tokens"
**Beat:** Failure example appears on "it will often fail" — letter-counting task with wrong output

---

## Scene 8 — Practical Design Rules (~33s | 71 words)

> Several design principles follow from this. Prompt compression is a real skill — shorter prompts with equivalent information reduce cost and latency. JSON and XML cost more tokens than plain text for the same data. In multilingual applications, allocate extra token budget for non-Latin scripts. And when debugging unexpected model behavior — forgotten instructions, incomplete reasoning — check your token count. The model cannot signal that it is losing context. You have to track it.

**On screen:** Four rule cards appearing staggered — Compress / Format matters / Budget by language / Track context
**Beat:** Each card appears as narrator states that rule
**Beat:** Final card "You have to track it" holds on screen

---

## Scene 9 — Conclusion (~28s | 61 words)

> Tokens are the fundamental unit of language model input and output. They determine cost, bound what fits in context, and define how the model represents language. But tokenization is only the entry point. Once text has been converted to integers and those integers projected into embeddings, they are handed off to a neural network — the system that does the actual computation. That is where the next module begins.

**On screen:** Pipeline recap: text → tokens → integer IDs → embeddings → *[neural network, dimmed]* → output
**Beat:** Neural network node un-dims and pulses on "that is where the next module begins"

---

## Full narration (TTS-ready)

Language models don't read text the way humans do. They operate on tokens, fragments of text that sit somewhere between characters and words. Tokenization is the process of converting raw text into these fragments before the model sees anything.

Computers process numbers, not text. To pass language into a neural network, every piece of text must first be converted to integers. Tokenization is that conversion step. Each token maps to a unique ID in the model's vocabulary. Those IDs are then projected into dense numerical vectors, called embeddings, which the model actually computes on.

The most widely used algorithm is Byte Pair Encoding, BPE. It starts with individual characters, then iteratively merges the most frequent adjacent pairs into single tokens, building up a vocabulary until it reaches a fixed size, typically between 30,000 and 100,000 tokens. Common English words like the become a single token. Rare or technical terms get fragmented. The word tokenization itself tokenizes as token and ization. The vocabulary is learned from a training corpus. It is not hand-coded.

Tokens are not words. One hundred words of English prose maps to roughly 75 tokens. The same passage in Thai or Arabic may cost twice as many, because those languages are underrepresented in training data, so the tokenizer uses smaller fragments. Code behaves differently from prose. Emojis can cost multiple tokens each. Word count and token count are different numbers.

API pricing for language models is denominated in tokens, input and output billed separately, often at different rates. If you are passing long documents and generating verbose responses, consumption compounds quickly. Token efficiency is not premature optimization. For any application running at scale, it is a direct input to unit economics.

Every model has a context window, the maximum number of tokens it can process in a single call, across both input and output combined. Exceed it and the model either truncates, errors, or silently drops earlier content. A 128,000-token context sounds substantial until you factor in a system prompt, retrieved documents, conversation history, and structured output formatting. Context fills faster than expected. This is a hard engineering constraint, not a soft guideline.

Tokens are the unit of attention inside the transformer. The model attends to tokens, not to words, syllables, or characters. It has no native sense of spelling. Ask a model to count the letters in a word, or to reverse a string character by character, and it will often fail, not because it is unintelligent, but because those operations require character-level reasoning that tokens do not preserve.

Several design principles follow from this. Prompt compression is a real skill, shorter prompts with equivalent information reduce cost and latency. JSON and XML cost more tokens than plain text for the same data. In multilingual applications, allocate extra token budget for non-Latin scripts. And when debugging unexpected model behavior, forgotten instructions, incomplete reasoning, check your token count. The model cannot signal that it is losing context. You have to track it.

Tokens are the fundamental unit of language model input and output. They determine cost, bound what fits in context, and define how the model represents language. But tokenization is only the entry point. Once text has been converted to integers and those integers projected into embeddings, they are handed off to a neural network, the system that does the actual computation. That is where the next module begins.

---

## Recording notes

- **Pace:** 130 wpm — deliberate and measured throughout
- **Pauses:** 0.5s before each new concept word ("Tokens." [pause] "are not words.")
- **Emphasis:** *fragments*, *integers*, *embeddings*, *not hand-coded*, *twice as many*, *hard engineering constraint*, *does not preserve*, *you have to track it*, *predictable*
- **Tone:** Authoritative without being cold — the kind of instructor who has built real systems with this
- **Energy arc:** Definition (1) → Foundation (2) → Mechanism (3) → Nuance (4) → Consequences (5–7) → Application (8) → Synthesis (9)
- **Sync:** Every section in-point matches the visual beat. The narration drives the animation, not the reverse.

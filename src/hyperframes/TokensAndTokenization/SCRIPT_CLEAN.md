# Tokens and Tokenization — Narration Script (Clean)

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

---

## Full narration

Language models don't read text the way humans do. They operate on tokens, fragments of text that sit somewhere between characters and words. Tokenization is the process of converting raw text into these fragments before the model sees anything.

Computers process numbers, not text. To pass language into a neural network, every piece of text must first be converted to integers. Tokenization is that conversion step. Each token maps to a unique ID in the model's vocabulary. Those IDs are then projected into dense numerical vectors, called embeddings, which the model actually computes on.

The most widely used algorithm is Byte Pair Encoding, BPE. It starts with individual characters, then iteratively merges the most frequent adjacent pairs into single tokens, building up a vocabulary until it reaches a fixed size, typically between thirty thousand and one hundred thousand tokens. Common English words like the become a single token. Rare or technical terms get fragmented. The word tokenization itself tokenizes as token and ization. The vocabulary is learned from a training corpus. It is not hand-coded.

Tokens are not words. One hundred words of English prose maps to roughly 75 tokens. The same passage in Thai or Arabic may cost twice as many, because those languages are underrepresented in training data, so the tokenizer uses smaller fragments. Code behaves differently from prose. Emojis can cost multiple tokens each. Word count and token count are different numbers.

API pricing for language models is denominated in tokens, input and output billed separately, often at different rates. If you are passing long documents and generating verbose responses, consumption compounds quickly. Token efficiency is not premature optimization. For any application running at scale, it is a direct input to unit economics.

Every model has a context window, the maximum number of tokens it can process in a single call, across both input and output combined. Exceed it and the model either truncates, errors, or silently drops earlier content. A one hundred and twenty eight thousand token context sounds substantial until you factor in a system prompt, retrieved documents, conversation history, and structured output formatting. Context fills faster than expected. This is a hard engineering constraint, not a soft guideline.

Tokens are the unit of attention inside the transformer. The model attends to tokens, not to words, syllables, or characters. It has no native sense of spelling. Ask a model to count the letters in a word, or to reverse a string character by character, and it will often fail, not because it is unintelligent, but because those operations require character-level reasoning that tokens do not preserve.

Several design principles follow from this. Prompt compression is a real skill, shorter prompts with equivalent information reduce cost and latency. JSON and XML cost more tokens than plain text for the same data. In multilingual applications, allocate extra token budget for non-Latin scripts. And when debugging unexpected model behavior, forgotten instructions, incomplete reasoning, check your token count. The model cannot signal that it is losing context. You have to track it.

Tokens are the fundamental unit of language model input and output. They determine cost, bound what fits in context, and define how the model represents language. But tokenization is only the entry point. Once text has been converted to integers and those integers projected into embeddings, they are handed off to a neural network, the system that does the actual computation. That is where the next module begins.

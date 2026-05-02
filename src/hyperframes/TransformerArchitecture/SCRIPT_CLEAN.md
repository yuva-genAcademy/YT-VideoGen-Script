# The Transformer Architecture — Narration Script (TTS-Ready)

**Total Duration:** ~5:10 (310s estimated)
**Speaking pace:** 160 wpm
**Style:** Calm, authoritative, technical — knowledgeable colleague explaining, not a lecturer

Formula: `words ÷ 160 × 60 = seconds`

---

## Scene timing map

| Scene | Start | End | Window | Words |
|-------|-------|-----|--------|-------|
| 1 — Introduction            |   0s |  22s | ~22s | ~46  |
| 2 — What It Replaced        |  22.5s |  65.5s | ~43s | ~110 |
| 3 — Building Block          |  66s | 118s | ~52s | ~133 |
| 4 — Encoder vs Decoder      | 118.5s | 166.5s | ~48s | ~122 |
| 5 — How Generation Works    | 167s | 202s | ~35s | ~87  |
| 6 — Why It Scales           | 202.5s | 245.5s | ~43s | ~110 |
| 7 — KV Cache                | 246s | 284s | ~38s | ~97  |
| 8 — Summary                 | 284.5s | 312.5s | ~28s | ~67  |

---

## Full narration

Nearly every major language model in production today is built on a transformer-based architecture. GPT, Claude, Gemini, LLaMA. If you are making decisions about AI systems, whether technical or strategic, this is the architecture you need to understand.

Before two thousand seventeen, the dominant approach processed language sequentially. One word at a time, each step waiting on the previous. Models struggled to connect information across long distances in a sentence, and training on large datasets was slow. The transformer, introduced in Attention Is All You Need, replaced this with self-attention. Every token in a sequence can directly reference every other token simultaneously. A word at position one and a word at position fifty interact on equal footing, removing the strict sequential bottleneck. Training can be parallelized across tokens within a sequence. That made training on massive datasets tractable. And that is why the transformer became the foundation of the modern AI stack.

A transformer is built by stacking identical layers. Dozens in smaller models, up to around one hundred or more in large ones. Each layer does two things in sequence. First, self-attention. Tokens exchange information across the sequence. Each token identifies which other tokens are relevant to its meaning in context, and updates its own representation accordingly. Second, a feed-forward network. Two linear transformations applied independently to each token. No cross-token communication here. After attention distributes context, the feed-forward layer transforms each token on its own. Attend, then transform. That pair repeats at every layer. Two components make deep stacking reliable. Residual connections, which add each layer's input directly to its output to preserve gradient flow. And layer normalization, which stabilizes activations across many layers. Without these, deep transformers are very difficult to train effectively.

Not all transformers are structured the same way. The two dominant variants serve different purposes. Encoder-only models like BERT apply attention in both directions. Every token sees the full sequence. Built for comprehension tasks: classification, semantic search, document retrieval. They are not designed for text generation. Decoder-only models like GPT and Claude restrict attention so each token only sees what came before it. Trained to predict the next token, they generate text autoregressively. One token at a time, appending each output to the input and running again. This distinction has practical consequences. A retrieval system typically relies on encoder-style models. A generative or conversational product calls for a decoder-only model. Choosing incorrectly is not just a performance issue. It is an architectural mismatch.

At the final layer, each token has a rich contextual representation. That vector is projected across the full vocabulary to produce a probability distribution over what word comes next. The model samples from that distribution, appends the token, and runs again. Each new token requires a forward pass through the model, though cached attention reduces redundant computation. Generation still scales on the order of hundreds of forward steps for a typical response. This has direct implications for latency budgets and cost modeling in production systems.

Most architectures hit a ceiling. Add more parameters and gains plateau unpredictably. The transformer has shown unusually smooth and predictable scaling behavior compared to earlier architectures. Published scaling laws describe a consistent relationship between model size, training data, and capability. More compute and data, applied in proportion, reliably improves performance. That predictability drove the last eight years of AI progress. Not constant reinvention, but disciplined scaling of a stable design. When you evaluate a new model release, that context matters. Capability gains can come from architectural innovation. Or simply from more compute on the same design. Knowing the difference helps you cut through vendor positioning and evaluate claims rigorously.

One infrastructure detail that directly affects what is feasible to build. During generation, the attention computations for all previous tokens would normally repeat on every step. The KV cache stores these intermediate values instead, keeping inference fast. But the cache grows with context length. KV cache is one of the dominant memory costs of inference, alongside model weights themselves. And longer contexts limit how many users can be served concurrently. Longer context is not just more expensive to compute. It reduces serving throughput. When scoping features or evaluating infrastructure costs, this is often the binding constraint.

The transformer replaced sequential processing with parallelizable attention, making large-scale training feasible. It stacks layers of attention and feed-forward operations, stabilized by residuals and normalization. Encoder-only models handle comprehension. Decoder-only models handle generation. The architecture scales predictably, which explains the pace of progress since two thousand seventeen. And KV cache is one of the dominant memory costs of inference, with real consequences for serving economics and system design.

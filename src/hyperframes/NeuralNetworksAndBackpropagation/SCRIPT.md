# Neural Networks and Backpropagation — Maven Course Script (Module 2)

**Total Duration:** ~4:02 (242s)
**Speaking pace:** ~130 wpm (confident, authoritative, lecture cadence)
**Style:** Direct continuation of Module 1 (Tokens and Tokenization) — same visual language, picks up from the embedding pipeline

Formula: `words ÷ 130 × 60 = seconds`

---

## Scene timing map

| Scene | Start | End | Window | Words |
|-------|-------|-----|--------|-------|
| 1 — Picking Up From Tokens | 0s | 27s | ~27s | 58 |
| 2 — Neurons, Weights, and Activations | 26.5s | 61.5s | ~35s | 76 |
| 3 — The Forward Pass | 61s | 86s | ~25s | 55 |
| 4 — The Loss Function | 85.5s | 110.5s | ~25s | 55 |
| 5 — Backpropagation | 110s | 151s | ~41s | 88 |
| 6 — Gradient Descent | 150.5s | 177.5s | ~27s | 59 |
| 7 — Practical Implications | 177s | 213s | ~36s | 78 |
| 8 — Conclusion | 212.5s | 242.5s | ~30s | 65 |
| **Total** | | | **~242s** | **~534** |

---

## Scene 1 — Picking Up From Tokens (~27s | 58 words)

> In the previous module, text became tokens, tokens became integer IDs, and those IDs projected into dense numerical vectors called embeddings. Those embeddings are the actual input to the model. What processes them is a neural network — a function approximator built from layers of interconnected units called neurons. It transforms those vectors through successive layers and produces an output: a prediction, a classification, a generated token.

**On screen:** Pipeline from Module 1 reappears — text → tokens → IDs → embeddings — then continues: embeddings → neural network → output
**Beat:** Pipeline animates left to right, Module 1 section dimmed, new section illuminates on "What processes them"
**Beat:** "Function Approximator" label appears on that phrase

---

## Scene 2 — Neurons, Weights, and Activations (~35s | 76 words)

> Each neuron in the first layer receives the token embedding as its input — one number per embedding dimension. A neuron multiplies each input value by its corresponding weight, sums the results, adds a bias term, and passes the total through an activation function. The activation function introduces non-linearity. Without it, stacking multiple layers would collapse mathematically into a single linear transformation, and the network could learn nothing that a simpler model could not.

**On screen:** Single neuron diagram: embedding vector inputs × weights → sum → activation → output value
**Beat:** Each operation highlights as narrator names it
**Beat:** "Non-linearity" label snaps in on "activation function"
**Beat:** Collapse illustration appears on "single linear transformation"

---

## Scene 3 — The Forward Pass (~25s | 55 words)

> Running the input through the network from start to finish is called the forward pass. It begins with token embeddings entering the first layer, flows through every subsequent transformation, and terminates at the output layer with a final prediction. At this point the network is just a function. Whether it is a useful function depends entirely on its weights.

**On screen:** Animated signal passing left to right — starting at the embedding vectors, flowing through all layers, reaching output
**Beat:** "Forward Pass" label appears as signal reaches the output layer
**Beat:** "Depends on its weights" callout holds on last sentence

---

## Scene 4 — The Loss Function (~25s | 55 words)

> To train a network, you need a way to measure how wrong its outputs are. That is the loss function. It compares the network's prediction against the correct answer and returns a single number — the error. Lower loss means better predictions. Training is the process of systematically reducing this number across the entire dataset.

**On screen:** Prediction vs true label → loss value callout → downward arrow labeled "minimize this"
**Beat:** Loss value appears on "single number — the error"
**Beat:** Downward arrow appears on "systematically reducing"

---

## Scene 5 — Backpropagation (~41s | 88 words)

> To reduce the loss, you need to know how much each weight contributed to it. That is what backpropagation computes. It applies the chain rule from calculus — starting at the loss and working backward through every layer. For each weight, it calculates a gradient: a number indicating how much the loss would change if that weight were nudged. Weights that contributed more to the error get larger gradients. The computation flows backward — output layer first, input layer last — which is why the algorithm is called backpropagation.

**On screen:** Signal now flows right to left — gradients propagating back through every layer toward the embedding inputs
**Beat:** "Chain Rule" label appears on "chain rule from calculus"
**Beat:** Gradient values appear on weights as narrator says "calculates a gradient"
**Beat:** Arrow direction reverses visually on "output layer first, input layer last"

---

## Scene 6 — Gradient Descent (~27s | 59 words)

> Once gradients are computed, the optimizer applies them. In gradient descent, each weight is adjusted by a small step in the direction that reduces the loss. The size of that step is controlled by the learning rate. Set it too high and updates overshoot — training becomes unstable. Set it too low and the model converges slowly or stalls entirely.

**On screen:** Loss curve with a point rolling downhill — step size illustrated
**Beat:** Overshoot illustration appears on "too high"
**Beat:** Slow crawl illustration appears on "too low"

---

## Scene 7 — Practical Implications (~36s | 78 words)

> Several practical realities follow. Backpropagation requires every operation in the network to be differentiable — this is why smooth activations like ReLU replaced hard step functions. Vanishing gradients occur when gradients shrink to near-zero as they propagate back through many layers, leaving early weights unable to learn. Exploding gradients are the inverse. Residual connections, batch normalization, and careful weight initialization all exist to keep gradients stable across depth. These are not cosmetic choices. They are structural responses to backprop failure modes.

**On screen:** Three problem cards appearing staggered — Differentiable ops required / Vanishing gradients / Exploding gradients
**Beat:** Each card appears as narrator names the failure mode
**Beat:** Solution labels (ReLU, ResNet, BatchNorm) appear beneath each card

---

## Scene 8 — Conclusion (~30s | 65 words)

> Neural networks learn by adjusting weights to minimize error. Backpropagation makes this tractable — it distributes responsibility for the error across every parameter, layer by layer. The previous module explained what enters a language model: text converted to tokens, tokens converted to embeddings. This module explained what the model does with them. Together, these two layers form the computational foundation of every modern language model.

**On screen:** Full two-module pipeline: text → tokens → IDs → embeddings → layers → loss → backprop → weight update → repeat
**Beat:** Both modules' pipelines merge into a single end-to-end diagram
**Beat:** "Computational Foundation" label appears, holds for 1.5s before fade

---

## Full narration (TTS-ready)

In the previous module, text became tokens, tokens became integer IDs, and those IDs projected into dense numerical vectors called embeddings. Those embeddings are the actual input to the model. What processes them is a neural network, a function approximator built from layers of interconnected units called neurons. It transforms those vectors through successive layers and produces an output, a prediction, a classification, a generated token.

Each neuron in the first layer receives the token embedding as its input, one number per embedding dimension. A neuron multiplies each input value by its corresponding weight, sums the results, adds a bias term, and passes the total through an activation function. The activation function introduces non-linearity. Without it, stacking multiple layers would collapse mathematically into a single linear transformation, and the network could learn nothing that a simpler model could not.

Running the input through the network from start to finish is called the forward pass. It begins with token embeddings entering the first layer, flows through every subsequent transformation, and terminates at the output layer with a final prediction. At this point the network is just a function. Whether it is a useful function depends entirely on its weights.

To train a network, you need a way to measure how wrong its outputs are. That is the loss function. It compares the network's prediction against the correct answer and returns a single number, the error. Lower loss means better predictions. Training is the process of systematically reducing this number across the entire dataset.

To reduce the loss, you need to know how much each weight contributed to it. That is what backpropagation computes. It applies the chain rule from calculus, starting at the loss and working backward through every layer. For each weight, it calculates a gradient, a number indicating how much the loss would change if that weight were nudged. Weights that contributed more to the error get larger gradients. The computation flows backward, output layer first, input layer last, which is why the algorithm is called backpropagation.

Once gradients are computed, the optimizer applies them. In gradient descent, each weight is adjusted by a small step in the direction that reduces the loss. The size of that step is controlled by the learning rate. Set it too high and updates overshoot, training becomes unstable. Set it too low and the model converges slowly or stalls entirely.

Several practical realities follow. Backpropagation requires every operation in the network to be differentiable, this is why smooth activations like ReLU replaced hard step functions. Vanishing gradients occur when gradients shrink to near-zero as they propagate back through many layers, leaving early weights unable to learn. Exploding gradients are the inverse. Residual connections, batch normalization, and careful weight initialization all exist to keep gradients stable across depth. These are not cosmetic choices. They are structural responses to backprop failure modes.

Neural networks learn by adjusting weights to minimize error. Backpropagation makes this tractable, it distributes responsibility for the error across every parameter, layer by layer. The previous module explained what enters a language model, text converted to tokens, tokens converted to embeddings. This module explained what the model does with them. Together, these two layers form the computational foundation of every modern language model.

---

## Recording notes

- **Pace:** 130 wpm — Scene 5 (backpropagation) can slow slightly; it is the most mechanically dense
- **Pauses:** 0.5s on module transitions ("In the previous module," [slight pause] "text became tokens")
- **Emphasis:** *embeddings*, *non-linearity*, *single linear transformation*, *forward pass*, *gradient*, *chain rule*, *output layer first input layer last*, *learning rate*, *structural responses*, *computational foundation*
- **Tone:** Same register as Module 1 — authoritative, no hedging, assumes the audience followed the previous module
- **Energy arc:** Recall (1) → Structure (2) → Inference (3) → Error (4) → Learning mechanism (5–6) → Engineering realities (7) → Two-module synthesis (8)
- **Sync:** Every section in-point matches the visual beat. The narration drives the animation, not the reverse.
- **Visual continuity:** Module 1 pipeline should reuse identical visual components — same token/ID/embedding icons, same color language — so the callback in Scene 1 and Scene 8 feels like a genuine continuation, not a copy.

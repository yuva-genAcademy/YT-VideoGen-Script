# Neural Networks and Backpropagation — Narration Script (TTS-ready)

**Total Duration:** ~4:02 (242s)
**Speaking pace:** ~130 wpm (confident, authoritative, lecture cadence)
**Style:** Direct continuation of Module 1 — same visual language, picks up from the embedding pipeline

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

---

## Full narration

In the previous module, text became tokens, tokens became integer IDs, and those IDs projected into dense numerical vectors called embeddings. Those embeddings are the actual input to the model. What processes them is a neural network, a function approximator built from layers of interconnected units called neurons. It transforms those vectors through successive layers and produces an output, a prediction, a classification, a generated token.

Each neuron in the first layer receives the token embedding as its input, one number per embedding dimension. A neuron multiplies each input value by its corresponding weight, sums the results, adds a bias term, and passes the total through an activation function. The activation function introduces non-linearity. Without it, stacking multiple layers would collapse mathematically into a single linear transformation, and the network could learn nothing that a simpler model could not.

Running the input through the network from start to finish is called the forward pass. It begins with token embeddings entering the first layer, flows through every subsequent transformation, and terminates at the output layer with a final prediction. At this point the network is just a function. Whether it is a useful function depends entirely on its weights.

To train a network, you need a way to measure how wrong its outputs are. That is the loss function. It compares the network's prediction against the correct answer and returns a single number, the error. Lower loss means better predictions. Training is the process of systematically reducing this number across the entire dataset.

To reduce the loss, you need to know how much each weight contributed to it. That is what backpropagation computes. It applies the chain rule from calculus, starting at the loss and working backward through every layer. For each weight, it calculates a gradient, a number indicating how much the loss would change if that weight were nudged. Weights that contributed more to the error get larger gradients. The computation flows backward, output layer first, input layer last, which is why the algorithm is called backpropagation.

Once gradients are computed, the optimizer applies them. In gradient descent, each weight is adjusted by a small step in the direction that reduces the loss. The size of that step is controlled by the learning rate. Set it too high and updates overshoot, training becomes unstable. Set it too low and the model converges slowly or stalls entirely.

Several practical realities follow. Backpropagation requires every operation in the network to be differentiable, this is why smooth activations like ReLU replaced hard step functions. Vanishing gradients occur when gradients shrink to near-zero as they propagate back through many layers, leaving early weights unable to learn. Exploding gradients are the inverse. Residual connections, batch normalization, and careful weight initialization all exist to keep gradients stable across depth. These are not cosmetic choices. They are structural responses to backprop failure modes.

Neural networks learn by adjusting weights to minimize error. Backpropagation makes this tractable, it distributes responsibility for the error across every parameter, layer by layer. The previous section covered how text becomes tokens and embeddings. This section covered what the model does with those embeddings. Together, these two layers form the computational foundation of every modern neural network.

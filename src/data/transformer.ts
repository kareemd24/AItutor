import type { ModuleDef } from '../types'


// Layout: data flows left → right. Input embedding feeds the repeated block
// (attention, then FFN, both hanging off the residual spine along the bottom),
// then the output head. Neighbouring concepts are actually related — partial
// credit decays with layout distance, so placement is curation.
const slate = (a: number) => `hsla(220,20%,70%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`

export const transformer: ModuleDef = {
  id: 'transformer',
  title: 'The Transformer, Block by Block',
  tagline: 'Every part a token touches on its way from text to next-token prediction.',
  world: { w: 1000, h: 620 },
  art: [
    // the residual stream drawn as an actual highway with add-junctions
    { t: 'line', pts: [255, 450, 845, 450], s: slate(0.35), lw: 3 },
    { t: 'line', pts: [420, 355, 420, 438], s: violet(0.5), lw: 1.5, dash: [5, 4] },
    { t: 'line', pts: [700, 345, 700, 438], s: amber(0.5), lw: 1.5, dash: [5, 4] },
    { t: 'circle', cx: 420, cy: 450, r: 8, f: 'rgba(11,16,32,0.9)', s: slate(0.6), lw: 1.5 },
    { t: 'text', x: 420, y: 450, text: '+', size: 11, f: 'rgba(226,232,240,0.9)', align: 'center' },
    { t: 'circle', cx: 700, cy: 450, r: 8, f: 'rgba(11,16,32,0.9)', s: slate(0.6), lw: 1.5 },
    { t: 'text', x: 700, y: 450, text: '+', size: 11, f: 'rgba(226,232,240,0.9)', align: 'center' },
    { t: 'text', x: 500, y: 470, text: 'outputs are ADDED, never replace', size: 10, f: slate(0.5), lodMax: 2.5 },
  ],
  flows: [
    // tokens riding the residual highway; block outputs dropping onto it
    { pts: [255, 450, 845, 450], color: slate(0.7), n: 5, speed: 70, size: 2.5 },
    { pts: [420, 360, 420, 442], color: violet(0.7), n: 2, speed: 45, size: 2 },
    { pts: [700, 350, 700, 442], color: amber(0.7), n: 2, speed: 45, size: 2 },
  ],
  items: [
    {
      id: 'tf.embed', name: 'Embedding & Input', kind: 'container', zone: 'Input',
      x: 140, y: 310, w: 220, h: 400,
      note: 'Where raw text becomes vectors — everything after this layer is just arithmetic on those vectors.',
    },
    { id: 'tf.tokenizer', name: 'Tokenizer', kind: 'atom', parent: 'tf.embed', zone: 'Input', x: 95, y: 190,
      note: 'Splits text into subword tokens — the model never sees characters or words, only token IDs.',
      role: 'turns raw text into the subword IDs the model actually reads' },
    { id: 'tf.tokembed', name: 'Token embedding', kind: 'atom', parent: 'tf.embed', zone: 'Input', x: 190, y: 270,
      note: 'A giant lookup table mapping each token ID to a vector — the model’s entire vocabulary lives in this one matrix.' },
    { id: 'tf.rope', name: 'Positional encoding (RoPE)', kind: 'atom', parent: 'tf.embed', zone: 'Input', x: 135, y: 400,
      note: 'Rotates each query and key by an angle set by its position, so attention can feel how far apart two tokens are.',
      role: 'lets attention know how far apart two tokens are' },

    {
      id: 'tf.attn', name: 'Attention', kind: 'container', zone: 'Attention',
      x: 420, y: 200, w: 260, h: 300,
      note: 'The block where tokens look at each other — the only place information moves between positions.',
    },
    { id: 'tf.qkv', name: 'Q / K / V projections', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 350, y: 120,
      note: 'Three learned matrices give each token a query (“what am I looking for?”), a key (“what do I contain?”) and a value (“what do I hand over?”). In “France is ___”, the query of “is” matches the key of “France”.' },
    { id: 'tf.scores', name: 'Attention scores', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 470, y: 100,
      note: 'Each query dotted with every key, then softmaxed into weights — deciding which earlier tokens matter right now, like 0.61 on “France” when completing “France is ___”.' },
    { id: 'tf.heads', name: 'Multi-head / GQA', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 520, y: 180,
      note: 'Attention runs many times in parallel with small heads; GQA shares one K/V group across several query heads to shrink the KV cache.' },
    { id: 'tf.kvcache', name: 'KV cache', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 355, y: 250,
      note: 'Stores every past token’s keys and values so generation never recomputes them — the reason long contexts eat GPU memory.',
      role: 'stores past tokens’ keys and values so decode never recomputes them' },
    { id: 'tf.oproj', name: 'Output projection', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 490, y: 285,
      note: 'Mixes all the heads’ answers back into one vector that gets added onto the residual stream.' },

    {
      id: 'tf.ffn', name: 'Feed-forward network (FFN)', kind: 'container', zone: 'Feed-forward',
      x: 700, y: 195, w: 220, h: 290,
      note: 'Each token, alone, gets asked thousands of learned yes/no questions — “geography? negation? code?” The yeses vote, and the vote nudges the vector. Most of a model’s knowledge lives in these questions.',
    },
    { id: 'tf.up', name: 'Up projection', kind: 'atom', parent: 'tf.ffn', zone: 'Feed-forward', x: 640, y: 130,
      note: 'The question-asking step: multiplies the vector against ~4× more rows than it has dimensions — each row is one learned feature detector.' },
    { id: 'tf.act', name: 'SwiGLU activation', kind: 'atom', parent: 'tf.ffn', zone: 'Feed-forward', x: 700, y: 210,
      note: 'The gate: keeps the detectors that lit up and mutes the rest — only a few percent of neurons fire for any given token.' },
    { id: 'tf.down', name: 'Down projection', kind: 'atom', parent: 'tf.ffn', zone: 'Feed-forward', x: 762, y: 130,
      note: 'The vote: folds the surviving yes-answers back into one nudge the width of the residual stream.' },
    { id: 'tf.moe', name: 'MoE router', kind: 'atom', parent: 'tf.ffn', zone: 'Feed-forward', x: 700, y: 300,
      note: 'In a mixture-of-experts model a tiny router sends each token to a few expert FFNs — total parameters huge, active parameters small.',
      role: 'picks which few experts process each token in a mixture-of-experts model' },

    {
      id: 'tf.head', name: 'Output head', kind: 'container', zone: 'Output',
      x: 900, y: 310, w: 160, h: 340,
      note: 'The exit: the final vector becomes a score for every token in the vocabulary, and one of them gets picked.',
    },
    { id: 'tf.unembed', name: 'Unembedding (LM head)', kind: 'atom', parent: 'tf.head', zone: 'Output', x: 900, y: 220,
      note: 'Projects the final vector to one logit per vocabulary token — often the embedding matrix reused in reverse.' },
    { id: 'tf.sampler', name: 'Sampling (temperature, top-p)', kind: 'atom', parent: 'tf.head', zone: 'Output', x: 900, y: 390,
      note: 'Softmax turns logits into probabilities; temperature sharpens or flattens the distribution before the next token is drawn.',
      role: 'turns logits into probabilities and draws the next token' },

    { id: 'tf.norm', name: 'RMSNorm', kind: 'atom', zone: 'The residual spine', x: 420, y: 450,
      note: 'Rescales the vector to a steady size before each sub-block, keeping hundred-layer training stable; the modern, simpler LayerNorm.' },
    { id: 'tf.residual', name: 'Residual stream', kind: 'atom', zone: 'The residual spine', x: 620, y: 450,
      note: 'The shared highway running through every layer: attention and FFN outputs are added to it, never replace it.',
      role: 'carries the shared signal every block reads from and adds its output back onto' },
  ],
}

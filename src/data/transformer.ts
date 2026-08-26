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
    // the block is a two-part loop: communicate, then transform privately
    { t: 'line', pts: [245, 310, 292, 310, 292, 200, 304, 200], s: violet(0.45), lw: 2 },
    { t: 'line', pts: [548, 200, 585, 200], s: amber(0.45), lw: 2 },
    { t: 'line', pts: [810, 200, 846, 200, 846, 310, 862, 310], s: amber(0.45), lw: 2 },
    { t: 'text', x: 314, y: 78, text: '1 · TOKENS SHARE CONTEXT', size: 10, f: violet(0.72), lodMax: 2.5 },
    { t: 'text', x: 598, y: 78, text: '2 · EACH TOKEN TRANSFORMS IT', size: 10, f: amber(0.72), lodMax: 2.5 },
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
      art: [
        { t: 'line', pts: [350, 120, 470, 100, 520, 180, 490, 285], s: violet(0.28), lw: 1.6 },
        { t: 'line', pts: [355, 250, 470, 100], s: violet(0.22), lw: 1.2, dash: [5, 5] },
      ],
      note: 'The block where tokens look at each other — the only place information moves between positions.',
    },
    { id: 'tf.qkv', name: 'Q / K / V projections', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 350, y: 120,
      note: 'Learned projections give each position queries, keys, and values. “Question, label, and cargo” is an intuition for the math; any “France is ___” match varies by head, layer, and model.' },
    { id: 'tf.scores', name: 'Attention scores', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 470, y: 100,
      note: 'Each query is dotted with eligible keys and softmaxed into weights that blend the values. A weight such as 0.61 on “France” is an illustration, not a universal measured value.' },
    { id: 'tf.heads', name: 'Multi-head / GQA', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 520, y: 180,
      note: 'Attention runs many times in parallel with small heads; GQA shares one K/V group across several query heads to shrink the KV cache.' },
    { id: 'tf.kvcache', name: 'KV cache', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 355, y: 250,
      note: 'Stores every past token’s keys and values so generation never recomputes them — the reason long contexts eat GPU memory.',
      role: 'stores past tokens’ keys and values so decode never recomputes them' },
    { id: 'tf.oproj', name: 'Output projection', kind: 'atom', parent: 'tf.attn', zone: 'Attention', x: 490, y: 285,
      note: 'Mixes all the heads’ answers back into one vector that gets added onto the residual stream.' },

    {
      id: 'tf.ffn', name: 'Per-token transformation (FFN)', kind: 'container', zone: 'Feed-forward',
      x: 700, y: 195, w: 220, h: 290,
      art: [
        { t: 'line', pts: [640, 130, 700, 210, 762, 130], s: amber(0.32), lw: 1.8 },
        { t: 'line', pts: [700, 210, 700, 300], s: amber(0.2), lw: 1.2, dash: [5, 5] },
      ],
      note: 'Every position goes through the same private transformation. The layer first expands the vector, uses a nonlinear gate to reshape combinations, compresses the result, and adds that update back to the position’s running state.',
    },
    { id: 'tf.up', name: 'Up projection', kind: 'atom', parent: 'tf.ffn', zone: 'Feed-forward', x: 640, y: 130,
      note: 'A learned matrix turns the token’s current vector into a wider temporary vector. The extra width gives the network room to form many feature combinations before it creates an update.' },
    { id: 'tf.act', name: 'SwiGLU activation', kind: 'atom', parent: 'tf.ffn', zone: 'Feed-forward', x: 700, y: 210,
      note: 'Two learned branches are combined: one proposes feature values and a smooth gate controls their strength. The values are continuous, not a row of hard yes/no switches.' },
    { id: 'tf.down', name: 'Down projection', kind: 'atom', parent: 'tf.ffn', zone: 'Feed-forward', x: 762, y: 130,
      note: 'Another learned matrix compresses the wide temporary result to the model’s normal width, producing the update that will be added to this token position.' },
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
      note: 'Temperature rescales logits; filters such as top-p can trim candidates; softmax produces a distribution from which the next token is sampled—or greedily selected.',
      role: 'turns logits into probabilities and draws the next token' },

    { id: 'tf.norm', name: 'RMSNorm', kind: 'atom', zone: 'The residual spine', x: 420, y: 450,
      note: 'RMSNorm rescales by root-mean-square magnitude without subtracting the mean. Many modern decoder models use it before each sub-block to stabilize training.' },
    { id: 'tf.residual', name: 'Residual stream', kind: 'atom', zone: 'The residual spine', x: 620, y: 450,
      note: 'The shared highway running through every layer: attention and FFN outputs are added to it, never replace it.',
      role: 'carries the shared signal every block reads from and adds its output back onto' },
  ],
}

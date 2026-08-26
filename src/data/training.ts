import type { ModuleDef, Shape } from '../types'

// The training story, told through one example. The corpus contains
// "…the capital of France is Paris." — watch the model read it, guess,
// get scored, and have every weight nudged (blue = forward, red = the
// gradient flowing back). Post-training runs a preference vignette, and
// the machinery below averages that same gradient across thousands of GPUs.

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const emerald = (a: number) => `hsla(152,65%,55%,${a})`
const rose = (a: number) => `hsla(340,75%,65%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`
const ink = 'rgba(226,232,240,0.9)'

// ---- pretraining: one example, forward and back --------------------------
const preArt: Shape[] = [
  // the only chart that matters for months: loss going down
  { t: 'line', pts: [100, 100, 240, 100], s: slate(0.35), lw: 1 },
  { t: 'line', pts: [100, 62, 100, 100], s: slate(0.35), lw: 1 },
  { t: 'line', pts: [100, 66, 135, 76, 170, 84, 205, 90, 240, 95], s: sky(0.7), lw: 1.5 },
  { t: 'text', x: 106, y: 58, text: 'loss ↓ over trillions of tokens', size: 6, f: slate(0.6), lod: 1.15 },
  // one document from the corpus
  { t: 'rect', x: 70, y: 140, w: 36, h: 46, r: 2, f: slate(0.08), s: slate(0.4), lw: 1 },
  ...Array.from({ length: 5 }, (_, i): Shape => (
    { t: 'line', pts: [75, 148 + i * 8, 101, 148 + i * 8], s: slate(0.35), lw: 1 }
  )),
  // the example sentence, target highlighted
  { t: 'line', pts: [108, 163, 118, 163], s: sky(0.5), lw: 1.2 },
  { t: 'rect', x: 120, y: 155, w: 152, h: 16, r: 3, f: sky(0.08), s: sky(0.4), lw: 0.9 },
  { t: 'text', x: 188, y: 163, text: '…France is', size: 5.8, f: ink, align: 'center', mono: true },
  { t: 'rect', x: 226, y: 157, w: 42, h: 12, r: 2, f: emerald(0.2), s: emerald(0.5), lw: 0.8 },
  { t: 'text', x: 247, y: 163, text: 'Paris', size: 5.8, f: emerald(0.95), align: 'center', mono: true },
  { t: 'text', x: 196, y: 146, text: 'truth (hidden from the model)', size: 4.8, f: emerald(0.6), lod: 1.3 },
  // forward into the model, prediction comes out
  { t: 'line', pts: [274, 163, 302, 163], s: sky(0.6), lw: 1.4 },
  { t: 'rect', x: 304, y: 147, w: 46, h: 32, r: 4, f: amber(0.12), s: amber(0.5), lw: 1.2 },
  { t: 'text', x: 327, y: 163, text: 'model', size: 6, f: ink, align: 'center' },
  { t: 'text', x: 358, y: 148, text: 'Paris', size: 5, f: ink, mono: true, lod: 1.2 },
  { t: 'rect', x: 384, y: 145, w: 26, h: 5, r: 1, f: emerald(0.7), lod: 1.2 },
  { t: 'text', x: 358, y: 158, text: 'Lyon', size: 5, f: ink, mono: true, lod: 1.2 },
  { t: 'rect', x: 384, y: 155, w: 19, h: 5, r: 1, f: slate(0.45), lod: 1.2 },
  { t: 'text', x: 358, y: 168, text: 'the', size: 5, f: ink, mono: true, lod: 1.2 },
  { t: 'rect', x: 384, y: 165, w: 7, h: 5, r: 1, f: slate(0.45), lod: 1.2 },
  { t: 'text', x: 358, y: 179, text: '0.42 · 0.31 · 0.08', size: 4.6, f: slate(0.6), mono: true, lod: 1.35 },
  // the score
  { t: 'text', x: 300, y: 200, text: 'loss = −log 0.42 ≈ 0.87', size: 5.8, f: rose(0.85), mono: true },
  // gradients flow BACK
  { t: 'line', pts: [390, 216, 120, 216], s: rose(0.5), lw: 1.3, dash: [5, 4] },
  { t: 'line', pts: [128, 212, 118, 216, 128, 220], s: rose(0.5), lw: 1.3 },
  { t: 'text', x: 130, y: 250, text: 'gradients: "which way makes Paris likelier?"', size: 5.2, f: rose(0.7), lod: 1.15 },
  { t: 'text', x: 130, y: 262, text: 'every weight nudged: w −= lr · g', size: 5.2, f: slate(0.65), lod: 1.15 },
  // the LR schedule, drawn
  { t: 'line', pts: [100, 305, 250, 305], s: slate(0.3), lw: 1 },
  { t: 'line', pts: [102, 303, 112, 272, 150, 278, 200, 290, 248, 302], s: amber(0.6), lw: 1.4 },
  { t: 'text', x: 118, y: 316, text: 'warmup → cruise → cool', size: 5, f: slate(0.6), lod: 1.25 },
]

// ---- post-training: one preference ---------------------------------------
const postArt: Shape[] = [
  { t: 'rect', x: 490, y: 160, w: 118, h: 15, r: 3, f: slate(0.1), s: slate(0.35), lw: 0.9 },
  { t: 'text', x: 549, y: 167.5, text: '"explain photosynthesis"', size: 5.4, f: ink, align: 'center', mono: true },
  { t: 'line', pts: [610, 167, 622, 167], s: slate(0.4), lw: 1 },
  { t: 'rect', x: 626, y: 156, w: 62, h: 22, r: 3, f: emerald(0.1), s: emerald(0.45), lw: 1 },
  { t: 'text', x: 657, y: 167, text: 'A: clear ✓', size: 5.2, f: emerald(0.9), align: 'center' },
  { t: 'rect', x: 694, y: 156, w: 62, h: 22, r: 3, f: slate(0.08), s: slate(0.35), lw: 1 },
  { t: 'text', x: 725, y: 167, text: 'B: rambling', size: 5.2, f: slate(0.7), align: 'center' },
  { t: 'text', x: 772, y: 167, text: 'A ≻ B', size: 7, f: amber(0.9), mono: true },
  { t: 'line', pts: [770, 178, 630, 236], s: amber(0.4), lw: 1.1, dash: [4, 4] },
  { t: 'text', x: 700, y: 212, text: 'preferences train the judge ↓', size: 5, f: amber(0.6), lod: 1.25 },
]

// ---- distributed: the same gradient, everywhere --------------------------
const distArt: Shape[] = [
  // one global step assembled from several ways of splitting the work
  { t: 'line', pts: [170, 510, 244, 510], s: sky(0.35), lw: 1.6 },
  { t: 'line', pts: [294, 510, 356, 510], s: sky(0.35), lw: 1.6 },
  { t: 'line', pts: [430, 510, 490, 510, 490, 560, 835, 560, 835, 520], s: amber(0.3), lw: 1.5, dash: [6, 5] },
  { t: 'text', x: 500, y: 440, text: 'SPLIT THE WORK · RECOMBINE ONE UPDATE', size: 10, f: amber(0.72), align: 'center', lodMax: 2.5 },
  ...Array.from({ length: 3 }, (_, i): Shape => (
    { t: 'rect', x: 126 + i * 18, y: 500, w: 14, h: 20, r: 2, f: sky(0.35), s: sky(0.5), lw: 0.8, lod: 1.25 }
  )),
  { t: 'text', x: 150, y: 535, text: 'copies', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
  { t: 'rect', x: 246, y: 500, w: 48, h: 20, r: 2, s: sky(0.5), lw: 0.8, lod: 1.25 },
  { t: 'line', pts: [262, 500, 262, 520], s: sky(0.5), lw: 0.8, lod: 1.25 },
  { t: 'line', pts: [278, 500, 278, 520], s: sky(0.5), lw: 0.8, lod: 1.25 },
  { t: 'text', x: 270, y: 535, text: 'sliced matrices', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
  ...Array.from({ length: 3 }, (_, i): Shape => (
    { t: 'rect', x: 358 + i * 24, y: 500, w: 16, h: 20, r: 2, f: sky(0.2), s: sky(0.5), lw: 0.8, lod: 1.25 }
  )),
  { t: 'line', pts: [375, 510, 381, 510], s: slate(0.6), lw: 1, lod: 1.25 },
  { t: 'line', pts: [399, 510, 405, 510], s: slate(0.6), lw: 1, lod: 1.25 },
  { t: 'text', x: 390, y: 535, text: 'stages', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
  { t: 'circle', cx: 870, cy: 512, r: 17, s: amber(0.5), lw: 1.2, lod: 1.25 },
  ...Array.from({ length: 4 }, (_, i): Shape => (
    { t: 'circle', cx: 870 + 17 * Math.cos((i * Math.PI) / 2), cy: 512 + 17 * Math.sin((i * Math.PI) / 2), r: 3.5, f: amber(0.7), lod: 1.25 }
  )),
  { t: 'text', x: 870, y: 545, text: 'gradients circle the ring', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
]

export const training: ModuleDef = {
  id: 'training',
  title: 'The Training Pipeline',
  tagline: 'One example — "…France is Paris" — guessed, scored, and turned into a nudge on every weight, averaged across thousands of GPUs.',
  world: { w: 1000, h: 620 },
  flows: [
    // forward (blue) and the gradient flowing back (red)
    { pts: [110, 163, 300, 163], color: sky(0.75), n: 3, speed: 70, size: 2.2 },
    { pts: [390, 216, 122, 216], color: rose(0.75), n: 3, speed: 70, size: 2.2 },
    // gradients circling the all-reduce ring
    { pts: [887, 512, 870, 529, 853, 512, 870, 495, 887, 512], color: amber(0.8), n: 3, speed: 40, size: 2 },
  ],
  items: [
    {
      id: 'tr.pre', name: 'Pretraining', kind: 'container', zone: 'The model’s life',
      x: 240, y: 190, w: 360, h: 280, art: preArt,
      note: 'Watch one training position: the corpus says “…France is Paris.” The model predicts, gets scored, and gradients flow backward. Frontier pretraining repeats this pattern across trillions of token positions.',
    },
    { id: 'tr.data', name: 'Data curation', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 88, y: 163, hitR: 25, lalign: 'right' as const,
      note: 'The corpus: trillions of tokens of filtered, deduplicated text. Our sentence is one line in one document among billions — its quality is why curation matters.' },
    { id: 'tr.ntp', name: 'Next-token prediction', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 327, y: 163, hitR: 28, ldy: -26,
      note: 'In this illustration the model reads “…capital of France is” and assigns Paris 0.42, Lyon 0.31. The observed next token is “ Paris”; the gap between its probability and certainty creates the learning signal.',
      role: 'asks the model to guess the next token — pretraining’s only objective' },
    { id: 'tr.xent', name: 'Cross-entropy loss', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 300, y: 200, hitR: 40, ldy: 24,
      note: 'loss = −log P(truth) = −log 0.42 ≈ 0.87. Total confidence would score 0. The entire months-long run exists to push this one number down.' },
    { id: 'tr.backprop', name: 'Backpropagation', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 200, y: 216, hitR: 55, ldy: -30,
      note: 'The red path: the loss is unwound backwards through every layer, asking each weight "which way would have made Paris more likely?" — that answer is its gradient.',
      role: 'carries the correction backwards through every layer' },
    { id: 'tr.adamw', name: 'AdamW', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 160, y: 240, hitR: 40, ldy: 16,
      note: 'AdamW combines each gradient with running first- and second-moment estimates, applies weight decay, and updates the parameter. Those moment buffers—and often master weights—create a large memory bill.' },
    { id: 'tr.scaling', name: 'Scaling laws', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 170, y: 82, hitR: 50,
      note: 'Average loss often follows empirical scaling curves as compute, data, and parameters grow. Chinchilla found roughly 20 training tokens per parameter under its compute-optimal setup; it is a landmark result, not a universal law.' },
    { id: 'tr.lr', name: 'LR schedule', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 175, y: 290, hitR: 45,
      note: 'The learning-rate schedule controls update size over time: typically a warmup followed by decay. A poor schedule can destabilize training or leave expensive compute underused.' },

    {
      id: 'tr.post', name: 'Post-training', kind: 'container', zone: 'The model’s life',
      x: 720, y: 190, w: 480, h: 280, art: postArt,
      note: 'Pretraining builds broad prediction ability; post-training shapes useful behavior. Demonstrations, human or AI preferences, critiques, and verifiable outcomes can all become supervision.',
    },
    { id: 'tr.sft', name: 'SFT', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 540, y: 120,
      note: 'Step one: fine-tune on curated prompt→response demonstrations — same loss as pretraining, but the "corpus" is now examples of being helpful.',
      role: 'fine-tunes on curated demonstrations to teach instruction-following' },
    { id: 'tr.rlhf', name: 'RLHF', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 680, y: 120,
      note: 'The classic umbrella recipe: collect A≻B preferences, fit a reward model, then optimize the policy against that learned judge while controlling drift.' },
    { id: 'tr.dpo', name: 'DPO', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 820, y: 120,
      note: 'The shortcut: skip the judge entirely — a loss that pushes answer A up and answer B down, directly on the preference pairs.',
      role: 'learns from preference pairs directly, with no reward model and no RL loop' },
    { id: 'tr.distill', name: 'Distillation', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 920, y: 185,
      note: 'A small student trains on a big teacher’s outputs, inheriting much of its behavior at a fraction of the serving cost.' },
    { id: 'tr.rm', name: 'Reward model', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 600, y: 245,
      note: 'The judge: trained on the A≻B choices above to score any response. From here on, the policy learns to please it — for better and for worse.' },
    { id: 'tr.ppo', name: 'PPO', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 700, y: 245,
      note: 'RLHF’s classic optimizer: chase the judge’s score, but clip each update so the model never drifts too far from the last version in one step.' },
    { id: 'tr.cai', name: 'Constitutional AI / RLAIF', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 805, y: 245,
      note: 'Scale the choosing itself: the model critiques and revises its own outputs against written principles — AI feedback replacing most human labels.' },
    { id: 'tr.rlvr', name: 'RLVR', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 905, y: 290,
      note: 'Swap the learned judge for a reliable checker in domains such as math or code. Verifiable rewards are an important ingredient in many reasoning-oriented training recipes, but not the whole system.',
      role: 'uses checkable outcomes such as passing tests as a reward signal' },

    {
      id: 'tr.dist', name: 'Distributed training', kind: 'container', zone: 'The machinery',
      x: 500, y: 480, w: 880, h: 200, art: distArt,
      note: 'Our example’s gradient was computed on one GPU — alongside thousands of GPUs doing the same for their own examples, all merged into one step. These are the ways to split it.',
    },
    { id: 'tr.dp', name: 'Data parallelism', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 150, y: 460,
      note: 'Full model replicas process different examples, then their gradients are combined. The illustration uses thousands of workers; the actual degree is chosen for model size, batch, and network.' },
    { id: 'tr.tp', name: 'Tensor parallelism', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 270, y: 460, ldy: 20,
      note: 'Splits individual weight matrices across GPUs — so chatty it only works over NVLink inside one scale-up domain.' },
    { id: 'tr.pp', name: 'Pipeline parallelism', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 390, y: 460,
      note: 'Different GPUs own different layers; micro-batches march through like an assembly line to keep every stage busy.' },
    { id: 'tr.fsdp', name: 'FSDP / ZeRO', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 510, y: 460, ldy: 20,
      note: 'Shards parameters, gradients and optimizer state across GPUs, gathering each layer just in time — data parallelism without the memory bill.' },
    { id: 'tr.bf16', name: 'Mixed precision (BF16)', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 630, y: 460,
      note: 'Use lower precision for much of the forward and backward math while preserving selected state at higher precision. This can cut memory and raise throughput while maintaining training stability.' },
    { id: 'tr.ckpt', name: 'Gradient checkpointing', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 750, y: 460, ldy: 20,
      note: 'Save fewer forward activations and recompute them during backward. It trades extra arithmetic for lower memory, with the exact overhead set by the checkpointing strategy.' },
    { id: 'tr.allreduce', name: 'All-reduce', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 870, y: 460,
      note: 'The merge: every GPU’s gradients circle the ring and sum, so all copies step identically — the traffic pattern training networks are built for.',
      role: 'averages gradients across every GPU at each training step' },
  ],
}

import type { ModuleDef } from '../types'

// Layout: the model's life story runs left → right (pretraining → post-training),
// with the distributed-systems machinery that powers both spanning the bottom.
const sky = (a: number) => `hsla(199,90%,65%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`

export const training: ModuleDef = {
  id: 'training',
  title: 'The Training Pipeline',
  tagline: 'From a pile of text to a helpful model: pretraining, post-training, and the machinery underneath.',
  world: { w: 1000, h: 620 },
  art: [
    // the only chart that matters for months: loss going down
    { t: 'line', pts: [100, 105, 400, 105], s: slate(0.35), lw: 1 },
    { t: 'line', pts: [100, 62, 100, 105], s: slate(0.35), lw: 1 },
    { t: 'line', pts: [100, 68, 150, 80, 200, 88, 260, 94, 330, 99, 400, 102], s: sky(0.7), lw: 1.5 },
    { t: 'text', x: 108, y: 66, text: 'loss, over trillions of tokens', size: 7.5, f: slate(0.6), lod: 1.15 },
    // how one step is split: copies (DP), slices (TP), stages (PP), a ring (all-reduce)
    ...Array.from({ length: 3 }, (_, i) => (
      { t: 'rect' as const, x: 126 + i * 18, y: 500, w: 14, h: 20, r: 2, f: sky(0.35), s: sky(0.5), lw: 0.8, lod: 1.25 }
    )),
    { t: 'text', x: 150, y: 535, text: 'copies', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
    { t: 'rect', x: 246, y: 500, w: 48, h: 20, r: 2, s: sky(0.5), lw: 0.8, lod: 1.25 },
    { t: 'line', pts: [262, 500, 262, 520], s: sky(0.5), lw: 0.8, lod: 1.25 },
    { t: 'line', pts: [278, 500, 278, 520], s: sky(0.5), lw: 0.8, lod: 1.25 },
    { t: 'text', x: 270, y: 535, text: 'sliced matrices', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
    ...Array.from({ length: 3 }, (_, i) => (
      { t: 'rect' as const, x: 358 + i * 24, y: 500, w: 16, h: 20, r: 2, f: sky(0.2), s: sky(0.5), lw: 0.8, lod: 1.25 }
    )),
    { t: 'line', pts: [375, 510, 381, 510], s: slate(0.6), lw: 1, lod: 1.25 },
    { t: 'line', pts: [399, 510, 405, 510], s: slate(0.6), lw: 1, lod: 1.25 },
    { t: 'text', x: 390, y: 535, text: 'stages', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
    // the all-reduce ring
    { t: 'circle', cx: 870, cy: 512, r: 17, s: amber(0.5), lw: 1.2, lod: 1.25 },
    ...Array.from({ length: 4 }, (_, i) => (
      { t: 'circle' as const, cx: 870 + 17 * Math.cos((i * Math.PI) / 2), cy: 512 + 17 * Math.sin((i * Math.PI) / 2), r: 3.5, f: amber(0.7), lod: 1.25 }
    )),
    { t: 'text', x: 870, y: 545, text: 'gradients circle the ring', size: 7, f: slate(0.6), align: 'center', lod: 1.25 },
  ],
  flows: [
    { pts: [887, 512, 870, 529, 853, 512, 870, 495, 887, 512], color: amber(0.8), n: 3, speed: 40, size: 2 },
  ],
  items: [
    {
      id: 'tr.pre', name: 'Pretraining', kind: 'container', zone: 'The model’s life',
      x: 240, y: 190, w: 360, h: 280,
      note: 'Months of next-token prediction over trillions of tokens — where all the raw capability comes from.',
    },
    { id: 'tr.data', name: 'Data curation', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 150, y: 130,
      note: 'Filtering, deduplicating and mixing the corpus — quietly one of the biggest levers on final model quality.' },
    { id: 'tr.ntp', name: 'Next-token prediction', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 330, y: 130,
      note: 'The whole objective: given everything so far, guess the next token — repeated over 10+ trillion tokens. Every capability we observe is a side effect of doing this well.',
      role: 'asks the model to guess the next token — pretraining’s only objective' },
    { id: 'tr.scaling', name: 'Scaling laws', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 240, y: 195,
      note: 'Loss falls predictably with compute, data and parameters — Chinchilla’s famous ratio: about 20 training tokens per parameter. The curves tell you how big to build before you build.' },
    { id: 'tr.xent', name: 'Cross-entropy loss', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 150, y: 265,
      note: 'The penalty for putting low probability on the true next token — the number the whole run exists to push down.' },
    { id: 'tr.adamw', name: 'AdamW', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 255, y: 265,
      note: 'The default optimizer: per-parameter adaptive steps plus decoupled weight decay — and two extra copies of every parameter in memory.' },
    { id: 'tr.lr', name: 'LR schedule', kind: 'atom', parent: 'tr.pre', zone: 'The model’s life', x: 355, y: 265,
      note: 'Warm up gently, cruise, then cool down — get the decay wrong and the last 10% of a months-long run is wasted.' },

    {
      id: 'tr.post', name: 'Post-training', kind: 'container', zone: 'The model’s life',
      x: 720, y: 190, w: 480, h: 280,
      note: 'The short, cheap phase that turns a raw text predictor into an assistant — teaching behavior, not knowledge.',
    },
    { id: 'tr.sft', name: 'SFT', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 540, y: 120,
      note: 'Supervised fine-tuning on curated prompt→response pairs — teaches the format and voice of being helpful before any RL starts.',
      role: 'fine-tunes on curated demonstrations to teach instruction-following' },
    { id: 'tr.rlhf', name: 'RLHF', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 680, y: 120,
      note: 'The umbrella recipe: collect human preferences, fit a reward model to them, then optimize the policy against that reward.' },
    { id: 'tr.dpo', name: 'DPO', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 820, y: 120,
      note: 'Skips the reward model entirely: a simple loss pushes the chosen response up and the rejected one down, directly on preference pairs.',
      role: 'learns from preference pairs directly, with no reward model and no RL loop' },
    { id: 'tr.distill', name: 'Distillation', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 920, y: 185,
      note: 'A small student trains on a big teacher’s outputs, inheriting much of its behavior at a fraction of the serving cost.' },
    { id: 'tr.rm', name: 'Reward model', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 600, y: 245,
      note: 'A model trained on human preference comparisons to output a score — the judge the policy learns to please.' },
    { id: 'tr.ppo', name: 'PPO', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 700, y: 245,
      note: 'RLHF’s classic optimizer: clips each policy update so the model never drifts too far from the last version in one step.' },
    { id: 'tr.cai', name: 'Constitutional AI / RLAIF', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 805, y: 245,
      note: 'The model critiques and revises its own outputs against written principles — AI feedback replacing most of the human labeling.' },
    { id: 'tr.rlvr', name: 'RLVR', kind: 'atom', parent: 'tr.post', zone: 'The model’s life', x: 905, y: 290,
      note: 'RL with verifiable rewards: math and code where a checker, not a learned judge, says right or wrong — the engine behind reasoning models.',
      role: 'uses checkable rewards like passing tests — the recipe behind reasoning models' },

    {
      id: 'tr.dist', name: 'Distributed training', kind: 'container', zone: 'The machinery',
      x: 500, y: 480, w: 880, h: 200,
      note: 'No single chip can hold or train a frontier model — these are the ways one training step is split across thousands of GPUs.',
    },
    { id: 'tr.dp', name: 'Data parallelism', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 150, y: 460,
      note: 'Every GPU holds the full model but sees a different slice of the batch; gradients are averaged each step.' },
    { id: 'tr.tp', name: 'Tensor parallelism', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 270, y: 460,
      note: 'Splits individual weight matrices across GPUs — so chatty it only works over the fastest links inside one server.' },
    { id: 'tr.pp', name: 'Pipeline parallelism', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 390, y: 460,
      note: 'Different GPUs own different layers; micro-batches march through like an assembly line to keep every stage busy.' },
    { id: 'tr.fsdp', name: 'FSDP / ZeRO', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 510, y: 460,
      note: 'Shards parameters, gradients and optimizer state across GPUs, gathering each layer just in time — data parallelism without the memory bill.' },
    { id: 'tr.bf16', name: 'Mixed precision (BF16)', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 630, y: 460,
      note: 'Compute in 16-bit, keep a 32-bit master copy of the weights — half the memory and twice the speed for almost no accuracy loss.' },
    { id: 'tr.ckpt', name: 'Gradient checkpointing', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 750, y: 460,
      note: 'Throw away activations after the forward pass and recompute them during backward — trading ~30% more compute for huge memory savings.' },
    { id: 'tr.allreduce', name: 'All-reduce', kind: 'atom', parent: 'tr.dist', zone: 'The machinery', x: 870, y: 460,
      note: 'The collective that sums gradients across every GPU each step — the traffic pattern training networks are designed around.',
      role: 'averages gradients across every GPU at each training step' },
  ],
}

import type { ModuleDef } from '../types'

// Layout: the request's timeline runs along the top (prefill → decode),
// speculative decoding hangs off decode's output, and the serving-level
// optimizations sit underneath the whole pipeline.
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const emerald = (a: number) => `hsla(152,65%,55%,${a})`
const sky = (a: number) => `hsla(199,90%,65%,${a})`
const rose = (a: number) => `hsla(340,75%,65%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`

export const inference: ModuleDef = {
  id: 'inference',
  title: 'The Inference Stack',
  tagline: 'What actually happens between hitting enter and tokens streaming back.',
  world: { w: 1000, h: 620 },
  art: [
    // speculative decoding racetrack: draft lane vs verify lane
    { t: 'line', pts: [745, 445, 955, 445], s: sky(0.3), lw: 1 },
    { t: 'line', pts: [745, 465, 955, 465], s: emerald(0.3), lw: 1 },
    { t: 'text', x: 748, y: 435, text: 'draft: guess…', size: 7, f: sky(0.7), lod: 1.25 },
    { t: 'text', x: 748, y: 477, text: 'target: verify all at once', size: 7, f: emerald(0.7), lod: 1.25 },
    { t: 'text', x: 862, y: 490, text: '✓ ✓ ✓ ✗', size: 9, f: emerald(0.8), lod: 1.25, mono: true },
    // continuous batching: requests of different lengths sharing the GPU
    ...Array.from({ length: 4 }, (_, i) => (
      { t: 'rect' as const, x: 120, y: 378 + i * 9, w: [82, 44, 64, 28][i], h: 6, r: 2, f: [amber(0.5), sky(0.5), rose(0.45), emerald(0.5)][i], lod: 1.3 }
    )),
    { t: 'line', pts: [104, 405, 118, 399], s: emerald(0.7), lw: 1.3, lod: 1.3 },
    { t: 'text', x: 96, y: 412, text: 'new request hops in', size: 6.5, f: slate(0.6), lod: 1.3 },
  ],
  flows: [
    // draft tokens sprint ahead; the target model verifies in one slow pass
    { pts: [745, 445, 955, 445], color: sky(0.85), n: 4, speed: 120, size: 2.2 },
    { pts: [745, 465, 955, 465], color: emerald(0.9), n: 1, speed: 45, size: 3.5 },
  ],
  items: [
    {
      id: 'inf.prefill', name: 'Prefill', kind: 'container', zone: 'The two phases',
      x: 210, y: 170, w: 300, h: 240,
      note: 'Phase one: the entire prompt runs through the model as one big parallel pass — compute-bound, and it sets how long you wait for the first token.',
      role: 'processes the whole prompt in one parallel, compute-bound pass',
    },
    { id: 'inf.ptok', name: 'Prompt tokenization', kind: 'atom', parent: 'inf.prefill', zone: 'The two phases', x: 130, y: 115,
      note: 'The prompt becomes token IDs before anything else — context limits are counted in these, not characters.' },
    { id: 'inf.ttft', name: 'Time to first token', kind: 'atom', parent: 'inf.prefill', zone: 'The two phases', x: 295, y: 115,
      note: 'The latency metric prefill controls: how long the user stares at nothing. Long prompts make it grow roughly linearly.' },
    { id: 'inf.prefix', name: 'Prefix caching', kind: 'atom', parent: 'inf.prefill', zone: 'The two phases', x: 135, y: 230,
      note: 'If many requests share an opening (like a system prompt), its KV cache is computed once and reused — that prefix’s prefill becomes free.' },
    { id: 'inf.chunked', name: 'Chunked prefill', kind: 'atom', parent: 'inf.prefill', zone: 'The two phases', x: 295, y: 230,
      note: 'Slices a huge prompt into chunks interleaved with other users’ decode steps, so one long document doesn’t freeze everyone’s tokens.' },

    {
      id: 'inf.decode', name: 'Decode', kind: 'container', zone: 'The two phases',
      x: 600, y: 170, w: 340, h: 240,
      note: 'Phase two: one token per forward pass, forever. Every step re-reads all the weights, so decode speed is set by memory bandwidth, not FLOPs.',
      role: 'emits one token per pass, limited by memory bandwidth',
    },
    { id: 'inf.autoreg', name: 'Autoregressive loop', kind: 'atom', parent: 'inf.decode', zone: 'The two phases', x: 500, y: 115,
      note: 'Each new token is appended to the sequence and fed back in — the loop that makes generation inherently sequential.' },
    { id: 'inf.wstream', name: 'Weight streaming', kind: 'atom', parent: 'inf.decode', zone: 'The two phases', x: 700, y: 115,
      note: 'To produce a single token, every weight must travel from HBM into the compute units — billions of bytes moved per token.' },
    { id: 'inf.kvgrow', name: 'KV cache growth', kind: 'atom', parent: 'inf.decode', zone: 'The two phases', x: 500, y: 230,
      note: 'The cache grows with every generated token; batch size × context length decides whether it still fits in GPU memory.' },
    { id: 'inf.tpot', name: 'Inter-token latency', kind: 'atom', parent: 'inf.decode', zone: 'The two phases', x: 700, y: 230,
      note: 'The steady rhythm of tokens after the first one — the metric decode controls, and what "tokens per second" usually means.' },

    {
      id: 'inf.spec', name: 'Speculative decoding', kind: 'container', zone: 'Going faster',
      x: 850, y: 430, w: 260, h: 280,
      note: 'The trick that breaks one-token-at-a-time: a small model guesses several tokens, the big model verifies them in one pass — typically 2–3× faster with identical output.',
      role: 'lets a cheap model guess ahead and the big model verify the guesses',
    },
    { id: 'inf.draft', name: 'Draft model', kind: 'atom', parent: 'inf.spec', zone: 'Going faster', x: 790, y: 380,
      note: 'The small, fast guesser. It must agree with the target model often, or its guesses get thrown away and you gain nothing.' },
    { id: 'inf.verify', name: 'Verification pass', kind: 'atom', parent: 'inf.spec', zone: 'Going faster', x: 915, y: 380,
      note: 'The target model scores all drafted tokens in one parallel pass; rejection sampling keeps the output distribution exactly the big model’s.' },
    { id: 'inf.accept', name: 'Acceptance rate', kind: 'atom', parent: 'inf.spec', zone: 'Going faster', x: 850, y: 500,
      note: 'The fraction of drafted tokens the big model keeps — the single number that decides whether speculation pays off.' },

    {
      id: 'inf.opt', name: 'Serving optimizations', kind: 'container', zone: 'Going faster',
      x: 330, y: 460, w: 500, h: 220,
      note: 'The systems layer that turns one model into a service for thousands of simultaneous users.',
    },
    { id: 'inf.contbatch', name: 'Continuous batching', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 170, y: 415,
      note: 'New requests hop into the running batch the moment any sequence finishes, instead of waiting for the whole batch to drain.' },
    { id: 'inf.paged', name: 'PagedAttention', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 330, y: 415,
      note: 'Manages KV cache like an OS manages virtual memory — fixed-size pages instead of big reserved slabs. Before vLLM introduced it, most KV memory was simply wasted to fragmentation.',
      role: 'manages the KV cache in pages the way an OS manages virtual memory' },
    { id: 'inf.flash', name: 'FlashAttention', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 490, y: 415,
      note: 'Computes attention tile-by-tile inside on-chip SRAM, never writing the full attention matrix to HBM — 2–4× faster and memory that grows linearly, not quadratically.' },
    { id: 'inf.quant', name: 'Quantization (FP8/INT4)', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 250, y: 520,
      note: 'Stores weights (and sometimes KV) in fewer bits — FP8 halves and INT4 quarters the bytes streamed per token, which is why it speeds up bandwidth-bound decode almost linearly.' },
    { id: 'inf.disagg', name: 'Disaggregated serving', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 420, y: 520,
      note: 'Runs prefill and decode on separate GPU pools, so the compute-heavy and bandwidth-heavy phases each get hardware shaped for them.' },
  ],
}

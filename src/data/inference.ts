import type { ModuleDef } from '../types'

// Layout: the request's timeline runs along the top (prefill → decode),
// speculative decoding hangs off decode's output, and the serving-level
// optimizations sit underneath the whole pipeline.
export const inference: ModuleDef = {
  id: 'inference',
  title: 'The Inference Stack',
  tagline: 'What actually happens between hitting enter and tokens streaming back.',
  world: { w: 1000, h: 620 },
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
      note: 'The trick that breaks one-token-at-a-time: guess several tokens cheaply, then verify them all in a single pass of the big model.',
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
      note: 'Manages KV cache like an OS manages virtual memory — fixed-size pages, no fragmentation, far more sequences per GPU.',
      role: 'manages the KV cache in pages the way an OS manages virtual memory' },
    { id: 'inf.flash', name: 'FlashAttention', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 490, y: 415,
      note: 'Computes attention tile-by-tile inside on-chip SRAM, never writing the full attention matrix out to HBM.' },
    { id: 'inf.quant', name: 'Quantization (FP8/INT4)', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 250, y: 520,
      note: 'Stores weights (and sometimes KV) in fewer bits — fewer bytes to stream makes bandwidth-bound decode directly faster.' },
    { id: 'inf.disagg', name: 'Disaggregated serving', kind: 'atom', parent: 'inf.opt', zone: 'Going faster', x: 420, y: 520,
      note: 'Runs prefill and decode on separate GPU pools, so the compute-heavy and bandwidth-heavy phases each get hardware shaped for them.' },
  ],
}

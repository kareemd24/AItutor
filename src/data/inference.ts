import type { ModuleDef, Shape } from '../types'

// The serving story, told through one worker's timetable. Your request — the
// same "The capital of France is" from The Journey of a Token — shares the
// GPU with Alice's haiku and Bob's 100k-token PDF. Rows are users; solid
// blocks are prefill; ticks are decode, one token each. A paged KV board
// shows whose memory is whose, and the speculative-decoding racetrack runs
// on the same France example.

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const emerald = (a: number) => `hsla(152,65%,55%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`
const ink = 'rgba(226,232,240,0.9)'

const ticks = (x0: number, x1: number, y: number, color: string): Shape[] => {
  const out: Shape[] = []
  for (let x = x0; x <= x1; x += 12) out.push({ t: 'rect', x, y, w: 5, h: 11, r: 1, f: color })
  return out
}

// deterministic ownership pattern for the KV page board
const pageOwner = (i: number): string => {
  const seq = 'BBFYBBDBFBYBBDBFBBAYBBDFBBABYBDBBFABBDBYBFBABDBBYBFBABDBBFBYBADBBFBBDBA'
  return seq[i % seq.length]
}

const timelineArt: Shape[] = [
  // row labels
  { t: 'text', x: 38, y: 105, text: 'Alice · haiku', size: 6, f: violet(0.9), mono: true },
  { t: 'text', x: 38, y: 150, text: 'Bob · 100k PDF', size: 6, f: amber(0.9), mono: true },
  { t: 'text', x: 38, y: 195, text: 'You · France…', size: 6, f: sky(0.9), mono: true },
  // shared system-prompt prefix, pre-cached on every row
  { t: 'rect', x: 92, y: 98, w: 22, h: 14, r: 2, f: violet(0.18), s: violet(0.35), lw: 0.7 },
  { t: 'rect', x: 92, y: 143, w: 22, h: 14, r: 2, f: violet(0.18), s: violet(0.35), lw: 0.7 },
  { t: 'rect', x: 300, y: 188, w: 22, h: 14, r: 2, f: violet(0.18), s: violet(0.35), lw: 0.7 },
  { t: 'text', x: 103, y: 92, text: 'sys', size: 5, f: violet(0.6), align: 'center', lod: 1.5 },
  // ALICE: short prefill, decode ticks, done — then DANA takes her row
  { t: 'rect', x: 116, y: 98, w: 26, h: 14, r: 2, f: violet(0.55) },
  ...ticks(148, 376, 99.5, violet(0.55)),
  { t: 'text', x: 388, y: 105, text: '✓done', size: 5.5, f: violet(0.7), mono: true, lod: 1.3 },
  { t: 'text', x: 430, y: 86, text: 'Dana joins her slot ↓', size: 5.5, f: emerald(0.8), lod: 1.25 },
  { t: 'rect', x: 428, y: 98, w: 22, h: 14, r: 2, f: violet(0.18), s: violet(0.35), lw: 0.7 },
  { t: 'rect', x: 452, y: 98, w: 22, h: 14, r: 2, f: emerald(0.55) },
  ...ticks(478, 655, 99.5, emerald(0.55)),
  // BOB: a giant prefill, chunked so his blocks interleave with the batch
  ...Array.from({ length: 7 }, (_, i): Shape => (
    { t: 'rect', x: 116 + i * 78, y: 143, w: 44, h: 14, r: 2, f: amber(0.5) }
  )),
  { t: 'text', x: 588, y: 168, text: 'still prefilling…', size: 5.5, f: amber(0.7), lod: 1.25 },
  // YOU: arrive mid-timeline, one tiny prefill burst, then the drumbeat
  { t: 'text', x: 258, y: 176, text: 'you arrive', size: 5.5, f: sky(0.8), lod: 1.25 },
  { t: 'line', pts: [300, 180, 300, 186], s: sky(0.7), lw: 1.2 },
  { t: 'rect', x: 324, y: 188, w: 18, h: 14, r: 2, f: sky(0.7) },
  { t: 'line', pts: [345, 182, 345, 210], s: amber(0.85), lw: 1.5 },
  { t: 'text', x: 349, y: 184, text: 'TTFT', size: 5.5, f: amber(0.9), mono: true },
  ...ticks(350, 655, 189.5, sky(0.6)),
  { t: 'text', x: 352, y: 215, text: '·Paris', size: 5, f: sky(0.8), mono: true, lod: 1.35 },
  { t: 'text', x: 364, y: 224, text: '·.', size: 5, f: sky(0.6), mono: true, lod: 1.6 },
  // the time axis
  { t: 'line', pts: [92, 262, 660, 262], s: slate(0.35), lw: 1.2 },
  { t: 'line', pts: [652, 258, 660, 262, 652, 266], s: slate(0.35), lw: 1.2 },
  { t: 'text', x: 615, y: 274, text: 'time →', size: 6.5, f: slate(0.55) },
  // each of your ticks writes a KV page (leads toward the page board)
  { t: 'line', pts: [660, 195, 716, 172], s: sky(0.4), lw: 1.2, dash: [4, 4] },
  { t: 'text', x: 400, y: 292, text: 'solid block = prefill · tick = one decoded token', size: 6, f: slate(0.5), lodMax: 2.5 },
]

const kvArt: Shape[] = (() => {
  const out: Shape[] = [
    { t: 'text', x: 736, y: 66, text: 'whose memory is whose', size: 6, f: slate(0.6) },
  ]
  const colors: Record<string, { f?: string; s?: string }> = {
    B: { f: amber(0.4) }, Y: { f: sky(0.5) }, D: { f: emerald(0.45) },
    A: { s: violet(0.45) },            // Alice's pages: freed, outline only
    F: { f: slate(0.08), s: slate(0.25) }, // free
  }
  for (let i = 0; i < 72; i++) {
    const c = colors[pageOwner(i)]
    out.push({
      t: 'rect', x: 738 + (i % 8) * 28, y: 82 + Math.floor(i / 8) * 22,
      w: 22, h: 16, r: 2, f: c.f, s: c.s, lw: 0.8,
    })
  }
  out.push(
    { t: 'text', x: 738, y: 292, text: 'Bob █  You █  Dana █  Alice(freed) ▢', size: 5.5, f: slate(0.6), mono: true, lod: 1.25 },
  )
  return out
})()

const specArt: Shape[] = [
  // context chip
  { t: 'rect', x: 48, y: 402, w: 62, h: 16, r: 3, f: slate(0.12), s: slate(0.4), lw: 1 },
  { t: 'text', x: 79, y: 410, text: '…France is', size: 5.5, f: ink, align: 'center', mono: true },
  // draft lane: small model guesses three tokens ahead
  { t: 'rect', x: 130, y: 392, w: 62, h: 34, r: 4, f: sky(0.12), s: sky(0.5), lw: 1.2 },
  { t: 'text', x: 161, y: 405, text: 'draft', size: 6.5, f: sky(0.9), align: 'center' },
  { t: 'text', x: 161, y: 417, text: '~2B', size: 5, f: sky(0.6), align: 'center', mono: true },
  { t: 'rect', x: 212, y: 398, w: 44, h: 15, r: 3, f: sky(0.18), s: sky(0.5), lw: 0.9 },
  { t: 'text', x: 234, y: 405.5, text: '·Paris', size: 5.5, f: ink, align: 'center', mono: true },
  { t: 'rect', x: 262, y: 398, w: 20, h: 15, r: 3, f: sky(0.18), s: sky(0.5), lw: 0.9 },
  { t: 'text', x: 272, y: 405.5, text: '.', size: 5.5, f: ink, align: 'center', mono: true },
  { t: 'rect', x: 288, y: 398, w: 36, h: 15, r: 3, f: sky(0.18), s: sky(0.5), lw: 0.9 },
  { t: 'text', x: 306, y: 405.5, text: '·The', size: 5.5, f: ink, align: 'center', mono: true },
  // verify lane: the big model scores all three in ONE pass
  { t: 'rect', x: 130, y: 462, w: 62, h: 34, r: 4, f: emerald(0.12), s: emerald(0.5), lw: 1.2 },
  { t: 'text', x: 161, y: 475, text: 'target', size: 6.5, f: emerald(0.9), align: 'center' },
  { t: 'text', x: 161, y: 487, text: '~400B', size: 5, f: emerald(0.6), align: 'center', mono: true },
  { t: 'text', x: 234, y: 478, text: '✓', size: 10, f: emerald(0.95), align: 'center' },
  { t: 'text', x: 272, y: 478, text: '✓', size: 10, f: emerald(0.95), align: 'center' },
  { t: 'text', x: 306, y: 478, text: '✗', size: 10, f: 'hsla(340,75%,65%,0.95)', align: 'center' },
  { t: 'line', pts: [234, 418, 234, 468], s: emerald(0.3), lw: 0.8, dash: [3, 3] },
  { t: 'line', pts: [272, 418, 272, 468], s: emerald(0.3), lw: 0.8, dash: [3, 3] },
  { t: 'line', pts: [306, 418, 306, 468], s: emerald(0.3), lw: 0.8, dash: [3, 3] },
  { t: 'text', x: 345, y: 478, text: 'kept: " Paris."', size: 6, f: emerald(0.8), mono: true },
  { t: 'text', x: 130, y: 530, text: 'two tokens for the price of one lap — output identical to the big model alone', size: 6, f: slate(0.55), lod: 1.2 },
]

const engineArt: Shape[] = [
  // weights streaming: HBM → SMs, every single tick
  { t: 'rect', x: 528, y: 368, w: 52, h: 42, r: 4, f: slate(0.15), s: slate(0.45), lw: 1.1 },
  { t: 'text', x: 554, y: 389, text: 'HBM', size: 7, f: ink, align: 'center' },
  { t: 'rect', x: 648, y: 368, w: 52, h: 42, r: 4, f: amber(0.12), s: amber(0.5), lw: 1.1 },
  { t: 'text', x: 674, y: 389, text: 'SMs', size: 7, f: ink, align: 'center' },
  { t: 'text', x: 528, y: 358, text: '~all the weights, every tick', size: 5.5, f: slate(0.6), lod: 1.2 },
  // FlashAttention: tiles inside SRAM
  { t: 'rect', x: 790, y: 362, w: 130, h: 54, r: 4, f: sky(0.08), s: sky(0.45), lw: 1.1 },
  { t: 'text', x: 796, y: 355, text: 'on-chip SRAM', size: 5.5, f: sky(0.7) },
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 800 + (i % 4) * 28, y: 372 + Math.floor(i / 4) * 20, w: 22, h: 14, r: 2, f: sky(0.25), s: sky(0.4), lw: 0.7 }
  )),
  // quantization: same weights, fewer bytes
  { t: 'text', x: 528, y: 505, text: 'FP16', size: 6, f: slate(0.7), mono: true },
  { t: 'rect', x: 562, y: 499, w: 128, h: 11, r: 2, f: slate(0.35) },
  { t: 'text', x: 528, y: 527, text: 'FP8', size: 6, f: amber(0.8), mono: true },
  { t: 'rect', x: 562, y: 521, w: 64, h: 11, r: 2, f: amber(0.5) },
  { t: 'text', x: 636, y: 527, text: '½ the bytes → ~2× the ticks', size: 5.5, f: slate(0.6), lod: 1.2 },
  // disaggregation: two pools shaped for two jobs
  { t: 'rect', x: 790, y: 470, w: 60, h: 44, r: 4, f: violet(0.12), s: violet(0.5), lw: 1.1 },
  { t: 'rect', x: 800, y: 490, w: 10, h: 16, f: violet(0.55) },
  { t: 'rect', x: 814, y: 490, w: 10, h: 16, f: violet(0.55) },
  { t: 'rect', x: 828, y: 490, w: 10, h: 16, f: violet(0.55) },
  { t: 'text', x: 820, y: 480, text: 'prefill pool', size: 5, f: violet(0.8), align: 'center' },
  { t: 'rect', x: 862, y: 470, w: 60, h: 44, r: 4, f: sky(0.1), s: sky(0.5), lw: 1.1 },
  ...Array.from({ length: 5 }, (_, i): Shape => (
    { t: 'rect', x: 870 + i * 9, y: 496, w: 4, h: 10, r: 1, f: sky(0.6) }
  )),
  { t: 'text', x: 892, y: 480, text: 'decode pool', size: 5, f: sky(0.8), align: 'center' },
]

export const inference: ModuleDef = {
  id: 'inference',
  title: 'The Inference Stack',
  tagline: 'One serving worker, four users: prompt bursts and decode ticks sharing the same expensive capacity.',
  world: { w: 1000, h: 620 },
  flows: [
    // the "now" playhead sweeping the timetable
    { pts: [92, 258, 660, 258], color: amber(0.8), n: 1, speed: 55, size: 3 },
    // your decode ticks writing pages onto the KV board
    { pts: [660, 195, 716, 172], color: sky(0.7), n: 2, speed: 40, size: 2 },
    // weights streaming HBM → SMs inside every tick
    { pts: [582, 389, 646, 389], color: amber(0.8), n: 4, speed: 90, size: 2.2 },
    // draft sprinting ahead, target verifying in one pass
    { pts: [196, 409, 330, 409], color: sky(0.85), n: 3, speed: 110, size: 2.2 },
    { pts: [196, 479, 330, 479], color: emerald(0.9), n: 1, speed: 45, size: 3.5 },
  ],
  items: [
    {
      id: 'inf.timeline', name: 'One worker, four users', kind: 'container', zone: 'The timetable',
      x: 350, y: 170, w: 640, h: 270, art: timelineArt,
      note: 'A serving worker runs many conversations at once; it may be one GPU or a model shard across several. Solid blocks are prefill, ticks are standard decode steps, and the amber dot is “now”.',
    },
    { id: 'inf.you', name: 'Your request', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 62, y: 208, hitR: 28,
      note: '"The capital of France is" — the same sentence from The Journey of a Token, now seen from the datacenter’s side: one thin row on a shared GPU.' },
    { id: 'inf.bigdoc', name: 'The 100k-token request', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 62, y: 137, hitR: 28,
      note: 'Bob pasted an entire PDF. His prefill can require far more compute than a short chat; the scheduler’s job is to limit the latency impact on other requests.' },
    { id: 'inf.prefix', name: 'Prefix cache (sys)', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 103, y: 121, hitR: 18,
      note: 'Every row shares the same faded “sys” prefix. When automatic prefix caching is enabled and the exact prefix is still resident, requests can reuse its KV blocks instead of recomputing them.' },
    { id: 'inf.prefill', name: 'Prefill burst', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 333, y: 182, hitR: 15, ldy: 20,
      note: 'Your 5 tokens are one short compute burst (the solid block). Prefill cost scales with prompt length — compare Bob’s.',
      role: 'runs your whole prompt in one solid burst of compute' },
    { id: 'inf.ttft', name: 'Time to first token', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 345, y: 224, hitR: 15,
      note: 'The flag where your first token appears: everything from arrival to here — queueing plus prefill — is the wait you feel before text starts.' },
    { id: 'inf.autoreg', name: 'Decode ticks', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 500, y: 195, hitR: 55,
      note: 'After the burst, your row becomes a drumbeat: tick, tick, tick — " Paris", ".", end. One forward pass of the whole model per tick.' },
    { id: 'inf.tpot', name: 'Inter-token latency', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 590, y: 222, hitR: 30,
      note: 'The gap between ticks — tens of milliseconds on a healthy stack. This, not TTFT, is the "tokens per second" you watch.' },
    { id: 'inf.chunked', name: 'Chunked prefill', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 350, y: 150, hitR: 70,
      note: 'Bob’s giant prefill is split into chunks that can be scheduled around decode work. Prioritizing decode reduces—but does not eliminate—its interference with other users.',
      role: 'slices a huge prompt into pieces so it can’t stall other users' },
    { id: 'inf.contbatch', name: 'Continuous batching', kind: 'atom', parent: 'inf.timeline', zone: 'The timetable', x: 452, y: 105, hitR: 30,
      note: 'Alice’s haiku finishes mid-timeline and Dana can join on a later scheduler step. Continuous batching avoids waiting for a fixed batch to drain and helps reduce idle capacity.',
      role: 'hands a finished user’s slot to a new request on the next tick' },

    {
      id: 'inf.kvmem', name: 'KV memory, paged', kind: 'container', zone: 'The timetable',
      x: 845, y: 170, w: 250, h: 270, art: kvArt,
      note: 'The GPU’s KV cache as PagedAttention sees it: fixed-size pages, allocated on demand, color = owner. Bob’s PDF owns most of the board.',
    },
    { id: 'inf.paged', name: 'PagedAttention', kind: 'atom', parent: 'inf.kvmem', zone: 'The timetable', x: 845, y: 130, hitR: 75,
      note: 'Cache lives in fixed-size blocks that can occupy non-contiguous physical memory, like virtual-memory paging. The vLLM paper reports near-zero KV waste in its evaluated system and 2–4× throughput versus its baselines—not a universal multiplier.',
      role: 'manages the KV cache in pages the way an OS manages virtual memory' },
    { id: 'inf.kvgrow', name: 'Pages grow per tick', kind: 'atom', parent: 'inf.kvmem', zone: 'The timetable', x: 845, y: 245, hitR: 75,
      note: 'Every decode tick appends K/V; when a page fills, a new one is grabbed from the free pool. Alice’s outlined pages were freed the moment she finished.' },

    {
      id: 'inf.spec', name: 'Speculative decoding', kind: 'container', zone: 'Going faster',
      x: 250, y: 460, w: 440, h: 240, art: specArt,
      note: 'The racetrack, run on your sentence: a tiny draft model guesses " Paris", ".", " The"; the big model checks all three in one pass and keeps the first two.',
      role: 'lets a cheap model guess ahead and the big model verify the guesses',
    },
    { id: 'inf.draft', name: 'Draft model', kind: 'atom', parent: 'inf.spec', zone: 'Going faster', x: 161, y: 409, hitR: 38, ldy: -30, ldx: -50,
      note: 'A ~2B sidekick that emits guesses in a fraction of a tick. It only pays off if it thinks like the big model — here it nailed " Paris" and "." but not what comes after.' },
    { id: 'inf.verify', name: 'Verification pass', kind: 'atom', parent: 'inf.spec', zone: 'Going faster', x: 161, y: 479, hitR: 38, ldy: 30, ldx: -50,
      note: 'The ~400B target scores all three guesses in a single parallel pass — the same trick as prefill. Rejection sampling keeps the output distribution exactly its own.' },
    { id: 'inf.accept', name: 'Acceptance rate', kind: 'atom', parent: 'inf.spec', zone: 'Going faster', x: 300, y: 520, hitR: 55,
      note: 'Two of three kept in this illustration, so the target advances multiple tokens. Published speculative-sampling results reached roughly 2–2.5× on one large-model setup; real gains depend on acceptance rate and draft cost.' },

    {
      id: 'inf.engine', name: 'Inside one decode tick', kind: 'container', zone: 'Going faster',
      x: 735, y: 460, w: 450, h: 240, art: engineArt,
      note: 'Zoom into any single tick of the timetable and this is what’s happening in those few milliseconds.',
    },
    { id: 'inf.wstream', name: 'Weight streaming', kind: 'atom', parent: 'inf.engine', zone: 'Going faster', x: 614, y: 389, hitR: 42, ldy: 46, ldx: -60,
      note: 'At small batches, a decode step may be dominated by moving a model’s weight bytes through HBM. A 180 GB payload divided by an 8 TB/s peak is ~23 ms before efficiency and system overheads—an illustrative lower bound, not a forecast.',
      role: 'moves every weight from HBM to the compute units, every tick' },
    { id: 'inf.flash', name: 'FlashAttention', kind: 'atom', parent: 'inf.engine', zone: 'Going faster', x: 855, y: 389, hitR: 60,
      note: 'FlashAttention tiles exact attention through on-chip SRAM instead of materializing the full score matrix in HBM. It reduces memory traffic and auxiliary memory; speedup depends on sequence length, hardware, and kernel generation.' },
    { id: 'inf.quant', name: 'Quantization (FP8/INT4)', kind: 'atom', parent: 'inf.engine', zone: 'Going faster', x: 610, y: 513, hitR: 50, ldy: -26, ldx: -60,
      note: 'Lower-precision weights use fewer bytes, so bandwidth-bound decode can speed up and fit larger batches. Gains are not automatically linear: kernels, scaling overhead, outliers, and quality constraints matter.' },
    { id: 'inf.disagg', name: 'Disaggregated serving', kind: 'atom', parent: 'inf.engine', zone: 'Going faster', x: 856, y: 492, hitR: 60, ldy: 36, ldx: -80,
      note: 'Split the fleet: burst-shaped GPUs do prefill, drumbeat-shaped GPUs do decode, and requests hand off between pools — each phase on hardware shaped for it.' },
  ],
}

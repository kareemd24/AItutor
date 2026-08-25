import type { ModuleDef, Shape } from '../types'

// The whole inference pipeline as one contiguous, animated workflow.
// Left → right: your text becomes tokens, prefill pushes the whole prompt
// through in parallel (filling the KV cache below), then the decode loop
// circles one token at a time — reading the cache — and streams tokens out.
// The flows make the two phases' character visible: many particles racing
// through prefill at once, a single particle circling decode.

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const emerald = (a: number) => `hsla(152,65%,55%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`

const station = (x: number, y: number, w: number, h: number, hue: (a: number) => string): Shape[] => ([
  { t: 'rect', x: x - w / 2, y: y - h / 2, w, h, r: 10, f: hue(0.1), s: hue(0.5), lw: 1.3 },
])

const arrow = (pts: number[], color: string): Shape[] => {
  const n = pts.length
  const [x1, y1, x2, y2] = [pts[n - 4], pts[n - 3], pts[n - 2], pts[n - 1]]
  const a = Math.atan2(y2 - y1, x2 - x1)
  const h = 8
  return [
    { t: 'line', pts, s: color, lw: 1.5 },
    { t: 'line', pts: [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45), x2, y2, x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)], s: color, lw: 1.5 },
  ]
}

// the decode circuit, reused by art (faint track) and flow (the moving token)
const DECODE_LOOP = [700, 95, 762, 150, 862, 150, 922, 150, 908, 245, 792, 252, 700, 190, 700, 95]

export const tokenpath: ModuleDef = {
  id: 'tokenpath',
  title: 'The Journey of a Token',
  tagline: 'Follow your prompt through the machine: tokenize → prefill in parallel → the decode loop, one token per lap.',
  world: { w: 1000, h: 620 },
  art: [
    // prompt → prefill
    ...arrow([238, 160, 285, 160], sky(0.5)),
    // prefill → decode (the first token crosses over)
    ...arrow([615, 130, 645, 130], amber(0.5)),
    // prefill writes the cache; decode reads it
    ...arrow([520, 290, 555, 365], violet(0.5)),
    ...arrow([690, 365, 725, 292], emerald(0.5)),
    { t: 'text', x: 505, y: 335, text: 'writes', size: 12, f: violet(0.7) },
    { t: 'text', x: 712, y: 340, text: 'reads', size: 12, f: emerald(0.7) },
    // the decode loop track
    { t: 'line', pts: DECODE_LOOP, s: emerald(0.3), lw: 1.5, dash: [4, 5] },
    // tokens streaming out to you
    ...arrow([922, 250, 960, 320, 975, 380], amber(0.5)),
    { t: 'text', x: 930, y: 400, text: 'streams to you', size: 12, f: amber(0.7) },
    // repeated-layers bracket over the two stations in prefill
    { t: 'line', pts: [365, 105, 365, 95, 565, 95, 565, 105], s: slate(0.45), lw: 1.2 },
    { t: 'text', x: 400, y: 82, text: '× N layers, every pass', size: 12, f: slate(0.6), lodMax: 3 },
  ],
  flows: [
    // the prompt's tokens marching in
    { pts: [60, 160, 238, 160], color: sky(0.8), n: 4, speed: 60, size: 2.5 },
    // prefill: many tokens in parallel, fast
    { pts: [300, 145, 610, 145], color: amber(0.85), n: 6, speed: 130, size: 2.5 },
    { pts: [300, 165, 610, 165], color: amber(0.7), n: 6, speed: 130, size: 2.5 },
    { pts: [300, 185, 610, 185], color: amber(0.55), n: 6, speed: 130, size: 2.5 },
    // K/V pouring into the cache during prefill
    { pts: [520, 290, 555, 365], color: violet(0.8), n: 3, speed: 50, size: 2 },
    // decode: ONE token, going around the loop
    { pts: DECODE_LOOP, color: emerald(0.95), n: 1, speed: 90, size: 4 },
    // cache reads feeding each decode lap
    { pts: [690, 365, 725, 292], color: emerald(0.6), n: 2, speed: 50, size: 2 },
    // the output stream
    { pts: [922, 250, 960, 320, 975, 380], color: amber(0.8), n: 3, speed: 55, size: 2.5 },
  ],
  items: [
    {
      id: 'tp.prompt', name: 'Your prompt', kind: 'container', zone: 'Before the model',
      x: 145, y: 165, w: 210, h: 250,
      note: 'Everything starts as the text you typed — and the model can’t touch text. First stop: turn it into numbers.',
    },
    { id: 'tp.text', name: 'Raw text', kind: 'atom', parent: 'tp.prompt', zone: 'Before the model', x: 100, y: 105,
      note: 'Your words exactly as typed. The model never sees them this way — only their token IDs.' },
    { id: 'tp.tok', name: 'Tokenizer', kind: 'atom', parent: 'tp.prompt', zone: 'Before the model', x: 190, y: 105,
      note: 'Chops text into subword pieces and looks up each one’s ID — “unbelievable” might become un·believ·able.',
      role: 'chops your text into the subword pieces the model reads' },
    { id: 'tp.embed', name: 'Embeddings', kind: 'atom', parent: 'tp.prompt', zone: 'Before the model', x: 145, y: 220,
      note: 'Each token ID indexes a giant table of learned vectors — from here on, every token is just a list of numbers.' },

    {
      id: 'tp.prefill', name: 'Prefill', kind: 'container', zone: 'Phase one: prefill',
      x: 450, y: 168, w: 330, h: 265, art: [
        ...station(400, 150, 110, 84, violet),
        ...station(545, 150, 100, 84, amber),
      ],
      note: 'Phase one: every prompt token flows through the model at once, as one giant matrix multiply — compute-bound, and why the first token takes longest.',
      role: 'pushes the whole prompt through the model in one parallel pass',
    },
    { id: 'tp.parallel', name: 'All tokens at once', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 320, y: 240,
      note: 'The whole prompt moves as one batch — thousands of tokens side by side, saturating the GPU’s compute units.' },
    { id: 'tp.attn', name: 'Attention station', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 400, y: 150, hitR: 40,
      note: 'Each token looks back at every token before it — and drops its K and V into the cache on the way through.' },
    { id: 'tp.qkv', name: 'Q/K/V split', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 378, y: 178, lod: 1.6,
      note: 'Inside the station: each token’s vector becomes a query, a key and a value before any looking-back happens.' },
    { id: 'tp.scores', name: 'Score & mix', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 425, y: 126, lod: 1.6,
      note: 'Query·key dot products, softmaxed into weights that blend the values — the actual “attention” the architecture is named for.' },
    { id: 'tp.ffn', name: 'FFN station', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 545, y: 150, hitR: 36,
      note: 'The second station of every layer: each token alone — expand, gate, compress — where stored knowledge gets applied.' },
    { id: 'tp.ttft', name: 'First token out', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 585, y: 250,
      note: 'Out of the last layer comes the first generated token — everything left of this point is what “time to first token” measures.',
      role: 'marks the moment prefill ends and you finally see output' },

    {
      id: 'tp.decode', name: 'The decode loop', kind: 'container', zone: 'Phase two: decode',
      x: 810, y: 168, w: 330, h: 265, art: [
        ...station(762, 150, 96, 76, violet),
        ...station(862, 150, 80, 76, amber),
      ],
      note: 'Phase two: one token per lap around this circuit, each lap re-reading all the weights from HBM — sequential, bandwidth-bound, and it is the tokens-per-second you watch.',
      role: 'generates one token per lap around a circuit that re-reads all the weights',
    },
    { id: 'tp.last', name: 'Newest token in', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 700, y: 95,
      note: 'Only the newest token enters the model each lap — everything older is already summarized in the KV cache.' },
    { id: 'tp.attn2', name: 'Attention (reads cache)', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 762, y: 150, hitR: 34,
      note: 'Attention again, but cheap: one query against the cached keys and values of everything that came before.' },
    { id: 'tp.ffn2', name: 'FFN (weights stream)', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 862, y: 150, hitR: 28,
      note: 'The same FFN weights as prefill — streamed from HBM again on every single lap, which is exactly why decode is bandwidth-bound.' },
    { id: 'tp.logits', name: 'Logits', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 922, y: 150,
      note: 'One score for every token in the vocabulary — the model’s opinion about all possible next words at once.' },
    { id: 'tp.sample', name: 'Sampler', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 908, y: 245,
      note: 'Temperature and top-p shape the distribution, then one token is drawn — the only randomness in the whole pipeline.',
      role: 'draws the next token — the pipeline’s only moment of randomness' },
    { id: 'tp.newtok', name: 'Token appended', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 792, y: 252,
      note: 'The chosen token joins the sequence, its K/V join the cache, and it heads straight back around the loop as the next input.' },
    { id: 'tp.stream', name: 'Streamed to you', kind: 'atom', zone: 'Phase two: decode', x: 968, y: 360,
      note: 'Each lap’s token is sent to you immediately — the typing effect you watch is the decode loop made visible.' },

    {
      id: 'tp.cache', name: 'KV cache', kind: 'container', zone: 'The shared memory',
      x: 622, y: 442, w: 300, h: 150, art: [
        ...Array.from({ length: 6 }, (_, i): Shape => (
          { t: 'rect', x: 500 + i * 42, y: 415, w: 34, h: 56, r: 3, f: violet(0.15), s: violet(0.4), lw: 1, lod: 1.3 }
        )),
      ],
      note: 'The pipeline’s memory: keys and values for every token so far — written once by prefill, read by every decode lap. The bridge between the two phases.',
      role: 'stores what prefill computed so decode never re-reads the prompt',
    },
    { id: 'tp.kv', name: 'K & V per token', kind: 'atom', parent: 'tp.cache', zone: 'The shared memory', x: 560, y: 490,
      note: 'Stored per token, per layer, per KV head — which is why cache size scales with context length × model depth.' },
    { id: 'tp.grow', name: 'Grows every lap', kind: 'atom', parent: 'tp.cache', zone: 'The shared memory', x: 690, y: 490,
      note: 'Every generated token appends here — long conversations slowly fill GPU memory with cache, not weights.' },
  ],
}

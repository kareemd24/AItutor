import type { ModuleDef, Shape } from '../types'

// The inference pipeline as one animated workflow, taught through a single
// worked example: the user types "The capital of France is" and the model
// answers " Paris". The actual tokens ride the diagram — chips in the prompt,
// arcs in the attention demo, bars in the logit chart, a growing cache.
// (Token IDs and probabilities shown are illustrative; they vary by model.)

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const emerald = (a: number) => `hsla(152,65%,55%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`
const ink = 'rgba(226,232,240,0.9)'

const station = (x: number, y: number, w: number, h: number, hue: (a: number) => string): Shape[] => ([
  { t: 'rect', x: x - w / 2, y: y - h / 2, w, h, r: 10, f: hue(0.1), s: hue(0.5), lw: 1.3 },
])

const arrow = (pts: number[], color: string = slate(0.5)): Shape[] => {
  const n = pts.length
  const [x1, y1, x2, y2] = [pts[n - 4], pts[n - 3], pts[n - 2], pts[n - 1]]
  const a = Math.atan2(y2 - y1, x2 - x1)
  const h = 8
  return [
    { t: 'line', pts, s: color, lw: 1.5 },
    { t: 'line', pts: [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45), x2, y2, x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)], s: color, lw: 1.5 },
  ]
}

// the five prompt tokens, as chips
const TOKENS = ['The', '·capital', '·of', '·France', '·is']
const IDS = ['464', '6864', '286', '6181', '318']
const chipRow = (x0: number, y: number, w: number, gap: number, size: number): Shape[] =>
  TOKENS.map((tok, i): Shape[] => ([
    { t: 'rect', x: x0 + i * (w + gap), y, w, h: size * 2.2, r: 3, f: sky(0.15), s: sky(0.5), lw: 1 },
    { t: 'text', x: x0 + i * (w + gap) + w / 2, y: y + size * 1.1, text: tok, size, f: ink, align: 'center', mono: true },
  ])).flat()

// the decode circuit, reused by art (faint track) and flow (the moving token)
const DECODE_LOOP = [700, 95, 762, 150, 862, 150, 922, 150, 908, 245, 792, 252, 700, 190, 700, 95]

// tiny chips for the attention demo (abbreviated to fit)
const MINI = ['The', 'cap', 'of', 'Fra', 'is']

export const tokenpath: ModuleDef = {
  id: 'tokenpath',
  title: 'The Journey of a Token',
  tagline: 'One real sentence — "The capital of France is" — followed all the way to " Paris".',
  world: { w: 1000, h: 620 },
  art: [
    // prompt → prefill, prefill → decode
    ...arrow([252, 160, 283, 160], sky(0.5)),
    ...arrow([615, 130, 645, 130], amber(0.5)),
    // prefill writes the cache; decode reads it
    ...arrow([520, 290, 545, 362], violet(0.5)),
    ...arrow([690, 362, 725, 292], emerald(0.5)),
    { t: 'text', x: 495, y: 335, text: 'writes K/V', size: 11, f: violet(0.7) },
    { t: 'text', x: 712, y: 337, text: 'reads', size: 11, f: emerald(0.7) },
    // decode loop track and the output stream
    { t: 'line', pts: DECODE_LOOP, s: emerald(0.3), lw: 1.5, dash: [4, 5] },
    ...arrow([922, 250, 955, 315, 962, 345], amber(0.5)),
    // what the user finally sees
    { t: 'rect', x: 880, y: 385, w: 112, h: 26, r: 13, f: amber(0.12), s: amber(0.45), lw: 1.2 },
    { t: 'text', x: 936, y: 398, text: '…France is Paris▌', size: 7, f: ink, align: 'center', mono: true },
    // repeated-layers bracket over the prefill stations
    { t: 'line', pts: [365, 103, 365, 93, 565, 93, 565, 103], s: slate(0.45), lw: 1.2 },
    { t: 'text', x: 385, y: 80, text: '× every layer, 30–100 deep', size: 11, f: slate(0.6), lodMax: 3 },
  ],
  flows: [
    // 5 prompt tokens marching in, then racing through prefill in parallel
    { pts: [252, 160, 283, 160], color: sky(0.8), n: 3, speed: 45, size: 2.5 },
    { pts: [300, 145, 610, 145], color: amber(0.85), n: 5, speed: 130, size: 2.5 },
    { pts: [300, 165, 610, 165], color: amber(0.7), n: 5, speed: 130, size: 2.5 },
    { pts: [300, 185, 610, 185], color: amber(0.55), n: 5, speed: 130, size: 2.5 },
    // K/V pouring into the cache during prefill
    { pts: [520, 290, 545, 362], color: violet(0.8), n: 3, speed: 50, size: 2 },
    // decode: ONE token (" Paris") circling the loop
    { pts: DECODE_LOOP, color: emerald(0.95), n: 1, speed: 90, size: 4 },
    // cache reads feeding each decode lap, and the stream to the user
    { pts: [690, 362, 725, 292], color: emerald(0.6), n: 2, speed: 50, size: 2 },
    { pts: [922, 250, 955, 315, 962, 345], color: amber(0.8), n: 2, speed: 55, size: 2.5 },
  ],
  items: [
    {
      id: 'tp.prompt', name: 'Your prompt', kind: 'container', zone: 'Before the model',
      x: 145, y: 165, w: 210, h: 250, art: [
        // the typed sentence
        { t: 'rect', x: 53, y: 60, w: 184, h: 21, r: 4, s: slate(0.35), lw: 1 },
        { t: 'text', x: 145, y: 71, text: '"The capital of France is"', size: 9.5, f: ink, align: 'center', mono: true },
        ...arrow([145, 86, 145, 100]),
        // → 5 token chips with (illustrative) IDs
        ...chipRow(50, 103, 36, 2.5, 6.8),
        ...IDS.map((id, i): Shape => (
          { t: 'text', x: 68 + i * 38.5, y: 128, text: '#' + id, size: 5.5, f: slate(0.6), align: 'center', mono: true, lod: 1.4 }
        )),
        ...arrow([145, 136, 145, 150]),
        // → one chip becomes a vector of numbers
        { t: 'rect', x: 82, y: 153, w: 50, h: 15, r: 3, f: sky(0.15), s: sky(0.5), lw: 1 },
        { t: 'text', x: 107, y: 161, text: '·France', size: 6.5, f: ink, align: 'center', mono: true },
        ...arrow([136, 161, 152, 161]),
        { t: 'text', x: 162, y: 150, text: '[ 0.12,', size: 6.5, f: ink, mono: true, lod: 1.2 },
        { t: 'text', x: 162, y: 161, text: ' -0.83,', size: 6.5, f: ink, mono: true, lod: 1.2 },
        { t: 'text', x: 162, y: 172, text: '  1.40,', size: 6.5, f: ink, mono: true, lod: 1.2 },
        { t: 'text', x: 162, y: 183, text: '  … ]', size: 6.5, f: ink, mono: true, lod: 1.2 },
        { t: 'text', x: 145, y: 205, text: '~4,096 numbers per token', size: 6.5, f: slate(0.6), align: 'center', lod: 1.2 },
      ],
      note: 'You type "The capital of France is" — 24 characters. The model can’t read text, so it becomes 5 tokens, then 5 long lists of numbers.',
    },
    { id: 'tp.text', name: 'Raw text', kind: 'atom', parent: 'tp.prompt', zone: 'Before the model', x: 145, y: 71, hitR: 60, ldy: -20,
      note: 'The raw string, exactly as typed. The model will never see these letters — only the token chips below.' },
    { id: 'tp.tok', name: 'Tokenizer', kind: 'atom', parent: 'tp.prompt', zone: 'Before the model', x: 145, y: 112, hitR: 75, ldy: 27,
      note: 'A GPT-style tokenizer splits the sentence into 5 pieces — "The", " capital", " of", " France", " is" — and looks up each one’s ID. Common words are one token; rare words get chopped into parts.',
      role: 'chops your sentence into the 5 pieces the model actually reads' },
    { id: 'tp.embed', name: 'Embeddings', kind: 'atom', parent: 'tp.prompt', zone: 'Before the model', x: 160, y: 166, hitR: 55, ldy: 24,
      note: 'Each token ID indexes a giant lookup table: " France" becomes a vector of ~4,096 numbers encoding how the word is used. From here on, everything is arithmetic on these.' },

    {
      id: 'tp.prefill', name: 'Prefill', kind: 'container', zone: 'Phase one: prefill',
      x: 450, y: 168, w: 330, h: 265, art: [
        ...station(400, 150, 110, 84, violet),
        ...station(545, 150, 100, 84, amber),
        // live attention demo: who does " is" look at?
        ...MINI.map((tok, i): Shape[] => ([
          { t: 'rect', x: 352 + i * 19, y: 228, w: 17, h: 10, r: 2, f: sky(0.15), s: sky(0.45), lw: 0.8, lod: 1.6 },
          { t: 'text', x: 360.5 + i * 19, y: 233, text: tok, size: 4.8, f: ink, align: 'center', mono: true, lod: 1.7 },
        ])).flat(),
        { t: 'line', pts: [436, 226, 427, 216, 419, 226], s: emerald(0.9), lw: 2.6, lod: 1.6 },
        { t: 'line', pts: [436, 226, 408, 208, 381, 226], s: emerald(0.6), lw: 1.6, lod: 1.6 },
        { t: 'line', pts: [436, 226, 398, 202, 362, 226], s: emerald(0.35), lw: 1, lod: 1.6 },
        { t: 'text', x: 432, y: 211, text: '.61', size: 4.5, f: emerald(0.9), lod: 1.8, mono: true },
        { t: 'text', x: 405, y: 203, text: '.28', size: 4.5, f: emerald(0.6), lod: 1.8, mono: true },
        { t: 'text', x: 398, y: 250, text: 'who does " is" look at?', size: 6, f: slate(0.7), align: 'center', lod: 1.5 },
        // live FFN demo: expand → gate → compress
        { t: 'circle', cx: 517, cy: 222, r: 2.2, f: amber(0.7), lod: 1.6 },
        { t: 'circle', cx: 517, cy: 234, r: 2.2, f: amber(0.7), lod: 1.6 },
        { t: 'circle', cx: 517, cy: 246, r: 2.2, f: amber(0.7), lod: 1.6 },
        ...Array.from({ length: 6 }, (_, i): Shape => (
          { t: 'circle', cx: 545, cy: 209 + i * 10, r: 2.2, f: i === 1 || i === 3 ? amber(0.9) : amber(0.25), lod: 1.6 }
        )),
        { t: 'circle', cx: 573, cy: 222, r: 2.2, f: amber(0.7), lod: 1.6 },
        { t: 'circle', cx: 573, cy: 234, r: 2.2, f: amber(0.7), lod: 1.6 },
        { t: 'circle', cx: 573, cy: 246, r: 2.2, f: amber(0.7), lod: 1.6 },
        ...Array.from({ length: 6 }, (_, i): Shape[] => ([
          { t: 'line', pts: [519, 234, 543, 209 + i * 10], s: amber(0.2), lw: 0.6, lod: 1.7 },
          { t: 'line', pts: [547, 209 + i * 10, 571, 234], s: amber(0.2), lw: 0.6, lod: 1.7 },
        ])).flat(),
        { t: 'text', x: 545, y: 262, text: 'ask 4× more questions, keep the yeses', size: 5.5, f: slate(0.7), align: 'center', lod: 1.5 },
      ],
      note: 'Phase one: all 5 tokens enter at once as one matrix and flow through every layer together — one big compute-bound pass that sets your time-to-first-token.',
      role: 'pushes the whole prompt through the model in one parallel pass',
    },
    { id: 'tp.parallel', name: 'All 5 tokens at once', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 320, y: 62,
      note: 'The 5 tokens ride side by side through every layer. Five today — but the same trick swallows a 100,000-token document in one pass.' },
    { id: 'tp.attn', name: 'Attention station', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 400, y: 150, hitR: 42, ldy: -52, ldx: -55,
      note: 'Every token looks back at the ones before it. " is" finds " France" and " capital" — and now carries the idea "we’re about to name France’s capital".' },
    { id: 'tp.qkv', name: 'Q/K/V split', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 365, y: 120, lod: 1.6,
      note: 'Each token becomes three things: " is" asks a question (query: “what am I completing?”), " France" advertises itself (key: “country name here”), and carries cargo (value).' },
    { id: 'tp.scores', name: 'Score & mix', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 437, y: 120, lod: 1.6,
      note: 'Query·key matches, softmaxed into weights — here " France" gets 0.61, " capital" 0.28 — then those weights blend the values into " is"’s new meaning.' },
    { id: 'tp.attnex', name: 'Attention, live', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 398, y: 237, hitR: 45, lod: 1.5,
      note: 'The arcs show it: processing " is", the model leans hardest on " France" (0.61) and " capital" (0.28). Arc thickness IS the softmax weight.' },
    { id: 'tp.ffn', name: 'FFN station', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 545, y: 150, hitR: 38, ldy: -52, ldx: -40,
      note: 'The feed-forward network: thousands of learned yes/no questions asked of each token at once — “geography? a name coming? French context?” The yeses nudge the vector toward Paris-ness.' },
    { id: 'tp.ffnex', name: 'FFN, live', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 545, y: 232, hitR: 40, lod: 1.5,
      note: 'Expand to ~4× width (ask the questions), a gate keeps the neurons that lit up — here “capital-of-country” and “French things” — then compress the answer back in.' },
    { id: 'tp.ttft', name: 'First token out', kind: 'atom', parent: 'tp.prefill', zone: 'Phase one: prefill', x: 587, y: 272,
      note: 'After the last layer, the position after " is" makes its prediction: " Paris". Everything you’ve waited for so far — that was time-to-first-token.',
      role: 'marks the moment prefill ends and you finally see output' },

    {
      id: 'tp.decode', name: 'The decode loop', kind: 'container', zone: 'Phase two: decode',
      x: 810, y: 168, w: 330, h: 265, art: [
        ...station(762, 150, 96, 76, violet),
        ...station(862, 150, 80, 76, amber),
        // the model's opinion about the next token, as bars
        { t: 'text', x: 900, y: 52, text: 'P(next token)', size: 6, f: slate(0.7), lod: 1.3 },
        { t: 'text', x: 898, y: 64, text: 'Paris', size: 5.5, f: ink, mono: true, align: 'left', lod: 1.3 },
        { t: 'rect', x: 926, y: 61, w: 40, h: 6, r: 1, f: emerald(0.8), lod: 1.3 },
        { t: 'text', x: 898, y: 74, text: 'Lyon', size: 5.5, f: ink, mono: true, lod: 1.3 },
        { t: 'rect', x: 926, y: 71, w: 5, h: 6, r: 1, f: slate(0.5), lod: 1.3 },
        { t: 'text', x: 898, y: 84, text: 'the', size: 5.5, f: ink, mono: true, lod: 1.3 },
        { t: 'rect', x: 926, y: 81, w: 4, h: 6, r: 1, f: slate(0.5), lod: 1.3 },
        { t: 'text', x: 898, y: 94, text: 'Berlin', size: 5.5, f: ink, mono: true, lod: 1.3 },
        { t: 'rect', x: 926, y: 91, w: 2.5, h: 6, r: 1, f: slate(0.5), lod: 1.3 },
      ],
      note: 'Phase two: " Paris" is chosen, appended, and goes around this circuit alone — one lap per token, all the weights re-read from HBM every lap. This rhythm is the streaming you watch.',
      role: 'generates one token per lap around a circuit that re-reads all the weights',
    },
    { id: 'tp.last', name: 'Newest token in', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 700, y: 95, ldy: -20,
      note: 'Only " Paris" enters the next lap — "The capital of France is" doesn’t re-run, because it’s already summarized in the KV cache.' },
    { id: 'tp.attn2', name: 'Attention (reads cache)', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 762, y: 150, hitR: 36, ldy: -48, ldx: -60,
      note: '" Paris"’s query runs against the stored keys of all 5 earlier tokens — pure lookups against the cache, no recomputation.' },
    { id: 'tp.ffn2', name: 'FFN (weights stream)', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 862, y: 150, hitR: 30, ldy: 48, ldx: -60,
      note: 'The same questions as prefill — but now the billions of weights stream from HBM to serve a single token. That’s why decode is bandwidth-bound.' },
    { id: 'tp.logits', name: 'Logits', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 922, y: 150, ldy: -26,
      note: 'A score for every one of ~100,000 vocabulary entries. After " is", the bars say it all: " Paris" towers over " Lyon" and " Berlin".' },
    { id: 'tp.sample', name: 'Sampler', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 908, y: 245,
      note: 'At temperature 0 it simply takes " Paris". Warmer settings would occasionally let " Lyon" through — the pipeline’s only randomness lives here.',
      role: 'draws the next token — the pipeline’s only moment of randomness' },
    { id: 'tp.newtok', name: 'Token appended', kind: 'atom', parent: 'tp.decode', zone: 'Phase two: decode', x: 792, y: 252,
      note: 'The sequence is now "The capital of France is Paris". Its K/V join the cache, and around the loop it goes — a period is probably next.' },
    { id: 'tp.stream', name: 'Streamed to you', kind: 'atom', zone: 'Phase two: decode', x: 936, y: 385, hitR: 55, lalign: 'right' as const, ldy: -22,
      note: '"Paris" appears on your screen the instant its lap finishes. The typing effect you watch is this loop, made visible.' },

    {
      id: 'tp.cache', name: 'KV cache', kind: 'container', zone: 'The shared memory',
      x: 622, y: 442, w: 300, h: 150, art: [
        ...Array.from({ length: 5 }, (_, i): Shape[] => ([
          { t: 'rect', x: 490 + i * 42, y: 412, w: 34, h: 54, r: 3, f: violet(0.15), s: violet(0.4), lw: 1 },
          { t: 'line', pts: [490 + i * 42, 439, 524 + i * 42, 439], s: violet(0.4), lw: 0.8, lod: 1.5 },
          { t: 'text', x: 507 + i * 42, y: 428, text: 'K', size: 5.5, f: slate(0.8), align: 'center', mono: true, lod: 1.7 },
          { t: 'text', x: 507 + i * 42, y: 452, text: 'V', size: 5.5, f: slate(0.8), align: 'center', mono: true, lod: 1.7 },
          { t: 'text', x: 507 + i * 42, y: 476, text: MINI[i], size: 5.5, f: ink, align: 'center', mono: true, lod: 1.2 },
        ])).flat(),
        // the slot " Paris" is about to fill
        { t: 'rect', x: 700, y: 412, w: 34, h: 54, r: 3, s: emerald(0.55), lw: 1.2, dash: [4, 3] },
        { t: 'text', x: 717, y: 476, text: '+Paris', size: 5, f: emerald(0.8), align: 'center', mono: true, lod: 1.4 },
      ],
      note: 'The pipeline’s memory: one slot per token holding its keys and values, per layer. Prefill filled 5 slots; " Paris" is about to make it 6. Decode reads them all, every lap.',
      role: 'stores what prefill computed so decode never re-reads the prompt',
    },
    { id: 'tp.kv', name: 'K & V per token', kind: 'atom', parent: 'tp.cache', zone: 'The shared memory', x: 560, y: 495,
      note: 'Stored per token, per layer, per KV head — which is why cache size scales with context length × model depth, and long chats eat GPU memory.' },
    { id: 'tp.grow', name: 'Grows every lap', kind: 'atom', parent: 'tp.cache', zone: 'The shared memory', x: 690, y: 495,
      note: 'Every generated token appends a slot, forever. The dashed slot is " Paris" arriving — imagine this row 100,000 slots long.' },
  ],
}

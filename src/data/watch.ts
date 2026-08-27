// Curated video clips: the best free explainers on the internet, cut to the
// exact chapter that teaches each concept on the map. Timestamps are chapter
// boundaries from the videos' own chapter lists — a clip drops the viewer at
// the start of the relevant chapter, already oriented.
//
// Videos used (with permission-free YouTube embedding):
//   A · 3Blue1Brown — "Attention in transformers, step-by-step" (DL chapter 6)
//   B · 3Blue1Brown — "How might LLMs store facts" (DL chapter 7, the MLP/FFN)
//   K · Andrej Karpathy — "Let's build GPT: from scratch, in code, spelled out"

export interface WatchClip {
  /** YouTube video id */
  video: string
  /** start offset in seconds (chapter boundary) */
  start: number
  /** the chapter/segment name inside the video */
  chapter: string
  /** one line on what this clip gives the learner */
  why: string
}

export interface VideoMeta {
  creator: string
  title: string
}

export const VIDEO_META: Record<string, VideoMeta> = {
  eMlx5fFNoYc: { creator: '3Blue1Brown', title: 'Attention in transformers, step-by-step' },
  '4Bdc55j80l8': { creator: '3Blue1Brown', title: 'How might LLMs store facts' },
  kCc8FmEb1nY: { creator: 'Andrej Karpathy', title: 'Let’s build GPT: from scratch, in code' },
}

const A = 'eMlx5fFNoYc'
const B = '4Bdc55j80l8'
const K = 'kCc8FmEb1nY'

const s = (mm: number, ss: number, hh = 0) => hh * 3600 + mm * 60 + ss

const CLIPS: Record<string, WatchClip[]> = {
  // ---- attention family (3B1B ch. 6, Karpathy) ---------------------------
  'tf.attn': [
    { video: A, start: s(4, 29), chapter: 'The attention pattern', why: 'The single best animation of queries meeting keys — watch the weight grid come alive.' },
    { video: K, start: s(2, 0, 1), chapter: 'Self-attention (the crux)', why: 'The same mechanism, built line-by-line in code — attention with nothing hidden.' },
  ],
  'tf.qkv': [
    { video: A, start: s(4, 29), chapter: 'The attention pattern', why: 'Queries and keys as questions and advertisements, animated.' },
    { video: A, start: s(13, 10), chapter: 'Values', why: 'The third matrix: what a matched token actually hands over.' },
  ],
  'tf.scores': [
    { video: A, start: s(4, 29), chapter: 'The attention pattern', why: 'Dot products becoming a softmaxed grid of weights, step by step.' },
    { video: A, start: s(11, 8), chapter: 'Masking', why: 'Why a token may only look backwards — the triangle of allowed attention.' },
  ],
  'tf.heads': [
    { video: A, start: s(19, 19), chapter: 'Multiple heads', why: 'Why one head is not enough — 96 parallel heads, each learning one relationship.' },
  ],
  'tf.oproj': [
    { video: A, start: s(22, 16), chapter: 'The output matrix', why: 'How all the heads’ answers fold back into one vector.' },
  ],
  'tf.kvcache': [
    { video: A, start: s(12, 42), chapter: 'Context size', why: 'Why attention cost grows with context — the pressure the KV cache exists to relieve.' },
  ],
  'tp.attn': [
    { video: A, start: s(4, 29), chapter: 'The attention pattern', why: 'The station you just tapped, animated at the vector level.' },
  ],
  'tp.attnex': [
    { video: A, start: s(4, 29), chapter: 'The attention pattern', why: 'The arcs on this map, drawn as the real weight grid.' },
  ],

  // ---- FFN family (3B1B ch. 7) -------------------------------------------
  'tf.ffn': [
    { video: B, start: s(6, 22), chapter: 'Inside a multilayer perceptron', why: 'The definitive tour of the FFN: rows as questions, gate, columns as answers.' },
    { video: B, start: s(0, 0), chapter: 'Where facts in LLMs live', why: 'Why “Michael Jordan plays basketball” lives in these matrices at all.' },
  ],
  'tf.up': [
    { video: B, start: s(6, 22), chapter: 'Inside a multilayer perceptron', why: 'The up-projection as thousands of simultaneous questions.' },
  ],
  'tf.act': [
    { video: B, start: s(6, 22), chapter: 'Inside a multilayer perceptron', why: 'The nonlinearity as an AND gate on the questions that fired.' },
  ],
  'tf.down': [
    { video: B, start: s(6, 22), chapter: 'Inside a multilayer perceptron', why: 'The down-projection as adding the found fact back into the stream.' },
    { video: B, start: s(17, 52), chapter: 'Superposition', why: 'Why one neuron rarely means one thing — features share directions.' },
  ],
  'tp.ffn': [
    { video: B, start: s(6, 22), chapter: 'Inside a multilayer perceptron', why: 'This station, opened up: how “France” plus “capital” can summon “Paris”.' },
  ],
  'tp.ffnex': [
    { video: B, start: s(6, 22), chapter: 'Inside a multilayer perceptron', why: 'The expand-gate-compress demo on this map, done with real vectors.' },
  ],

  // ---- tokenization & embeddings -----------------------------------------
  'tf.tokenizer': [
    { video: K, start: s(9, 28), chapter: 'Tokenization', why: 'Karpathy builds a tokenizer in a few lines — the trade-offs become obvious.' },
  ],
  'tp.tok': [
    { video: K, start: s(9, 28), chapter: 'Tokenization', why: 'The chips on this map, built from scratch in code.' },
  ],
  'tp.embed': [
    { video: A, start: s(0, 0), chapter: 'Recap on embeddings', why: 'Tokens as directions in space — the geometry this map’s neighborhood sketch hints at.' },
  ],
  'tf.tokembed': [
    { video: A, start: s(0, 0), chapter: 'Recap on embeddings', why: 'What the lookup table actually stores: a direction for every token.' },
  ],

  // ---- training (Karpathy) ------------------------------------------------
  'tr.data': [
    { video: K, start: s(7, 52), chapter: 'Reading and exploring the data', why: 'A real corpus in hand — all of Shakespeare in one string.' },
  ],
  'tr.ntp': [
    { video: K, start: s(22, 11), chapter: 'The bigram baseline', why: 'Next-token prediction in its simplest possible form — the whole objective, tiny.' },
  ],
  'tr.xent': [
    { video: K, start: s(22, 11), chapter: 'The bigram baseline', why: 'The loss appears the moment the first prediction does — watch it get scored.' },
  ],
  'tr.backprop': [
    { video: K, start: s(34, 53), chapter: 'Training the bigram model', why: 'loss.backward() and the optimizer step — the red path on this map, as code.' },
  ],
  'tr.adamw': [
    { video: K, start: s(34, 53), chapter: 'Training the bigram model', why: 'The optimizer loop that turns gradients into better weights.' },
  ],

  // ---- the assembled transformer -----------------------------------------
  'tf.residual': [
    { video: K, start: s(19, 11, 1), chapter: 'Building the Transformer', why: 'Blocks, residuals and norms assembled — why the highway matters for training.' },
  ],
  'tf.norm': [
    { video: K, start: s(19, 11, 1), chapter: 'Building the Transformer', why: 'Where LayerNorm slots in as the blocks stack up.' },
  ],
}

/** Module-level "watch first" picks shown on the module page. */
const MODULE_CLIPS: Record<string, WatchClip[]> = {
  transformer: [
    { video: K, start: 0, chapter: 'The whole build, from an empty file', why: 'Two hours from nothing to a working GPT — the entire map in code.' },
    { video: A, start: s(4, 29), chapter: 'The attention pattern', why: 'The attention region of this map, animated.' },
    { video: B, start: s(6, 22), chapter: 'Inside a multilayer perceptron', why: 'The FFN region of this map, animated.' },
  ],
  tokenpath: [
    { video: A, start: s(4, 29), chapter: 'The attention pattern', why: 'What happens inside the attention station your tokens pass through.' },
    { video: B, start: s(0, 0), chapter: 'Where facts in LLMs live', why: 'Why the FFN station is where "Paris" comes from.' },
  ],
  training: [
    { video: K, start: s(22, 11), chapter: 'The bigram baseline', why: 'Guess → score → nudge, in its smallest possible form.' },
    { video: K, start: s(34, 53), chapter: 'Training the bigram model', why: 'The training loop this map’s blue and red flows depict.' },
  ],
  inference: [
    { video: A, start: s(12, 42), chapter: 'Context size', why: 'Why context length drives the KV memory board on this map.' },
  ],
}

export function watchClipsFor(itemId: string): WatchClip[] {
  return CLIPS[itemId] ?? []
}

export function moduleWatchFor(moduleId: string): WatchClip[] {
  return MODULE_CLIPS[moduleId] ?? []
}

export function fmtTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const sec = totalSeconds % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return `${h > 0 ? h + ':' : ''}${mm}:${String(sec).padStart(2, '0')}`
}

export function watchUrl(clip: WatchClip): string {
  return `https://www.youtube.com/watch?v=${clip.video}&t=${clip.start}s`
}

export function embedUrl(clip: WatchClip): string {
  return `https://www.youtube-nocookie.com/embed/${clip.video}?start=${clip.start}&autoplay=1&rel=0`
}

// The Grand Tour: one request — "The capital of France is" — followed from
// keystroke to silicon, across four modules. Each step focuses one place on
// one map; the narration is the connective tissue between them.

export interface TourStep {
  module: string
  /** item to focus; omit for the module's fitted overview */
  item?: string
  title: string
  text: string
}

export const TOUR: TourStep[] = [
  {
    module: 'tokenpath', title: 'You hit enter',
    text: 'You type "The capital of France is" and press enter. Over the next second, that sentence will cross a tokenizer, a neural network, a serving scheduler, three kinds of memory, and a 132-kilowatt rack. Follow it.',
  },
  {
    module: 'tokenpath', item: 'tp.tok', title: 'It becomes 5 tokens',
    text: 'First stop: the tokenizer chops your 24 characters into five chips — "The", " capital", " of", " France", " is" — and looks up each one’s ID. From here on, the model never sees letters again.',
  },
  {
    module: 'tokenpath', item: 'tp.embed', title: 'Tokens become geometry',
    text: 'Each ID indexes a table of ~4,096 numbers. The payoff: similar meanings sit near each other — Paris next to France, banana far away. Meaning has become distance, which is something a machine can compute with.',
  },
  {
    module: 'tokenpath', item: 'tp.prefill', title: 'Prefill: everything at once',
    text: 'All five vectors enter together as one matrix and sweep through every layer side by side — one big, compute-hungry pass. Five tokens today; the same trick swallows a 100,000-token document.',
  },
  {
    module: 'tokenpath', item: 'tp.attnex', title: 'Attention finds France',
    text: 'Inside each layer, every token looks back at the ones before it. Watch the arcs: processing " is", the model leans hardest on " France" (0.61) and " capital" (0.28). It now knows what’s being asked.',
  },
  {
    module: 'tokenpath', item: 'tp.ffnex', title: 'The FFN adds the fact',
    text: 'Then each token alone faces thousands of learned yes/no questions — "geography? a name coming? French context?" The yeses vote, and the vote nudges the vector toward Paris-ness. This is where knowledge lives.',
  },
  {
    module: 'tokenpath', item: 'tp.cache', title: 'The cache fills behind it',
    text: 'As the five tokens sweep through, each drops its keys and values into the KV cache — one slot per token, per layer. This is the receipt that means the prompt never has to be re-read.',
  },
  {
    module: 'tokenpath', item: 'tp.ttft', title: 'The first token appears',
    text: 'Out of the last layer, the position after " is" makes its prediction: " Paris". Everything you waited for so far — that was your time-to-first-token.',
  },
  {
    module: 'tokenpath', item: 'tp.decode', title: 'Then the loop',
    text: '" Paris" is appended and circles the track alone: attention reads the cache, the FFN re-runs, logits, sampler, append — one lap per token, every lap re-reading all the weights. The green dot is your answer being written.',
  },
  {
    module: 'tokenpath', item: 'tp.stream', title: '"Paris" reaches your screen',
    text: 'Each lap’s token streams out the moment it exists. The typing effect you watch in a chat window is this loop, made visible. Now zoom out — because none of this happened on a private machine.',
  },
  {
    module: 'inference', title: 'Zoom out: you shared that GPU',
    text: 'Here is the same second from the datacenter’s side: one GPU’s timetable. Every row is a user; solid blocks are prefill, ticks are decoded tokens, and the amber dot is "now". You are the third row.',
  },
  {
    module: 'inference', item: 'inf.you', title: 'Your thin row',
    text: 'Your whole journey — tokenize, prefill, decode, " Paris" — is this one thin row: a late arrival, a tiny burst, a short drumbeat. The scheduler’s craft is that it felt instant to you.',
  },
  {
    module: 'inference', item: 'inf.chunked', title: 'Bob never stalled you',
    text: 'The row above you is Bob, who pasted a 100,000-token PDF. His enormous prefill is sliced into chunks slotted between everyone’s ticks — his document costs him latency, never you.',
  },
  {
    module: 'inference', item: 'inf.contbatch', title: 'No slot ever idles',
    text: 'Top row: Alice’s haiku finished mid-timeline, and Dana’s request took over her slot on the very next tick. Continuous batching is why a serving GPU never waits for a "batch" to drain.',
  },
  {
    module: 'inference', item: 'inf.kvmem', title: 'Your pages on the board',
    text: 'And your KV cache? It lives here, in fixed-size pages next to everyone else’s — Bob owns most of the board, Alice’s freed pages sit outlined, and yours grow by one slot per tick.',
  },
  {
    module: 'memory', item: 'mem.inpkg', title: 'Where those pages physically are',
    text: 'Those pages are not an abstraction. They are charge in DRAM towers stacked beside the die — along with ~180 GB of weights that streamed through the compute units on every single tick of your row.',
  },
  {
    module: 'memory', item: 'mem.onchip', title: 'Where the math happened',
    text: 'The attention arcs and FFN votes ran here: tiles on the die, each with 256 KB of registers and 228 KB of scratchpad, pulling from a 50 MB L2. Zoom far enough and a single stored bit is six transistors.',
  },
  {
    module: 'memory', item: 'mem.system', title: 'The slow floors below',
    text: 'Below HBM, the staircase keeps going: DIMM slots, NVMe sticks, a CXL card. The model’s checkpoint loaded from those sticks this morning; if HBM ever fills, pages spill down the dashed path — and every tick feels it.',
  },
  {
    module: 'rack', item: 'rk.gpu', title: 'The physical object',
    text: 'All of it — your arcs, ticks, and pages — happened on this: two reticle-limit dies bridged into one GPU, ringed by eight HBM towers, drinking over a thousand amps under a liquid cold plate.',
  },
  {
    module: 'rack', item: 'rk.rack', title: 'And the machine it lives in',
    text: 'That GPU is one of 72 in the rack, wired into one machine by 5,000 copper cables and cooled by 132 kW of flowing liquid. One sentence, one second, one rack. That’s inference — now go drill it.',
  },
]

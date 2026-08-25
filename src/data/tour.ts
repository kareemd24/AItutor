// The Grand Tour: one request — "The capital of France is" — followed from
// keystroke to silicon, across four modules. Each step focuses one place on
// one map; the narration is the connective tissue between them.

export interface TourStep {
  module: string
  /** item to focus; omit for the module's fitted overview */
  item?: string
  title: string
  text: string
  insight?: string
}

export const TOUR: TourStep[] = [
  {
    module: 'tokenpath', title: 'You hit enter',
    text: 'You type "The capital of France is" and press enter. Over the next milliseconds to seconds, that sentence may cross a tokenizer, a neural network, a serving scheduler, several memory tiers, and a rack-scale system. Follow it.',
    insight: 'Every product-level promise—quality, responsiveness, price, privacy—maps to choices somewhere along this physical and software path.',
  },
  {
    module: 'tokenpath', item: 'tp.tok', title: 'It becomes 5 tokens',
    text: 'In this GPT-style example, the tokenizer chops 24 characters into five chips — "The", " capital", " of", " France", " is" — and looks up each ID. Another tokenizer may split the same sentence differently.',
  },
  {
    module: 'tokenpath', item: 'tp.embed', title: 'Tokens become geometry',
    text: 'Each ID indexes a learned vector—thousands of numbers in many models. It is a starting coordinate, not a dictionary definition; later layers turn it into a context-specific representation.',
  },
  {
    module: 'tokenpath', item: 'tp.prefill', title: 'Prefill: everything at once',
    text: 'All five vectors can be processed in parallel through each layer—one compute-heavy prefill phase. Long documents use the same logical pattern, though serving systems often split them into chunks to control memory and latency.',
    insight: 'Prompt length is a cost and latency variable. Retrieval and prompt design can create value by sending the model fewer, more relevant tokens.',
  },
  {
    module: 'tokenpath', item: 'tp.attnex', title: 'Attention finds France',
    text: 'Inside each layer, each position can attend to earlier positions. The arcs are illustrative: one head might place 0.61 on " France" and 0.28 on " capital", while other heads and layers learn different relationships.',
  },
  {
    module: 'tokenpath', item: 'tp.ffnex', title: 'The FFN transforms that context',
    text: 'Attention has already made the “is” position aware of “capital” and “France.” Its feed-forward network now expands that one position into a wider temporary workspace, smoothly gates learned feature combinations, compresses them into an update, and adds the update back. Repeating this across layers can make a city-name continuation more likely—it does not fetch a single stored France fact.',
  },
  {
    module: 'tokenpath', item: 'tp.cache', title: 'The cache fills behind it',
    text: 'As the five tokens move through, each layer stores keys and values in the KV cache. Standard decode can reuse those states instead of recomputing the earlier prompt positions.',
  },
  {
    module: 'tokenpath', item: 'tp.ttft', title: 'The first token appears',
    text: 'After the final layer, the model scores the vocabulary and this illustration selects " Paris". Queueing, prefill, and the first decode step together determine the time to first token you perceive.',
    insight: 'Time to first token is the responsiveness metric. Compare it at realistic prompt lengths, concurrency, and tail percentiles—not only on an idle chip.',
  },
  {
    module: 'tokenpath', item: 'tp.decode', title: 'Then the loop',
    text: '" Paris" is appended and the newest position circles the track: attention reads the cache, the FFN runs, logits are filtered, and a token is selected. Standard generation advances one token per step; large weight tensors are often streamed from HBM each step.',
  },
  {
    module: 'tokenpath', item: 'tp.stream', title: '"Paris" reaches your screen',
    text: 'Each lap’s token streams out the moment it exists. The typing effect you watch in a chat window is this loop, made visible. Now zoom out — because none of this happened on a private machine.',
  },
  {
    module: 'inference', title: 'Zoom out: you shared that GPU',
    text: 'Here is the same interval from the operator’s side: one serving worker’s timetable. A worker may be one GPU or a model shard across several. Rows are users; solid blocks are prefill, ticks are decoded tokens, and the amber dot is "now".',
    insight: 'The serving stack monetizes scarce accelerator time. The goal is useful tokens per dollar at a promised quality and latency.',
  },
  {
    module: 'inference', item: 'inf.you', title: 'Your thin row',
    text: 'Your whole journey — tokenize, prefill, decode, " Paris" — is this one thin row: a late arrival, a tiny burst, a short drumbeat. The scheduler’s craft is that it felt instant to you.',
  },
  {
    module: 'inference', item: 'inf.chunked', title: 'Bob never stalled you',
    text: 'The row above is Bob, who pasted a 100,000-token PDF. A scheduler can split his prefill into chunks and prioritize decode between them, reducing—but not eliminating—interference with interactive users.',
  },
  {
    module: 'inference', item: 'inf.contbatch', title: 'No slot ever idles',
    text: 'Top row: Alice’s haiku finishes mid-timeline and Dana can join on a later scheduler step. Continuous batching avoids waiting for a fixed batch to drain and helps keep the worker productive.',
  },
  {
    module: 'inference', item: 'inf.kvmem', title: 'Your pages on the board',
    text: 'And your KV cache? A paged serving system stores it in fixed-size blocks alongside other requests. Bob uses many blocks, Alice’s can be reclaimed when she finishes, and yours grows as output tokens arrive.',
  },
  {
    module: 'memory', item: 'mem.inpkg', title: 'Where those pages physically are',
    text: 'Those pages are physical bits in HBM stacks beside the compute dies, sharing capacity and bandwidth with model weights and intermediate data. Their exact footprint depends on the model architecture, precision, context, and batch.',
    insight: 'HBM is both warehouse and highway. Capacity determines what fits; bandwidth helps determine how quickly it can run.',
  },
  {
    module: 'memory', item: 'mem.onchip', title: 'Where the math happened',
    text: 'The attention arcs and FFN votes ran here: tiles on the die, each with 256 KB of registers and 228 KB of scratchpad, pulling from a 50 MB L2. Zoom far enough and a single stored bit is six transistors.',
  },
  {
    module: 'memory', item: 'mem.system', title: 'The slow floors below',
    text: 'Below HBM, the staircase keeps going: host DRAM, NVMe, and potentially CXL-attached memory. Checkpoints may load from storage; offloading can extend capacity, but slower tiers usually add a visible latency or throughput cost.',
  },
  {
    module: 'rack', item: 'rk.gpu', title: 'The physical object',
    text: 'In this GB200 example, computation lands on a Blackwell GPU with two reticle-scale dies joined in-package, surrounded by HBM and cooled by a liquid cold plate. Other inference systems use different accelerators and packaging.',
  },
  {
    module: 'rack', item: 'rk.rack', title: 'And the machine it lives in',
    text: 'That GPU is one of 72 in a DGX GB200 NVL72, connected through more than 5,000 copper cables in a rack drawing roughly 120 kW. One tiny request consumed a slice of a much larger shared system. That is inference—now go drill it.',
    insight: 'At this density, power delivery, cooling, commissioning, and network readiness can constrain deployable capacity as surely as chip supply.',
  },
]

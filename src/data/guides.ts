export interface GuideMetric {
  value: string
  label: string
  detail: string
}

export interface GuideSource {
  label: string
  publisher: string
  url: string
}

export interface ModuleGuide {
  chapter: string
  track: 'Model' | 'Economics' | 'Infrastructure'
  eyebrow: string
  thesis: string
  investorQuestion: string
  scope: string
  metrics: GuideMetric[]
  sources: GuideSource[]
}

export const MODULE_GUIDES: Record<string, ModuleGuide> = {
  tokenpath: {
    chapter: '01',
    track: 'Model',
    eyebrow: 'Start here',
    thesis: 'A model does not write a sentence in one shot. It converts text to tokens, processes the prompt in parallel, then generates output sequentially—one token at a time.',
    investorQuestion: 'Which part of the workload sets the user experience: prompt processing, generation, or memory?',
    scope: 'The token splits, attention weights, and vocabulary scores are a worked illustration. Exact values vary by tokenizer, model, prompt, and serving stack.',
    metrics: [
      { value: '2', label: 'serving phases', detail: 'Prefill digests the prompt; decode produces the answer.' },
      { value: '1', label: 'token per decode step', detail: 'Standard autoregressive generation is sequential.' },
      { value: '∝ context', label: 'KV-cache growth', detail: 'Longer conversations consume more serving memory.' },
    ],
    sources: [
      { label: 'Attention Is All You Need', publisher: 'Google Research', url: 'https://arxiv.org/abs/1706.03762' },
      { label: 'Grouped-Query Attention', publisher: 'Google Research', url: 'https://arxiv.org/abs/2305.13245' },
      { label: 'Llama 2 architecture and inference appendix', publisher: 'Meta AI', url: 'https://arxiv.org/abs/2307.09288' },
    ],
  },
  transformer: {
    chapter: '02',
    track: 'Model',
    eyebrow: 'The model',
    thesis: 'A transformer repeatedly alternates between communication across tokens (attention) and computation within each token (the feed-forward network), while a residual stream carries the state forward.',
    investorQuestion: 'Is performance coming from more parameters, more active computation, better data, or a more efficient architecture?',
    scope: 'This is a modern decoder-only transformer pattern, not a blueprint for every model. Architectures differ in normalization, activation, attention, routing, and context strategy.',
    metrics: [
      { value: 'Attention', label: 'moves information', detail: 'It is the main place token positions interact.' },
      { value: 'FFN', label: 'transforms each token', detail: 'Dense models activate the full layer; MoE routes to selected experts.' },
      { value: 'GQA', label: 'shrinks KV memory', detail: 'Fewer key/value heads reduce decode memory traffic.' },
    ],
    sources: [
      { label: 'Attention Is All You Need', publisher: 'Google Research', url: 'https://arxiv.org/abs/1706.03762' },
      { label: 'GLU Variants Improve Transformer', publisher: 'Google Research', url: 'https://arxiv.org/abs/2002.05202' },
      { label: 'Grouped-Query Attention', publisher: 'Google Research', url: 'https://arxiv.org/abs/2305.13245' },
      { label: 'The Llama 3 Herd of Models', publisher: 'Meta AI', url: 'https://arxiv.org/abs/2407.21783' },
    ],
  },
  inference: {
    chapter: '03',
    track: 'Economics',
    eyebrow: 'Serving economics',
    thesis: 'Inference is a scheduling and memory-utilization business as much as a chip-performance problem. Operators trade latency, throughput, quality, and cost on every request.',
    investorQuestion: 'Does the stack improve tokens per dollar at a fixed quality and latency—not just peak tokens per second?',
    scope: 'The timetable shows one serving worker. Large models can span several accelerators, and production schedulers make workload-dependent trade-offs.',
    metrics: [
      { value: 'TTFT', label: 'responsiveness', detail: 'Queueing plus prompt processing sets the first wait.' },
      { value: 'ITL', label: 'streaming feel', detail: 'Inter-token latency determines how smoothly text arrives.' },
      { value: 'Utilization', label: 'unit economics', detail: 'Batching and memory management drive useful output per GPU-hour.' },
    ],
    sources: [
      { label: 'PagedAttention and vLLM', publisher: 'UC Berkeley', url: 'https://arxiv.org/abs/2309.06180' },
      { label: 'Chunked prefill optimization', publisher: 'vLLM', url: 'https://docs.vllm.ai/en/latest/configuration/optimization.html' },
      { label: 'Accelerating decoding with speculative sampling', publisher: 'Google DeepMind', url: 'https://arxiv.org/abs/2302.01318' },
      { label: 'FlashAttention', publisher: 'Stanford University', url: 'https://arxiv.org/abs/2205.14135' },
    ],
  },
  training: {
    chapter: '04',
    track: 'Economics',
    eyebrow: 'Model creation',
    thesis: 'Training turns data and compute into a reusable model asset. Pretraining builds broad capability; post-training shapes behavior and can specialize it for valuable tasks.',
    investorQuestion: 'Which advantage is defensible: proprietary data, training efficiency, evaluation loops, distribution, or access to compute?',
    scope: 'The “Paris” example traces one token-level loss. Real training averages many tokens and examples across large batches and distributed systems.',
    metrics: [
      { value: 'Loss', label: 'learning signal', detail: 'Training raises the probability of observed continuations.' },
      { value: 'Data × compute', label: 'scaling input', detail: 'Model size alone does not determine capability.' },
      { value: 'All-reduce', label: 'network tax', detail: 'Distributed training repeatedly synchronizes gradients.' },
    ],
    sources: [
      { label: 'Compute-optimal large language models', publisher: 'Google DeepMind', url: 'https://arxiv.org/abs/2203.15556' },
      { label: 'Direct Preference Optimization', publisher: 'Stanford University', url: 'https://arxiv.org/abs/2305.18290' },
      { label: 'Llama 2 training and alignment', publisher: 'Meta AI', url: 'https://arxiv.org/abs/2307.09288' },
    ],
  },
  silicon: {
    chapter: '05',
    track: 'Infrastructure',
    eyebrow: 'Compute design',
    thesis: 'AI chips win by keeping matrix engines fed. Architecture, memory bandwidth, interconnect, software, packaging, yield, and power all determine delivered performance.',
    investorQuestion: 'Is the advantage peak FLOPs, delivered utilization, memory capacity, software adoption, supply, or total system cost?',
    scope: 'The GPU is H100-style and the ASIC is TPU-v3-style. They are concrete examples, not specifications for every accelerator generation.',
    metrics: [
      { value: '3.35 TB/s', label: 'H100 SXM bandwidth', detail: 'A generation-specific example of the memory feed.' },
      { value: '128×128', label: 'TPU v3 array', detail: 'A systolic-array example, not a universal TPU size.' },
      { value: 'CoWoS', label: 'package as system', detail: 'Fine interconnects place logic beside HBM.' },
    ],
    sources: [
      { label: 'Hopper architecture in depth', publisher: 'NVIDIA', url: 'https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/' },
      { label: 'Cloud TPU system architecture', publisher: 'Google Cloud', url: 'https://cloud.google.com/tpu/docs/system-architecture-tpu-vm' },
      { label: 'CoWoS advanced packaging', publisher: 'TSMC', url: 'https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm' },
    ],
  },
  memory: {
    chapter: '06',
    track: 'Infrastructure',
    eyebrow: 'The bottleneck',
    thesis: 'Compute is only useful when data arrives on time. Each memory tier trades speed, capacity, power, and cost, making bandwidth a first-class driver of AI economics.',
    investorQuestion: 'Which tier is actually limiting the workload—and does the proposed solution move or merely relocate that bottleneck?',
    scope: 'Capacities and bandwidths are representative hardware examples. Real performance depends on access patterns, precision, batching, kernels, and achieved—not peak—bandwidth.',
    metrics: [
      { value: 'Fast ↔ big', label: 'the core trade-off', detail: 'The fastest memory is scarce and expensive.' },
      { value: 'FLOPs/byte', label: 'arithmetic intensity', detail: 'This predicts compute-bound versus bandwidth-bound work.' },
      { value: 'HBM', label: 'scarce serving pool', detail: 'Weights and KV cache compete for capacity.' },
    ],
    sources: [
      { label: 'H100 product specifications', publisher: 'NVIDIA', url: 'https://www.nvidia.com/en-us/data-center/h100/' },
      { label: 'Hopper tuning guide', publisher: 'NVIDIA', url: 'https://docs.nvidia.com/cuda/hopper-tuning-guide/' },
      { label: 'FlashAttention', publisher: 'Stanford University', url: 'https://arxiv.org/abs/2205.14135' },
    ],
  },
  rack: {
    chapter: '07',
    track: 'Infrastructure',
    eyebrow: 'Rack-scale system',
    thesis: 'At the frontier, the product is no longer a chip. It is a liquid-cooled, power-dense rack whose accelerators, CPUs, memory, switches, cables, and software operate as one system.',
    investorQuestion: 'Can power, cooling, networking, installation, and uptime scale as quickly as accelerator shipments?',
    scope: 'This module is specifically a DGX GB200 NVL72. Blackwell Ultra (GB300) changes memory, power, and shelf counts; vendor reference designs also differ from installed systems.',
    metrics: [
      { value: '72', label: 'Blackwell GPUs', detail: 'Spread across 18 compute trays in one NVLink domain.' },
      { value: '130 TB/s', label: 'aggregate NVLink', detail: 'Vendor-rated all-to-all GPU bandwidth.' },
      { value: '≈120 kW', label: 'rack power', detail: 'Infrastructure, not only silicon, constrains deployment.' },
    ],
    sources: [
      { label: 'DGX GB rack hardware guide', publisher: 'NVIDIA', url: 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html' },
      { label: 'GB200 NVL72 platform', publisher: 'NVIDIA', url: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/' },
      { label: 'GB200 NVL72 open rack design', publisher: 'NVIDIA', url: 'https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project/' },
    ],
  },
  datacenter: {
    chapter: '08',
    track: 'Infrastructure',
    eyebrow: 'Cluster scale',
    thesis: 'Networks turn racks into clusters. The economic objective is not headline link speed; it is keeping expensive accelerators productive through predictable, resilient communication.',
    investorQuestion: 'What happens to useful accelerator time when the cluster grows—and what power and reliability tax does the network impose?',
    scope: 'Topology and reach drive technology choice. InfiniBand and Ethernet/RoCE coexist; copper, pluggable optics, LPO, and co-packaged optics occupy different distances and maturity points.',
    metrics: [
      { value: 'Scale-up', label: 'inside a fast domain', detail: 'Tight model parallelism favors the fastest links.' },
      { value: 'Scale-out', label: 'between systems', detail: 'RDMA fabrics connect racks and clusters.' },
      { value: '3.5×', label: 'CPO efficiency claim', detail: 'NVIDIA’s platform claim versus traditional pluggables; not universal.' },
    ],
    sources: [
      { label: 'RoCE in NVIDIA networking docs', publisher: 'NVIDIA', url: 'https://networking-docs.nvidia.com/mlnxofedswum/586042lts/rdma-over-converged-ethernet-roce' },
      { label: 'Spectrum-X and Quantum-X photonics', publisher: 'NVIDIA', url: 'https://nvidianews.nvidia.com/news/nvidia-spectrum-x-co-packaged-optics-networking-switches-ai-factories' },
      { label: 'Co-packaged optics overview', publisher: 'Broadcom', url: 'https://www.broadcom.com/info/optics/cpo' },
    ],
  },
}

export const INVESTOR_NOTES: Record<string, string> = {
  'tp.tok': 'Tokens are the meter for context limits, latency, and most usage-based pricing. Tokenizer efficiency therefore has direct product and cost consequences.',
  'tp.embed': 'Embeddings make search and retrieval possible, but the input embedding is only a starting coordinate; contextual meaning is built in later layers.',
  'tp.prefill': 'Long prompts raise time-to-first-token and compute demand. Retrieval quality, prompt design, and prefix reuse can materially change serving cost.',
  'tp.decode': 'Standard decode is sequential, so latency compounds token by token. This is why bandwidth, batching, and speculation matter so much to inference margins.',
  'tp.cache': 'KV capacity limits how many long conversations can run together. More context can improve the product while reducing concurrency and raising cost.',
  'tf.attn': 'Long context is not free: attention work and KV traffic grow with sequence length, though kernels and newer attention patterns can soften the bill.',
  'tf.kvcache': 'KV-cache efficiency links model architecture directly to serving economics. GQA and related designs trade a small architectural constraint for much lower memory demand.',
  'tf.moe': 'MoE separates total parameters from active parameters. Investors should ask which number is being quoted and whether routing and communication erase the theoretical savings.',
  'tf.residual': 'Model depth works because each block adds a refinement instead of rebuilding the representation. Stable optimization is an architectural asset, not just a training trick.',
  'inf.ttft': 'TTFT shapes whether an AI product feels responsive. Report it at realistic queue depth and prompt length, not only on an idle accelerator.',
  'inf.tpot': 'Inter-token latency is the cadence users perceive after output begins. Tokens per second is its reciprocal, but averages can hide tail latency.',
  'inf.chunked': 'Scheduling software can turn the same silicon into a better service by protecting interactive decode from large prompt bursts.',
  'inf.contbatch': 'Continuous batching raises utilization by admitting and retiring requests dynamically. Higher throughput only matters if latency objectives still hold.',
  'inf.paged': 'Paged KV management reduces fragmentation and enables larger batches. The published vLLM gains are benchmark results, not a guaranteed multiplier for every stack.',
  'inf.spec': 'Speculation pays when draft and target agree. Speedup depends on acceptance rate, target workload, hardware, and the cost of the draft model.',
  'inf.quant': 'Lower precision cuts memory footprint and traffic, often improving cost per token. The diligence question is quality at the target model and workload.',
  'inf.disagg': 'Separate prefill and decode pools can match hardware to each phase, but introduce KV-transfer, networking, and scheduling complexity.',
  'tr.data': 'Data quality and evaluation loops can be more defensible than raw token volume. Deduplication, provenance, rights, and domain coverage all matter.',
  'tr.scaling': 'Scaling laws are planning tools, not destiny. The economically relevant frontier includes training cost, future inference cost, and data availability.',
  'tr.dpo': 'Preference methods differ in complexity and stability. The durable asset is often the feedback and evaluation pipeline, not the optimizer acronym.',
  'tr.rlvr': 'Verifiable rewards can create powerful improvement loops in domains with reliable checkers, especially code and math. Coverage outside checkable domains remains harder.',
  'tr.allreduce': 'As clusters grow, communication can strand compute. Fabric quality and parallelism software determine how much of purchased accelerator time becomes useful training.',
  'si.gpu': 'Programmability and a mature software ecosystem can outweigh a purpose-built chip’s theoretical efficiency, especially while workloads are changing quickly.',
  'si.asic': 'ASIC economics improve with workload stability, high utilization, and sufficient volume. Flexibility and developer adoption are the counterweights.',
  'si.tensor': 'Peak tensor FLOPs are a ceiling. Delivered performance depends on feeding the units, numerical format, kernel quality, and workload shape.',
  'si.hbm': 'HBM capacity and bandwidth increasingly gate model size and throughput, making packaging and memory supply strategic parts of the accelerator market.',
  'si.interposer': 'Advanced packaging is now a performance technology and a supply constraint. Logic, HBM, substrate, interposer, assembly, and yield must all scale together.',
  'si.chiplet': 'Chiplets can improve yield and design reuse, but shift risk into die-to-die links, packaging complexity, thermal design, and test.',
  'mem.hbm': 'HBM is both a capacity pool and a bandwidth feed. A model that fits can still run poorly if it cannot move bytes fast enough.',
  'mem.roofline': 'Arithmetic intensity is a fast diligence test: it explains why a benchmark may benefit from more FLOPs—or barely move at all.',
  'mem.wall': 'Compute capability has often advanced faster than data movement. Memory, packaging, and interconnect can therefore capture disproportionate value.',
  'mem.cxl': 'Memory expansion can improve capacity economics, but latency and bandwidth make it a tier—not a drop-in substitute for HBM.',
  'rk.rack': 'A rack-scale system shifts value toward power delivery, cooling, integration, commissioning, and service. Facility readiness can delay recognized compute capacity.',
  'rk.nvswtray': 'Scale-up bandwidth lets larger models behave as one tightly coupled system. It also creates a scheduling boundary that operators must keep well utilized.',
  'rk.backplane': 'Copper saves power at short reach, while optics wins with distance. The boundary moves with signaling speed, thermals, and packaging.',
  'rk.manifold': 'Liquid cooling is an enabling system, not an accessory, at this density. Reliability, water temperature, serviceability, and retrofit cost matter.',
  'rk.gpu': 'The sellable unit bundles compute dies, HBM, packaging, power delivery, cooling, and interconnect. Bottlenecks in any one can cap shipments.',
  'dc.nvlink': 'Scale-up links are a scarce high-speed domain. Model placement that crosses the boundary can suffer a sharp communication penalty.',
  'dc.roce': 'Ethernet brings ecosystem breadth; high-performance RoCE still requires disciplined congestion control and operations. “Ethernet” alone does not specify delivered AI performance.',
  'dc.clos': 'A non-blocking fabric is expensive because bandwidth is provisioned across layers. Oversubscription improves cost but can reduce distributed-job performance.',
  'dc.xcvr': 'At cluster scale, optical modules become a material power, cost, and failure domain. Link count matters as much as price per module.',
  'dc.cpo': 'Co-packaged optics promises better power and density by shortening electrical paths. Maturity, service model, laser reliability, and ecosystem adoption remain diligence items.',
}

export function guideFor(moduleId: string): ModuleGuide {
  return MODULE_GUIDES[moduleId]
}

export function investorNoteFor(itemId: string): string | undefined {
  return INVESTOR_NOTES[itemId]
}

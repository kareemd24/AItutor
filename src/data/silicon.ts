import type { ModuleDef, Shape } from '../types'

// Drawn from real chips: the GPU die is an H100-style floorplan (SM banks,
// the split 50 MB L2 in the middle, HBM PHYs on the edges), the ASIC is a
// TPU-style layout around a 128×128 systolic array, and the package is a
// CoWoS cross-section — interposer, HBM towers, bumps and balls.

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`

// ---- GPU die floorplan (H100-ish) ----------------------------------------
const gpuArt: Shape[] = [
  { t: 'rect', x: 85, y: 80, w: 350, h: 245, r: 3, f: 'rgba(15,23,42,0.5)', s: sky(0.5), lw: 1.4 },
  // HBM PHYs along both die edges
  { t: 'rect', x: 87, y: 92, w: 9, h: 220, f: amber(0.3), s: amber(0.4), lw: 0.8 },
  { t: 'rect', x: 424, y: 92, w: 9, h: 220, f: amber(0.3), s: amber(0.4), lw: 0.8 },
  // SM banks above and below the L2 band
  ...Array.from({ length: 28 }, (_, i): Shape => (
    { t: 'rect', x: 103 + (i % 14) * 23, y: 90 + Math.floor(i / 14) * 42, w: 20, h: 38, r: 1.5, f: sky(0.08), s: sky(0.35), lw: 0.7 }
  )),
  ...Array.from({ length: 28 }, (_, i): Shape => (
    { t: 'rect', x: 103 + (i % 14) * 23, y: 238 + Math.floor(i / 14) * 42, w: 20, h: 38, r: 1.5, f: sky(0.08), s: sky(0.35), lw: 0.7 }
  )),
  // tensor core hint inside each SM, deep zoom
  ...Array.from({ length: 14 }, (_, i): Shape[] => ([
    { t: 'rect', x: 108 + i * 23, y: 100, w: 10, h: 8, f: amber(0.5), lod: 2.3 },
    { t: 'rect', x: 108 + i * 23, y: 248, w: 10, h: 8, f: amber(0.5), lod: 2.3 },
  ])).flat(),
  // the "funny" split L2: two 25 MB halves in the middle band
  { t: 'rect', x: 150, y: 178, w: 100, h: 52, r: 2, f: violet(0.18), s: violet(0.5), lw: 1 },
  { t: 'rect', x: 272, y: 178, w: 100, h: 52, r: 2, f: violet(0.18), s: violet(0.5), lw: 1 },
  { t: 'text', x: 200, y: 204, text: '25 MB', size: 8, f: violet(0.7), align: 'center', lod: 1.5 },
  { t: 'text', x: 322, y: 204, text: '25 MB', size: 8, f: violet(0.7), align: 'center', lod: 1.5 },
]

// ---- TPU-style ASIC layout -----------------------------------------------
const asicArt: Shape[] = [
  { t: 'rect', x: 565, y: 75, w: 355, h: 250, r: 3, f: 'rgba(15,23,42,0.5)', s: violet(0.5), lw: 1.4 },
  // the systolic array: a lockstep grid
  { t: 'rect', x: 585, y: 92, w: 210, h: 180, r: 2, f: violet(0.08), s: violet(0.5), lw: 1 },
  ...Array.from({ length: 6 }, (_, i): Shape[] => ([
    { t: 'line', pts: [585 + (i + 1) * 30, 92, 585 + (i + 1) * 30, 272], s: violet(0.3), lw: 0.7 },
    { t: 'line', pts: [585, 92 + (i + 1) * 25.7, 795, 92 + (i + 1) * 25.7], s: violet(0.3), lw: 0.7 },
  ])).flat(),
  ...Array.from({ length: 36 }, (_, i): Shape => (
    { t: 'rect', x: 592 + (i % 6) * 30, y: 98 + Math.floor(i / 6) * 25.7, w: 16, h: 13, f: violet(0.35), lod: 1.9 }
  )),
  // data marches in from the left, weights from the top
  { t: 'line', pts: [568, 130, 583, 130], s: amber(0.7), lw: 1.5 },
  { t: 'line', pts: [568, 180, 583, 180], s: amber(0.7), lw: 1.5 },
  { t: 'line', pts: [568, 230, 583, 230], s: amber(0.7), lw: 1.5 },
  { t: 'line', pts: [630, 78, 630, 90], s: sky(0.7), lw: 1.5 },
  { t: 'line', pts: [690, 78, 690, 90], s: sky(0.7), lw: 1.5 },
  { t: 'line', pts: [750, 78, 750, 90], s: sky(0.7), lw: 1.5 },
  // vector unit and SRAM buffers beside the array
  { t: 'rect', x: 815, y: 92, w: 100, h: 80, r: 2, f: sky(0.12), s: sky(0.5), lw: 1 },
  { t: 'rect', x: 815, y: 188, w: 100, h: 84, r: 2, f: amber(0.1), s: amber(0.5), lw: 1 },
  // inter-chip links along the bottom edge
  { t: 'rect', x: 585, y: 288, w: 330, h: 22, r: 2, f: slate(0.12), s: slate(0.4), lw: 1 },
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 600 + i * 40, y: 293, w: 24, h: 12, f: slate(0.4), lod: 1.8 }
  )),
]

// ---- CoWoS package cross-section -----------------------------------------
const hbmTower = (x: number): Shape[] => ([
  // 4 DRAM dies stacked on a base logic die
  ...Array.from({ length: 4 }, (_, i): Shape => (
    { t: 'rect', x, y: 452 + i * 11, w: 54, h: 9, r: 1, f: slate(0.28), s: slate(0.5), lw: 0.7 }
  )),
  { t: 'rect', x, y: 496, w: 54, h: 10, r: 1, f: slate(0.4), s: slate(0.6), lw: 0.8 },
  // TSVs drilled through the stack, deep zoom
  ...Array.from({ length: 4 }, (_, i): Shape => (
    { t: 'line', pts: [x + 12 + i * 10, 452, x + 12 + i * 10, 506], s: amber(0.55), lw: 0.8, lod: 2 }
  )),
])

const pkgArt: Shape[] = [
  // substrate, interposer, compute die
  { t: 'rect', x: 170, y: 528, w: 660, h: 20, r: 2, f: 'rgba(30,41,59,0.8)', s: slate(0.4), lw: 1 },
  { t: 'rect', x: 200, y: 508, w: 600, h: 14, r: 1, f: sky(0.22), s: sky(0.55), lw: 1 },
  { t: 'rect', x: 450, y: 470, w: 100, h: 34, r: 1, f: amber(0.3), s: amber(0.7), lw: 1.2 },
  { t: 'text', x: 500, y: 487, text: 'compute die', size: 7, f: amber(0.9), align: 'center', lod: 1.4 },
  // HBM towers flanking it
  ...hbmTower(240), ...hbmTower(310), ...hbmTower(630), ...hbmTower(700),
  // microbumps on the interposer, C4 bumps under it, BGA balls under substrate
  ...Array.from({ length: 20 }, (_, i): Shape => (
    { t: 'circle', cx: 215 + i * 30, cy: 506, r: 1.5, f: slate(0.5), lod: 1.9 }
  )),
  ...Array.from({ length: 14 }, (_, i): Shape => (
    { t: 'circle', cx: 220 + i * 42, cy: 525, r: 2.5, f: slate(0.45), lod: 1.7 }
  )),
  ...Array.from({ length: 13 }, (_, i): Shape => (
    { t: 'circle', cx: 200 + i * 48, cy: 554, r: 4, f: slate(0.4), lod: 1.4 }
  )),
]

export const silicon: ModuleDef = {
  id: 'silicon',
  title: 'Silicon: GPUs, ASICs & Packaging',
  tagline: 'Concrete design patterns: an H100-style GPU, a TPU-v3-style systolic array, and a CoWoS package cross-section.',
  world: { w: 1000, h: 620 },
  items: [
    {
      id: 'si.gpu', name: 'GPU die', kind: 'container', zone: 'Two philosophies',
      x: 260, y: 200, w: 400, h: 300, art: gpuArt,
      note: 'The programmable answer, H100 SXM edition: an 814 mm² die with 132 enabled streaming multiprocessors and 50 MB of L2. GPU value also comes from software and workload breadth.' ,
    },
    { id: 'si.sm', name: 'Streaming multiprocessor (SM)', kind: 'atom', parent: 'si.gpu', zone: 'Two philosophies', x: 150, y: 122, hitR: 30, ldy: -24,
      note: 'The repeated tile — 132 copies on an H100. Each has its own 256 KB register file, scratchpad, and four tensor cores; kernels are sliced to fill them all.' },
    { id: 'si.tensor', name: 'Tensor core', kind: 'atom', parent: 'si.gpu', zone: 'Two philosophies', x: 255, y: 122, hitR: 25, ldy: 24,
      note: 'A small matrix-multiply engine, four per SM — nearly all AI FLOPs happen in these, in BF16/FP8 precision. Zoom into the SMs to spot them.',
      role: 'does nearly all the AI matrix math inside each SM' },
    { id: 'si.cuda', name: 'CUDA cores', kind: 'atom', parent: 'si.gpu', zone: 'Two philosophies', x: 360, y: 122, hitR: 25,
      note: 'The scalar lanes for everything that isn’t a matmul — softmax, norms, glue. Tensor cores lift, CUDA cores plumb.' },
    { id: 'si.l2', name: 'L2 cache (50 MB)', kind: 'atom', parent: 'si.gpu', zone: 'Two philosophies', x: 261, y: 204, hitR: 40,
      note: 'Fifty megabytes in two 25 MB halves across the middle of the die — an SM reaching the far half pays extra latency. The last stop before HBM.' },
    { id: 'si.shmem', name: 'Shared memory / L1', kind: 'atom', parent: 'si.gpu', zone: 'Two philosophies', x: 150, y: 270, hitR: 30,
      note: 'Up to 228 KB of software-managed scratchpad per SM — the fast tiles FlashAttention computes in.' },
    { id: 'si.phy', name: 'HBM PHYs', kind: 'atom', parent: 'si.gpu', zone: 'Two philosophies', x: 91, y: 200, hitR: 14,
      note: 'The die-edge circuits that talk to the HBM towers across the interposer — ten memory controllers driving a 5,120-bit bus.' },

    {
      id: 'si.asic', name: 'AI ASIC (TPU-style)', kind: 'container', zone: 'Two philosophies',
      x: 740, y: 200, w: 400, h: 300, art: asicArt,
      note: 'The specialized answer: a chip organized around large matrix engines, trading some generality for efficiency on targeted machine-learning workloads.',
      role: 'targets machine-learning workloads with a more specialized dataflow',
    },
    { id: 'si.systolic', name: 'Systolic array', kind: 'atom', parent: 'si.asic', zone: 'Two philosophies', x: 690, y: 182, hitR: 70,
      note: 'A 128×128 lockstep grid — 16,384 multiply-accumulates per clock. Weights load from the top, data marches in from the left, results pulse out like a heartbeat.',
      role: 'multiplies matrices with a lockstep grid of 16,384 multiply-accumulate units' },
    { id: 'si.vector', name: 'Vector unit', kind: 'atom', parent: 'si.asic', zone: 'Two philosophies', x: 865, y: 130, hitR: 40,
      note: 'Handles the non-matmul math — softmax, activations, norms — that the systolic array can’t express.' },
    { id: 'si.srambuf', name: 'On-chip SRAM buffers', kind: 'atom', parent: 'si.asic', zone: 'Two philosophies', x: 865, y: 230, hitR: 40,
      note: 'Big software-scheduled staging memory that keeps the array fed — the compiler, not hardware, decides what lives here and when.' },
    { id: 'si.ici', name: 'Inter-chip interconnect', kind: 'atom', parent: 'si.asic', zone: 'Two philosophies', x: 750, y: 299, hitR: 60,
      note: 'Direct chip-to-chip links along the die edge, wiring ASICs into a 3D torus — the pod is the computer, no Ethernet in sight.' },

    {
      id: 'si.pkg', name: 'The package (CoWoS)', kind: 'container', zone: 'Putting it together',
      x: 500, y: 480, w: 800, h: 200, art: pkgArt,
      note: 'A CoWoS package in cross-section: compute die and HBM towers on a silicon interposer, on a substrate, on the board — packaging is now half the performance story.',
    },
    { id: 'si.hbm', name: 'HBM stack', kind: 'atom', parent: 'si.pkg', zone: 'Putting it together', x: 267, y: 470, hitR: 35, lalign: 'right' as const,
      note: 'DRAM dies stacked beside compute. H100 SXM uses five active HBM3 stacks for 80 GB at 3.35 TB/s; B200 products provide up to 180 GB, with bandwidth depending on the exact Blackwell configuration.',
      role: 'stacks DRAM beside the compute die to hold weights and KV cache' },
    { id: 'si.tsv', name: 'Through-silicon vias', kind: 'atom', parent: 'si.pkg', zone: 'Putting it together', x: 337, y: 470, hitR: 25, ldy: -34,
      note: 'Vertical wires drilled straight through the stacked DRAM dies — zoom into a tower to see them. The reason HBM is a tower, not a sprawl.' },
    { id: 'si.interposer', name: 'Silicon interposer', kind: 'atom', parent: 'si.pkg', zone: 'Putting it together', x: 500, y: 515, hitR: 70,
      note: 'The silicon slab everything sits on: thousands of wires far finer than any circuit board can print — that wiring is what makes a 5,120-bit memory bus possible.',
      role: 'connects the compute die to HBM through thousands of fine wires' },
    { id: 'si.chiplet', name: 'Chiplets', kind: 'atom', parent: 'si.pkg', zone: 'Putting it together', x: 790, y: 478, hitR: 25,
      note: 'Split one giant die into smaller ones stitched together in-package — better yield, and each piece on the process node it actually needs.' },
    { id: 'si.reticle', name: 'Reticle limit', kind: 'atom', parent: 'si.pkg', zone: 'Putting it together', x: 700, y: 408,
      note: '~830 mm² — the largest die one lithography exposure can print. H100 sits just under it; Blackwell answers it with two bridged dies.' },
    { id: 'si.wafer', name: 'Wafer-scale integration', kind: 'atom', parent: 'si.pkg', zone: 'Putting it together', x: 850, y: 408,
      note: 'Use most of a 300 mm wafer as one system (the Cerebras approach), reducing off-chip communication while requiring defect tolerance, specialized packaging, power delivery, and cooling.' },
  ],
}

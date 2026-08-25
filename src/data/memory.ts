import type { ModuleDef, Shape } from '../types'

// The staircase drawn as the physical assets themselves: a die floorplan with
// one SM enlarged (register file, L1) and a 6-transistor SRAM cell at deep
// zoom; a CoWoS package in side-view with "weights" and "KV pages" badges
// (the same cache from the Inference Stack); and a server board with DIMM
// slots, NVMe sticks and a CXL card. The physics corner gets a real roofline.

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`
const ink = 'rgba(226,232,240,0.9)'

// ---- on-chip: a mini die with one SM pulled out --------------------------
const onchipArt: Shape[] = [
  { t: 'rect', x: 55, y: 62, w: 290, h: 175, r: 3, f: 'rgba(15,23,42,0.5)', s: sky(0.45), lw: 1.2 },
  // SM tile rows
  ...Array.from({ length: 9 }, (_, i): Shape => (
    { t: 'rect', x: 65 + i * 24, y: 72, w: 20, h: 30, r: 1.5, f: sky(0.08), s: sky(0.3), lw: 0.7 }
  )),
  ...Array.from({ length: 5 }, (_, i): Shape => (
    { t: 'rect', x: 170 + i * 24, y: 200, w: 20, h: 30, r: 1.5, f: sky(0.08), s: sky(0.3), lw: 0.7 }
  )),
  // L2 band across the middle
  { t: 'rect', x: 110, y: 145, w: 180, h: 26, r: 2, f: violet(0.18), s: violet(0.5), lw: 1 },
  // one SM enlarged
  { t: 'line', pts: [230, 92, 256, 112], s: slate(0.4), lw: 1, dash: [3, 3] },
  { t: 'rect', x: 255, y: 110, w: 90, h: 80, r: 4, f: 'rgba(15,23,42,0.6)', s: sky(0.5), lw: 1.2 },
  { t: 'text', x: 300, y: 104, text: 'one SM, ×132', size: 5.5, f: sky(0.7), align: 'center' },
  { t: 'rect', x: 263, y: 120, w: 74, h: 16, r: 2, f: amber(0.2), s: amber(0.5), lw: 0.9 },
  { t: 'text', x: 300, y: 128, text: 'registers 256 KB', size: 5, f: ink, align: 'center' },
  { t: 'rect', x: 263, y: 142, w: 74, h: 16, r: 2, f: sky(0.18), s: sky(0.5), lw: 0.9 },
  { t: 'text', x: 300, y: 150, text: 'L1/shared 228 KB', size: 5, f: ink, align: 'center' },
  { t: 'rect', x: 263, y: 164, w: 22, h: 16, r: 2, f: amber(0.4), lod: 1.4 },
  { t: 'text', x: 296, y: 172, text: 'tensor core', size: 4.5, f: slate(0.6), lod: 1.4 },
  // a single SRAM bit, at deep zoom: six transistors
  { t: 'rect', x: 68, y: 188, w: 88, h: 44, r: 3, s: slate(0.35), lw: 0.9, lod: 1.5 },
  ...Array.from({ length: 6 }, (_, i): Shape[] => {
    const cx = 84 + (i % 3) * 26
    const cy = 200 + Math.floor(i / 3) * 20
    return [
      { t: 'line', pts: [cx - 5, cy, cx + 5, cy], s: amber(0.7), lw: 1.4, lod: 1.7 },
      { t: 'line', pts: [cx, cy - 5, cx, cy - 2], s: amber(0.5), lw: 1, lod: 1.7 },
    ]
  }).flat(),
  { t: 'line', pts: [97, 200, 110, 220], s: sky(0.4), lw: 0.8, lod: 1.9 },
  { t: 'line', pts: [110, 200, 97, 220], s: sky(0.4), lw: 0.8, lod: 1.9 },
  { t: 'text', x: 112, y: 244, text: 'one bit = 6 transistors', size: 5, f: slate(0.6), align: 'center', lod: 1.5 },
]

// ---- in-package: CoWoS side-view with the badges that tie the story ------
const hbmTower = (x: number): Shape[] => ([
  ...Array.from({ length: 3 }, (_, i): Shape => (
    { t: 'rect', x, y: 318 + i * 10, w: 34, h: 8, r: 1, f: slate(0.28), s: slate(0.5), lw: 0.7 }
  )),
  { t: 'rect', x, y: 340, w: 34, h: 8, r: 1, f: slate(0.4), s: slate(0.6), lw: 0.8 },
  ...Array.from({ length: 3 }, (_, i): Shape => (
    { t: 'line', pts: [x + 8 + i * 9, 318, x + 8 + i * 9, 348], s: amber(0.5), lw: 0.8, lod: 2 }
  )),
])

const inpkgArt: Shape[] = [
  // what actually lives in HBM — the same objects from the serving story
  { t: 'rect', x: 413, y: 212, w: 82, h: 16, r: 8, f: sky(0.12), s: sky(0.45), lw: 1 },
  { t: 'text', x: 454, y: 220, text: 'weights ~180 GB', size: 5.2, f: ink, align: 'center' },
  { t: 'rect', x: 503, y: 212, w: 82, h: 16, r: 8, f: violet(0.12), s: violet(0.45), lw: 1 },
  { t: 'text', x: 544, y: 220, text: 'your KV pages', size: 5.2, f: ink, align: 'center' },
  { t: 'line', pts: [454, 230, 443, 314], s: sky(0.35), lw: 1, dash: [3, 4] },
  { t: 'line', pts: [544, 230, 557, 314], s: violet(0.35), lw: 1, dash: [3, 4] },
  // the package itself
  { t: 'rect', x: 415, y: 362, w: 170, h: 13, r: 2, f: 'rgba(30,41,59,0.8)', s: slate(0.4), lw: 1 },
  { t: 'rect', x: 422, y: 349, w: 156, h: 10, r: 1, f: sky(0.22), s: sky(0.55), lw: 1 },
  { t: 'rect', x: 468, y: 318, w: 64, h: 28, r: 1, f: amber(0.3), s: amber(0.7), lw: 1.1 },
  { t: 'text', x: 500, y: 332, text: 'die', size: 6, f: amber(0.9), align: 'center' },
  ...hbmTower(428), ...hbmTower(538),
  { t: 'text', x: 500, y: 390, text: '≈1,024 wires per stack through the interposer', size: 5, f: slate(0.55), align: 'center', lod: 1.3 },
]

// ---- system: a server board you could point at ---------------------------
const systemArt: Shape[] = [
  { t: 'rect', x: 655, y: 348, w: 310, h: 226, r: 5, f: 'rgba(15,23,42,0.35)', s: slate(0.3), lw: 1 },
  // DIMM slots
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 672 + i * 11, y: 366, w: 7, h: 56, r: 1, f: slate(0.25), s: slate(0.45), lw: 0.8 }
  )),
  { t: 'text', x: 712, y: 434, text: 'DIMM slots', size: 5.5, f: slate(0.6), align: 'center' },
  // two NVMe sticks
  { t: 'rect', x: 845, y: 372, w: 85, h: 16, r: 3, f: slate(0.18), s: slate(0.45), lw: 0.9 },
  { t: 'rect', x: 845, y: 394, w: 85, h: 16, r: 3, f: slate(0.18), s: slate(0.45), lw: 0.9 },
  { t: 'circle', cx: 853, cy: 380, r: 2, s: slate(0.5), lw: 0.8, lod: 1.6 },
  { t: 'circle', cx: 853, cy: 402, r: 2, s: slate(0.5), lw: 0.8, lod: 1.6 },
  { t: 'text', x: 887, y: 424, text: 'checkpoints · datasets', size: 5.2, f: slate(0.6), align: 'center', lod: 1.2 },
  // CXL expander card with edge fingers
  { t: 'rect', x: 845, y: 490, w: 85, h: 34, r: 3, f: sky(0.08), s: sky(0.4), lw: 1 },
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 851 + i * 9.5, y: 524, w: 5, h: 6, f: amber(0.5), lod: 1.5 }
  )),
  // the offload path: GPU package → host DRAM → SSD
  { t: 'line', pts: [716, 440, 716, 498], s: sky(0.35), lw: 1.1, dash: [4, 4] },
  { t: 'line', pts: [716, 498, 742, 470] , s: sky(0.35), lw: 1.1, dash: [4, 4] },
  { t: 'line', pts: [742, 470, 838, 406], s: sky(0.35), lw: 1.1, dash: [4, 4] },
  { t: 'line', pts: [829, 407, 839, 405, 833, 414], s: sky(0.35), lw: 1.1 },
]

export const memory: ModuleDef = {
  id: 'memory',
  title: 'The Memory Hierarchy',
  tagline: 'The physical staircase: from six transistors on the die, down through HBM towers, to sticks on a server board.',
  world: { w: 1000, h: 620 },
  art: [
    // the staircase drawn literally, with real bandwidth at each step
    { t: 'line', pts: [40, 284, 362, 284, 362, 404, 602, 404, 602, 594, 985, 594], s: slate(0.35), lw: 2.5 },
    { t: 'text', x: 55, y: 298, text: 'on-die: tens of TB/s · megabytes', size: 8.5, f: amber(0.7) },
    { t: 'text', x: 372, y: 418, text: 'HBM3: 3.35 TB/s · gigabytes', size: 8.5, f: amber(0.6) },
    { t: 'text', x: 640, y: 608, text: 'DDR ≈ 0.5 TB/s · NVMe ≈ 0.014 TB/s · terabytes', size: 8.5, f: amber(0.5) },
    // spill path from the package down to the board
    { t: 'line', pts: [585, 355, 660, 390], s: sky(0.3), lw: 1.1, dash: [4, 4] },
    // the roofline, drawn for real
    { t: 'line', pts: [118, 472, 232, 472], s: slate(0.4), lw: 1 },
    { t: 'line', pts: [118, 408, 118, 472], s: slate(0.4), lw: 1 },
    { t: 'line', pts: [122, 466, 178, 424], s: amber(0.7), lw: 1.5 },
    { t: 'line', pts: [178, 424, 228, 424], s: amber(0.7), lw: 1.5 },
    { t: 'circle', cx: 178, cy: 424, r: 2.5, f: amber(0.9) },
    { t: 'text', x: 126, y: 448, text: 'decode', size: 5, f: slate(0.7), lod: 1.25 },
    { t: 'text', x: 192, y: 416, text: 'prefill', size: 5, f: slate(0.7), lod: 1.25 },
    { t: 'text', x: 138, y: 482, text: 'FLOPs per byte →', size: 5, f: slate(0.55), lod: 1.25 },
    // the memory wall: compute and bandwidth curves pulling apart
    { t: 'line', pts: [300, 468, 368, 414], s: amber(0.6), lw: 1.3 },
    { t: 'line', pts: [300, 468, 368, 448], s: slate(0.5), lw: 1.3 },
    { t: 'text', x: 372, y: 412, text: 'FLOPs', size: 4.8, f: amber(0.7), lod: 1.3 },
    { t: 'text', x: 372, y: 448, text: 'GB/s', size: 4.8, f: slate(0.6), lod: 1.3 },
  ],
  flows: [
    // traffic thins out at every step down
    { pts: [60, 278, 350, 278], color: amber(0.8), n: 7, speed: 120, size: 2.5 },
    { pts: [375, 398, 595, 398], color: amber(0.6), n: 3, speed: 70, size: 2.5 },
    { pts: [615, 588, 970, 588], color: amber(0.45), n: 1, speed: 40, size: 2.5 },
  ],
  items: [
    {
      id: 'mem.onchip', name: 'On-chip (SRAM)', kind: 'container', zone: 'The staircase',
      x: 200, y: 160, w: 320, h: 240, art: onchipArt,
      note: 'The die itself: megabytes at terabytes-per-second, right beside the math. One SM is pulled out so you can see where its kilobytes live.',
    },
    { id: 'mem.reg', name: 'Registers', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 300, y: 128, hitR: 10, ldx: 46,
      note: 'A 256 KB register file per H100 SM holds thread-local operands close to the execution units. Registers are the fastest programmed tier; the levels below feed and spill them.' },
    { id: 'mem.l1', name: 'Shared memory / L1', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 300, y: 150, hitR: 10, ldy: 18,
      note: 'Up to 228 KB of configurable shared memory per H100 SM, managed explicitly by kernels. Tiled algorithms such as FlashAttention exploit this on-chip tier together with registers.' },
    { id: 'mem.sram', name: 'SRAM cell', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 112, y: 212, hitR: 45,
      note: 'Zoom in: one stored bit is six transistors holding each other in place. Fast, but ~100× less dense than DRAM — the physics of why on-chip memory stays in megabytes.' },
    { id: 'mem.l2', name: 'L2 cache (50 MB)', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 200, y: 158, hitR: 60, ldy: 22, ldx: -70,
      note: 'The violet band across the die: 50 MB shared by all 132 SMs — the last line of defense before traffic spills off-chip to HBM.' },

    {
      id: 'mem.inpkg', name: 'In-package (HBM)', kind: 'container', zone: 'The staircase',
      x: 500, y: 300, w: 200, h: 200, art: inpkgArt,
      note: 'The middle step, in side-view: DRAM towers on the interposer beside the die. The badges are the same objects from the Inference Stack — this is where they physically sit.',
    },
    { id: 'mem.hbm', name: 'HBM', kind: 'atom', parent: 'mem.inpkg', zone: 'The staircase', x: 445, y: 330, hitR: 25,
      note: 'H100 SXM provides 80 GB at 3.35 TB/s; B200 products provide up to 180 GB, with bandwidth depending on configuration. Weights, KV cache, and working data compete for this pool.',
      role: 'holds the running model — its capacity decides whether the model fits at all' },
    { id: 'mem.stack', name: '3D stacking', kind: 'atom', parent: 'mem.inpkg', zone: 'The staircase', x: 555, y: 330, hitR: 25,
      note: 'Bandwidth comes from width: stacking DRAM dies vertically on ~1,024 short wires per stack, instead of a narrow bus across a circuit board.' },

    {
      id: 'mem.system', name: 'System & beyond', kind: 'container', zone: 'The staircase',
      x: 810, y: 460, w: 340, h: 260, art: systemArt,
      note: 'The bottom of the staircase, drawn as the server board it is: DIMM slots, NVMe sticks, a CXL card — enormous and cheap, but a slow bus ride from the GPU.',
    },
    { id: 'mem.ddr', name: 'Host DRAM (DDR)', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 712, y: 396, hitR: 45,
      note: 'Host DRAM offers hundreds of gigabytes to terabytes of capacity and aggregate bandwidth in the hundreds of GB/s, but it is far slower than local HBM and sits across a host link.' },
    { id: 'mem.nvme', name: 'NVMe SSD', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 887, y: 388, hitR: 45,
      note: 'A pair of fast NVMe drives may deliver roughly 14 GB/s sequentially—hundreds of times below HBM peak. Checkpoints and datasets live here, so loading is a storage and orchestration event, not a memory-speed operation.' },
    { id: 'mem.offload', name: 'Offloading', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 716, y: 470, hitR: 30,
      note: 'The dashed path represents offloading weights or KV state to slower tiers. It can make a workload fit, but transfer and prefetch behavior usually trade away latency or throughput.' },
    { id: 'mem.cxl', name: 'CXL memory expansion', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 887, y: 507, hitR: 45,
      note: 'CXL can expose additional coherent memory capacity over a PCIe-based link. It creates another tier with different latency and bandwidth; it is not a drop-in replacement for HBM.' },

    { id: 'mem.roofline', name: 'Arithmetic intensity', kind: 'atom', zone: 'The physics', x: 172, y: 445, hitR: 50,
      note: 'The roofline asks how much math happens per byte moved. Low-intensity work tends to be bandwidth-bound; higher-intensity work tends to be compute-bound. Decode and prefill often land on opposite sides, depending on batching and shape.',
      role: 'measures FLOPs per byte moved, separating compute-bound from bandwidth-bound' },
    { id: 'mem.wall', name: 'The memory wall', kind: 'atom', zone: 'The physics', x: 335, y: 440, hitR: 40,
      note: 'Peak compute has often grown faster than off-chip bandwidth, making data movement an increasingly visible limiter. Workload design and packaging determine how much of that gap is felt.' },
    { id: 'mem.bwcap', name: 'Bandwidth vs capacity', kind: 'atom', zone: 'The physics', x: 250, y: 545,
      note: 'The trade every rung makes: fast or big, never both. Each step down the staircase swaps one for the other — that’s why the staircase exists at all.' },
  ],
}

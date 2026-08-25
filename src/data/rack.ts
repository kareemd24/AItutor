import type { ModuleDef, Shape } from '../types'

// Modeled on NVIDIA's DGX GB200 NVL72 hardware guide and OCP contribution:
// 18 1U compute trays (2 Bianca boards each), 9 NVSwitch trays, redundant
// 33 kW power shelves on a DC busbar, coolant manifolds, and a 5,000+ cable
// passive-copper NVLink spine. Exploded views are intentionally schematic.

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const rose = (a: number) => `hsla(340,75%,65%,${a})`
const cyan = (a: number) => `hsla(185,80%,60%,${a})`
const emerald = (a: number) => `hsla(152,65%,55%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`

// ---- the rack, front view ------------------------------------------------
const rackArt: Shape[] = [
  // side coolant manifolds (supply left, return right)
  { t: 'rect', x: 72, y: 58, w: 8, h: 527, r: 3, f: cyan(0.25), s: cyan(0.5), lw: 1 },
  { t: 'rect', x: 320, y: 58, w: 8, h: 527, r: 3, f: cyan(0.15), s: cyan(0.4), lw: 1 },
  // DC busbar (rear, drawn at right) and the copper NVLink spine beside it
  { t: 'rect', x: 306, y: 80, w: 8, h: 495, f: amber(0.3), s: amber(0.5), lw: 1 },
  { t: 'rect', x: 294, y: 130, w: 8, h: 435, f: violet(0.2), s: violet(0.5), lw: 1 },
  // scale-out switches at the top, fibers leaving upward
  { t: 'rect', x: 86, y: 56, w: 204, h: 18, r: 3, f: sky(0.2), s: sky(0.6), lw: 1.4 },
  { t: 'line', pts: [130, 56, 122, 47], s: amber(0.7), lw: 1.4 },
  { t: 'line', pts: [175, 56, 175, 46], s: amber(0.7), lw: 1.4 },
  { t: 'line', pts: [220, 56, 228, 47], s: amber(0.7), lw: 1.4 },
  ...Array.from({ length: 11 }, (_, i): Shape => (
    { t: 'rect', x: 94 + i * 18, y: 62, w: 8, h: 7, f: amber(0.55), lod: 1.6 }
  )),
  // eight redundant 33 kW power shelves, shown as four paired rows
  ...Array.from({ length: 4 }, (_, i): Shape => (
    { t: 'rect', x: 86, y: 80 + i * 12, w: 204, h: 10, r: 2, f: rose(0.15), s: rose(0.5), lw: 1.1 }
  )),
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 92 + (i % 2) * 100, y: 82 + Math.floor(i / 2) * 12, w: 88, h: 6, s: rose(0.45), lw: 0.8, lod: 1.9 }
  )),
  // 10 compute trays (upper bank)
  ...Array.from({ length: 10 }, (_, i): Shape => (
    { t: 'rect', x: 86, y: 132 + i * 17, w: 204, h: 15, r: 2, f: violet(0.13), s: violet(0.45), lw: 1.1 }
  )),
  // 9 NVSwitch trays (middle of the rack, closest to every GPU)
  ...Array.from({ length: 9 }, (_, i): Shape => (
    { t: 'rect', x: 86, y: 306 + i * 14.5, w: 204, h: 12.5, r: 2, f: emerald(0.15), s: emerald(0.5), lw: 1.1 }
  )),
  // 8 compute trays (lower bank)
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 86, y: 440 + i * 17, w: 204, h: 15, r: 2, f: violet(0.13), s: violet(0.45), lw: 1.1 }
  )),
  // zoom in: every compute tray shows 2 Grace + 4 Blackwell
  ...Array.from({ length: 10 }, (_, t): Shape[] => ([
    { t: 'rect', x: 96, y: 135 + t * 17, w: 12, h: 9, f: sky(0.5), lod: 2.3 },
    { t: 'rect', x: 112, y: 135 + t * 17, w: 12, h: 9, f: sky(0.5), lod: 2.3 },
    ...Array.from({ length: 4 }, (_, g): Shape => (
      { t: 'rect', x: 168 + g * 28, y: 135 + t * 17, w: 20, h: 9, f: amber(0.5), lod: 2.3 }
    )),
  ])).flat(),
  ...Array.from({ length: 8 }, (_, t): Shape[] => ([
    { t: 'rect', x: 96, y: 443 + t * 17, w: 12, h: 9, f: sky(0.5), lod: 2.3 },
    { t: 'rect', x: 112, y: 443 + t * 17, w: 12, h: 9, f: sky(0.5), lod: 2.3 },
    ...Array.from({ length: 4 }, (_, g): Shape => (
      { t: 'rect', x: 168 + g * 28, y: 443 + t * 17, w: 20, h: 9, f: amber(0.5), lod: 2.3 }
    )),
  ])).flat(),
  // ...and each NVSwitch tray shows its two switch chips
  ...Array.from({ length: 9 }, (_, t): Shape[] => ([
    { t: 'rect', x: 120, y: 308 + t * 14.5, w: 40, h: 8, f: emerald(0.5), lod: 2.3 },
    { t: 'rect', x: 216, y: 308 + t * 14.5, w: 40, h: 8, f: emerald(0.5), lod: 2.3 },
  ])).flat(),
  // quick-connects on the manifolds, one per tray
  ...Array.from({ length: 18 }, (_, i): Shape => (
    { t: 'circle', cx: 76, cy: i < 10 ? 139.5 + i * 17 : 447.5 + (i - 10) * 17, r: 2.5, f: cyan(0.6), lod: 2 }
  )),
]

// ---- exploded compute tray (2 Bianca boards) -----------------------------
const trayArt: Shape[] = [
  { t: 'rect', x: 430, y: 65, w: 490, h: 205, r: 6, f: violet(0.06), s: violet(0.4), lw: 1.2 },
  // two Bianca boards side by side
  { t: 'rect', x: 445, y: 85, w: 205, h: 105, r: 4, f: slate(0.06), s: slate(0.35), lw: 1 },
  { t: 'rect', x: 665, y: 85, w: 205, h: 105, r: 4, f: slate(0.06), s: slate(0.35), lw: 1 },
  // per board: 1 Grace CPU + 2 Blackwell modules
  { t: 'rect', x: 455, y: 105, w: 42, h: 42, r: 3, f: sky(0.28), s: sky(0.6), lw: 1.2 },
  { t: 'rect', x: 675, y: 105, w: 42, h: 42, r: 3, f: sky(0.28), s: sky(0.6), lw: 1.2 },
  { t: 'rect', x: 545, y: 90, w: 44, h: 60, r: 3, f: amber(0.18), s: amber(0.55), lw: 1.2 },
  { t: 'rect', x: 597, y: 90, w: 44, h: 60, r: 3, f: amber(0.18), s: amber(0.55), lw: 1.2 },
  { t: 'rect', x: 765, y: 90, w: 44, h: 60, r: 3, f: amber(0.18), s: amber(0.55), lw: 1.2 },
  { t: 'rect', x: 817, y: 90, w: 44, h: 60, r: 3, f: amber(0.18), s: amber(0.55), lw: 1.2 },
  // LPDDR5X packages soldered around each Grace
  ...Array.from({ length: 4 }, (_, i): Shape[] => ([
    { t: 'rect', x: 455 + i * 11, y: 152, w: 8, h: 12, f: slate(0.4), lod: 1.5 },
    { t: 'rect', x: 675 + i * 11, y: 152, w: 8, h: 12, f: slate(0.4), lod: 1.5 },
  ])).flat(),
  // ConnectX NICs along the front
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 445 + i * 24, y: 215, w: 16, h: 34, r: 2, f: cyan(0.28), s: cyan(0.5), lw: 1 }
  )),
  // rear blind-mate connectors: liquid / power / NVLink
  { t: 'rect', x: 885, y: 95, w: 28, h: 18, r: 2, f: cyan(0.3), s: cyan(0.55), lw: 1 },
  { t: 'rect', x: 885, y: 120, w: 28, h: 18, r: 2, f: amber(0.3), s: amber(0.55), lw: 1 },
  { t: 'rect', x: 885, y: 145, w: 28, h: 18, r: 2, f: violet(0.3), s: violet(0.55), lw: 1 },
]

// ---- exploded Blackwell GPU module ---------------------------------------
const gpuArt: Shape[] = [
  { t: 'rect', x: 495, y: 345, w: 420, h: 200, r: 6, f: amber(0.05), s: amber(0.4), lw: 1.2 },
  // cold plate footprint
  { t: 'rect', x: 505, y: 355, w: 400, h: 150, r: 8, s: cyan(0.45), lw: 1.5 },
  // two reticle-limit dies, bridged by NV-HBI
  { t: 'rect', x: 601, y: 398, w: 60, h: 92, r: 2, f: amber(0.3), s: amber(0.8), lw: 1.5 },
  { t: 'rect', x: 669, y: 398, w: 60, h: 92, r: 2, f: amber(0.3), s: amber(0.8), lw: 1.5 },
  ...Array.from({ length: 5 }, (_, i): Shape => (
    { t: 'line', pts: [661, 410 + i * 17, 669, 410 + i * 17], s: amber(0.8), lw: 1.2, lod: 2.2 }
  )),
  // SM grid inside each die, deep zoom
  ...Array.from({ length: 3 }, (_, i): Shape[] => ([
    { t: 'line', pts: [601 + (i + 1) * 15, 398, 601 + (i + 1) * 15, 490], s: amber(0.5), lw: 0.6, lod: 2.5 },
    { t: 'line', pts: [669 + (i + 1) * 15, 398, 669 + (i + 1) * 15, 490], s: amber(0.5), lw: 0.6, lod: 2.5 },
  ])).flat(),
  ...Array.from({ length: 5 }, (_, i): Shape => (
    { t: 'line', pts: [601, 398 + (i + 1) * 15.3, 729, 398 + (i + 1) * 15.3], s: amber(0.4), lw: 0.6, lod: 2.5 }
  )),
  // 8 HBM3e stacks, four per side
  ...Array.from({ length: 4 }, (_, i): Shape[] => ([
    { t: 'rect', x: 549, y: 388 + i * 27, w: 34, h: 23, r: 2, f: slate(0.3), s: slate(0.6), lw: 1, lod: 1.4 },
    { t: 'rect', x: 747, y: 388 + i * 27, w: 34, h: 23, r: 2, f: slate(0.3), s: slate(0.6), lw: 1, lod: 1.4 },
  ])).flat(),
  // VRM stages
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 850 + (i % 2) * 24, y: 384 + Math.floor(i / 2) * 30, w: 18, h: 22, r: 2, f: rose(0.3), s: rose(0.5), lw: 1, lod: 1.4 }
  )),
  // NVLink edge fingers
  ...Array.from({ length: 24 }, (_, i): Shape => (
    { t: 'rect', x: 562 + i * 12, y: 552, w: 6, h: 18, f: amber(0.55), lod: 1.5 }
  )),
  { t: 'line', pts: [556, 550, 850, 550], s: amber(0.4), lw: 1 },
]

export const rack: ModuleDef = {
  id: 'rack',
  title: 'Inside a GPU Rack',
  tagline: 'A DGX GB200 NVL72: 72 GPUs, 9 switch trays, and roughly 120 kW—zoom from rack to package.',
  world: { w: 1000, h: 620 },
  art: [
    // leader lines: one compute tray pulls out; one Blackwell pulls out of it
    { t: 'line', pts: [290, 166, 430, 166], s: violet(0.5), lw: 1.5, dash: [6, 5] },
    { t: 'line', pts: [839, 155, 839, 345], s: amber(0.5), lw: 1.5, dash: [6, 5] },
    { t: 'text', x: 430, y: 600, text: 'zoom in — trays reveal their chips as you get closer', size: 12, f: slate(0.5), lodMax: 1.5 },
  ],
  flows: [
    // coolant: down the supply manifold, back up the return
    { pts: [76, 65, 76, 580], color: cyan(0.7), n: 6, speed: 60, size: 2.5 },
    { pts: [324, 580, 324, 65], color: cyan(0.45), n: 6, speed: 60, size: 2.5 },
    // DC power down the busbar
    { pts: [310, 85, 310, 570], color: amber(0.6), n: 5, speed: 45, size: 2 },
    // NVLink traffic pulsing through the copper spine, both ways
    { pts: [298, 140, 298, 560], color: violet(0.7), n: 6, speed: 110, size: 2 },
    { pts: [298, 560, 298, 140], color: violet(0.45), n: 6, speed: 110, size: 2 },
  ],
  items: [
    {
      id: 'rk.rack', name: 'GB200 NVL72 rack', kind: 'container', zone: 'The rack',
      x: 200, y: 320, w: 270, h: 550, art: rackArt,
      note: '72 Blackwell GPUs and 36 Grace CPUs connected in one NVLink domain—a rack-scale system drawing approximately 120 kW in NVIDIA’s hardware guide.',
    },
    { id: 'rk.uplinks', name: 'Fiber uplinks', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 122, y: 49, hitR: 22, ldy: -13,
      note: 'Everything inside the rack talks copper; these fibers heading for the leaf/spine fabric are where light takes over.' },
    { id: 'rk.tor', name: 'Top-of-rack switches', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 240, y: 65, hitR: 25, ldy: -16,
      note: 'The scale-out network switches: every tray’s NICs converge here, one hop before the spine. Zoom in to see the ports.',
      role: 'gathers every tray’s network links one hop before the spine' },
    { id: 'rk.power', name: 'Power shelves', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 188, y: 103, hitR: 28,
      note: 'Eight 33 kW power shelves use N+N redundancy to feed the DC busbar. Installed power capacity is not the same as the rack’s approximately 120 kW operating draw.' },
    { id: 'rk.busbar', name: 'DC busbar', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 310, y: 210, hitR: 16,
      note: 'A solid copper bar down the back; every tray blind-mates onto it as it slides in — there are no power cables inside the rack.',
      role: 'distributes DC power down the rack so trays need no power cables' },
    { id: 'rk.nvswtray', name: 'NVSwitch trays (×9)', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 188, y: 368, hitR: 45,
      note: 'Nine 1U trays, each with two NVSwitch chips, create the 72-GPU NVLink domain. NVIDIA rates the system at 130 TB/s of aggregate GPU communication bandwidth.',
      role: 'gives all 72 GPUs any-to-any bandwidth from the middle of the rack' },
    { id: 'rk.backplane', name: 'Copper NVLink spine', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 298, y: 480, hitR: 16,
      note: 'Cartridges hold more than 5,000 passive copper cables between GPUs and switch trays. At this short reach, copper avoids the power and conversion overhead of thousands of optical links.',
      role: 'wires every GPU to every switch tray through 5,000+ copper cables' },
    { id: 'rk.manifold', name: 'Coolant manifolds', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 76, y: 320, hitR: 20, lalign: 'right' as const,
      note: 'Supply and return manifolds use blind-mate quick-connects at each liquid-cooled tray. Facility-water temperatures and captured heat vary by deployment.',
      role: 'carries liquid that removes most of the rack’s heat' },

    {
      id: 'rk.tray', name: 'Compute tray (exploded)', kind: 'container', zone: 'Inside a compute tray',
      x: 675, y: 168, w: 510, h: 225, art: trayArt,
      note: 'One 1U tray = two Bianca boards = 2 Grace CPUs + 4 Blackwell GPUs. Eighteen of these per rack, each blind-mating power, liquid and NVLink at the rear.',
    },
    { id: 'rk.bianca', name: 'Bianca board (×2)', kind: 'atom', parent: 'rk.tray', zone: 'Inside a compute tray', x: 730, y: 78, hitR: 20, lod: 1.15,
      note: 'The unit of the tray: one Grace CPU ruling two Blackwell GPUs, joined by NVLink-C2C so CPU and GPUs share each other’s memory.' },
    { id: 'rk.grace', name: 'Grace CPU', kind: 'atom', parent: 'rk.tray', zone: 'Inside a compute tray', x: 476, y: 126, hitR: 24, lod: 1.15,
      note: 'NVIDIA’s ARM server CPU: data loading, checkpoints, and a second memory pool the GPUs can borrow over NVLink-C2C.' },
    { id: 'rk.lpddr', name: 'LPDDR5X', kind: 'atom', parent: 'rk.tray', zone: 'Inside a compute tray', x: 480, y: 160, hitR: 14, lod: 1.4,
      note: 'Up to about 500 GB of LPDDR5X per Grace in the reference configuration—slower than HBM, but a large coherent memory pool one C2C link away.' },
    { id: 'rk.nic', name: 'ConnectX NICs', kind: 'atom', parent: 'rk.tray', zone: 'Inside a compute tray', x: 535, y: 232, hitR: 70, lod: 1.15,
      note: 'The tray’s front-panel on-ramp to the scale-out network — roughly one 400G port per GPU, all RDMA.',
      role: 'gives each GPU its own RDMA on-ramp to the cluster network' },
    { id: 'rk.blindmate', name: 'Blind-mate connectors', kind: 'atom', parent: 'rk.tray', zone: 'Inside a compute tray', x: 899, y: 128, hitR: 30, lod: 1.15,
      note: 'Liquid, DC power and NVLink all mate automatically as the tray slides home — trays swap like drawers, no plumbing by hand.' },

    {
      id: 'rk.gpu', name: 'Blackwell GPU module (exploded)', kind: 'container', zone: 'Inside a Blackwell GPU',
      x: 705, y: 458, w: 450, h: 255, art: gpuArt,
      note: 'One Blackwell as it ships: two huge dies, eight memory stacks, kiloamp power delivery and a cold plate — no fans, no case.',
    },
    { id: 'rk.coldplate', name: 'Cold plate', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a Blackwell GPU', x: 545, y: 370, hitR: 24, lod: 1.3,
      note: 'The liquid-cooled metal clamped over dies and HBM — this one module dissipates ~1,200 W, more than a space heater.' },
    { id: 'rk.die', name: 'Blackwell dies (×2)', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a Blackwell GPU', x: 635, y: 444, hitR: 50, lod: 1.3,
      note: 'Two reticle-limit dies stitched by a 10 TB/s bridge (NV-HBI) so software sees one GPU — the workaround for lithography’s ~830 mm² ceiling.',
      role: 'the two bridged squares of silicon the whole rack exists to feed' },
    { id: 'rk.hbm', name: 'HBM3e stacks (×8)', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a Blackwell GPU', x: 764, y: 440, hitR: 32, lod: 1.3,
      note: 'Up to 180 GB on the B200 configuration, arranged around the compute dies. Exact capacity and bandwidth vary across Blackwell products; weights and KV cache share this local pool.' },
    { id: 'rk.vrm', name: 'VRM (power stages)', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a Blackwell GPU', x: 872, y: 430, hitR: 32, lod: 1.3,
      note: 'Regulators turning busbar DC into ~1 V at well over a thousand amps, millimeters from the dies so nothing is lost on the way.',
      role: 'steps power down to ~1 V at over a thousand amps beside the dies' },
    { id: 'rk.nvconn', name: 'NVLink 5 connector', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a Blackwell GPU', x: 705, y: 558, hitR: 55, lod: 1.3,
      note: 'Where 1.8 TB/s of NVLink leaves this module for the switch trays — the reason 72 GPUs can behave like one.' },
  ],
}

import type { ModuleDef, Shape } from '../types'

// An illustrated module: the rack is drawn as hardware, with a leader line
// pulling one compute tray out into an exploded view, and another pulling one
// GPU module out of the tray. Fine detail (ports, dies, HBM) appears as you
// zoom (lod), so "zoom into the rack" is literal.

const sky = (a: number) => `hsla(199,90%,65%,${a})`
const violet = (a: number) => `hsla(262,75%,70%,${a})`
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const rose = (a: number) => `hsla(340,75%,65%,${a})`
const cyan = (a: number) => `hsla(185,80%,60%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`

// ---- rack interior -------------------------------------------------------
const rackArt: Shape[] = [
  // rails
  { t: 'line', pts: [88, 60, 88, 580], s: slate(0.35), lw: 2 },
  { t: 'line', pts: [312, 60, 312, 580], s: slate(0.35), lw: 2 },
  // ToR switch (1U at the top)
  { t: 'rect', x: 92, y: 76, w: 216, h: 30, r: 3, f: sky(0.18), s: sky(0.6), lw: 1.5 },
  // uplink fibers leaving the rack
  { t: 'line', pts: [160, 76, 150, 56], s: amber(0.7), lw: 1.5 },
  { t: 'line', pts: [200, 76, 200, 54], s: amber(0.7), lw: 1.5 },
  { t: 'line', pts: [240, 76, 250, 56], s: amber(0.7), lw: 1.5 },
  // switch ports appear when you lean in
  ...Array.from({ length: 12 }, (_, i): Shape => (
    { t: 'rect', x: 100 + i * 17.5, y: 88, w: 9, h: 9, f: amber(0.55), lod: 1.5 }
  )),
  // 8 compute tray slots
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 92, y: 122 + i * 34, w: 216, h: 28, r: 3, f: violet(0.12), s: violet(0.45), lw: 1.2 }
  )),
  // tray handles
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'circle', cx: 104, cy: 136 + i * 34, r: 4, s: slate(0.5), lw: 1.2, lod: 1.8 }
  )),
  // zoom far enough and each tray shows its 8 GPUs
  ...Array.from({ length: 8 }, (_, tray): Shape[] =>
    Array.from({ length: 8 }, (_, g): Shape => (
      { t: 'rect', x: 122 + g * 22, y: 130 + tray * 34, w: 14, h: 12, f: amber(0.5), lod: 2.2 }
    ))
  ).flat(),
  // power shelves
  { t: 'rect', x: 92, y: 400, w: 216, h: 24, r: 3, f: rose(0.14), s: rose(0.5), lw: 1.2 },
  { t: 'rect', x: 92, y: 428, w: 216, h: 24, r: 3, f: rose(0.14), s: rose(0.5), lw: 1.2 },
  ...Array.from({ length: 6 }, (_, i): Shape => (
    { t: 'rect', x: 98 + i * 35, y: 404, w: 28, h: 16, s: rose(0.5), lw: 1, lod: 1.8 }
  )),
  // DC busbar down the back
  { t: 'rect', x: 316, y: 76, w: 8, h: 480, f: amber(0.3), s: amber(0.5), lw: 1 },
  // CDU at the bottom
  { t: 'rect', x: 92, y: 462, w: 216, h: 112, r: 4, f: cyan(0.1), s: cyan(0.5), lw: 1.2 },
  { t: 'circle', cx: 140, cy: 520, r: 18, s: cyan(0.6), lw: 2, lod: 1.4 },
  { t: 'circle', cx: 190, cy: 520, r: 18, s: cyan(0.6), lw: 2, lod: 1.4 },
  { t: 'line', pts: [220, 500, 290, 500, 290, 540, 220, 540], s: cyan(0.5), lw: 1.5, lod: 1.6 },
]

// ---- exploded compute tray ----------------------------------------------
const trayArt: Shape[] = [
  { t: 'rect', x: 430, y: 65, w: 490, h: 205, r: 6, f: violet(0.06), s: violet(0.4), lw: 1.2 },
  // two host CPUs
  { t: 'rect', x: 462, y: 96, w: 36, h: 36, r: 3, f: sky(0.25), s: sky(0.6), lw: 1.2, lod: 1.25 },
  { t: 'rect', x: 462, y: 140, w: 36, h: 36, r: 3, f: sky(0.25), s: sky(0.6), lw: 1.2, lod: 1.25 },
  // DIMM slivers
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 522 + i * 7, y: 96, w: 4, h: 80, f: slate(0.4), lod: 1.25 }
  )),
  // PCIe switches
  { t: 'rect', x: 600, y: 100, w: 32, h: 22, r: 2, f: slate(0.25), s: slate(0.5), lw: 1, lod: 1.25 },
  { t: 'rect', x: 600, y: 140, w: 32, h: 22, r: 2, f: slate(0.25), s: slate(0.5), lw: 1, lod: 1.25 },
  // 8 RDMA NICs
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 660 + i * 20, y: 94, w: 14, h: 26, r: 2, f: cyan(0.3), s: cyan(0.5), lw: 1, lod: 1.25 }
  )),
  // 4 NVSwitch chips
  ...Array.from({ length: 4 }, (_, i): Shape => (
    { t: 'rect', x: 845 + (i % 2) * 34, y: 96 + Math.floor(i / 2) * 34, w: 28, h: 28, r: 2, f: violet(0.3), s: violet(0.6), lw: 1.2, lod: 1.25 }
  )),
  // 8 GPU (SXM) sockets along the bottom of the tray
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 455 + i * 58, y: 200, w: 48, h: 55, r: 3, f: amber(0.12), s: amber(0.5), lw: 1.2 }
  )),
  // die + HBM hints inside each socket when zoomed
  ...Array.from({ length: 8 }, (_, i): Shape[] => ([
    { t: 'rect', x: 469 + i * 58, y: 214, w: 20, h: 20, f: amber(0.5), lod: 2 },
    { t: 'rect', x: 461 + i * 58, y: 214, w: 5, h: 20, f: slate(0.5), lod: 2.4 },
    { t: 'rect', x: 492 + i * 58, y: 214, w: 5, h: 20, f: slate(0.5), lod: 2.4 },
  ])).flat(),
]

// ---- exploded GPU module -------------------------------------------------
const gpuArt: Shape[] = [
  { t: 'rect', x: 495, y: 345, w: 420, h: 200, r: 6, f: amber(0.05), s: amber(0.4), lw: 1.2 },
  // cold plate footprint
  { t: 'rect', x: 508, y: 358, w: 330, h: 150, r: 8, s: cyan(0.45), lw: 1.5 },
  // die
  { t: 'rect', x: 640, y: 398, w: 92, h: 92, r: 2, f: amber(0.3), s: amber(0.8), lw: 1.5 },
  // SM grid on the die, deep zoom only
  ...Array.from({ length: 5 }, (_, i): Shape => (
    { t: 'line', pts: [640 + (i + 1) * 15.3, 398, 640 + (i + 1) * 15.3, 490], s: amber(0.5), lw: 0.7, lod: 2.4 }
  )),
  ...Array.from({ length: 5 }, (_, i): Shape => (
    { t: 'line', pts: [640, 398 + (i + 1) * 15.3, 732, 398 + (i + 1) * 15.3], s: amber(0.5), lw: 0.7, lod: 2.4 }
  )),
  // HBM stacks flanking the die
  ...Array.from({ length: 3 }, (_, i): Shape => (
    { t: 'rect', x: 596, y: 400 + i * 31, w: 34, h: 26, r: 2, f: slate(0.3), s: slate(0.6), lw: 1, lod: 1.4 }
  )),
  ...Array.from({ length: 3 }, (_, i): Shape => (
    { t: 'rect', x: 742, y: 400 + i * 31, w: 34, h: 26, r: 2, f: slate(0.3), s: slate(0.6), lw: 1, lod: 1.4 }
  )),
  // VRM stages on the right
  ...Array.from({ length: 8 }, (_, i): Shape => (
    { t: 'rect', x: 848 + (i % 2) * 24, y: 384 + Math.floor(i / 2) * 30, w: 18, h: 22, r: 2, f: rose(0.3), s: rose(0.5), lw: 1, lod: 1.4 }
  )),
  // NVLink edge-connector fingers
  ...Array.from({ length: 24 }, (_, i): Shape => (
    { t: 'rect', x: 562 + i * 12, y: 552, w: 6, h: 18, f: amber(0.55), lod: 1.5 }
  )),
  { t: 'line', pts: [556, 550, 850, 550], s: amber(0.4), lw: 1 },
]

export const rack: ModuleDef = {
  id: 'rack',
  title: 'Inside a GPU Rack',
  tagline: 'Click around a real rack, then zoom in: tray → NVSwitch board → the GPU module itself.',
  world: { w: 1000, h: 620 },
  art: [
    // leader lines: tray slot #2 pulls out into the exploded tray,
    // GPU socket #6 pulls out into the exploded module
    { t: 'line', pts: [312, 170, 430, 170], s: violet(0.5), lw: 1.5, dash: [6, 5] },
    { t: 'line', pts: [769, 258, 769, 345], s: amber(0.5), lw: 1.5, dash: [6, 5] },
    // coolant loop: CDU → trays → back
    { t: 'text', x: 340, y: 600, text: 'zoom in — smaller components appear as you get closer', size: 13, f: slate(0.5), lodMax: 1.5 },
  ],
  flows: [
    // coolant circulating from the CDU up through the trays and back
    { pts: [150, 505, 150, 130, 250, 130, 250, 505, 150, 505], color: cyan(0.7), n: 6, speed: 55, size: 2.5 },
    // power from the shelves onto the busbar and up
    { pts: [308, 412, 320, 412, 320, 100], color: amber(0.6), n: 4, speed: 40, size: 2 },
  ],
  items: [
    {
      id: 'rk.rack', name: 'The rack', kind: 'container', zone: 'The rack',
      x: 200, y: 320, w: 264, h: 544, art: rackArt,
      note: 'The unit of deployment: network out the top, power and coolant in the back, and as many GPU trays as ~120 kW of power and cooling can feed.',
    },
    { id: 'rk.uplinks', name: 'Uplinks to the fabric', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 200, y: 60, hitR: 30,
      note: 'Fiber bundles leaving the rack for the leaf/spine network — the only thing connecting these GPUs to the other ten thousand.' },
    { id: 'rk.tor', name: 'Top-of-rack switch', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 200, y: 91, hitR: 25,
      note: 'The rack’s own switch: every tray’s NICs converge here, one hop before the spine. Zoom in and you can see its ports.',
      role: 'gathers every tray’s network links one hop before the spine' },
    { id: 'rk.busbar', name: 'DC busbar', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 320, y: 300, hitR: 18,
      note: 'A solid copper spine down the back: power shelves feed it DC and every tray blind-mates onto it — no per-server power cables.',
      role: 'distributes DC power down the rack so trays need no power cables' },
    { id: 'rk.power', name: 'Power shelves', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 200, y: 414, hitR: 30,
      note: 'Shelves of rectifiers turning facility AC into the busbar’s DC — sized so one rack can pull more than a hundred kilowatts.' },
    { id: 'rk.cdu', name: 'CDU (liquid cooling)', kind: 'atom', parent: 'rk.rack', zone: 'The rack', x: 165, y: 520, hitR: 35,
      note: 'The coolant distribution unit pumps liquid through every tray’s cold plates — at these densities, air stopped being an option.',
      role: 'pumps the liquid that carries ~100 kW of heat out of the rack' },

    {
      id: 'rk.tray', name: 'Compute tray (exploded)', kind: 'container', zone: 'Inside a tray',
      x: 675, y: 168, w: 510, h: 225, art: trayArt,
      note: 'One sliding unit of compute: two host CPUs, eight GPUs, their NICs and NVSwitches — it blind-mates into power, coolant and network at the back.',
    },
    { id: 'rk.cpu', name: 'Host CPUs', kind: 'atom', parent: 'rk.tray', zone: 'Inside a tray', x: 480, y: 118, hitR: 30, lod: 1.2,
      note: 'Two CPUs run the OS, storage and data loading — support staff for the GPUs, not the stars.' },
    { id: 'rk.dimm', name: 'Host DRAM (DIMMs)', kind: 'atom', parent: 'rk.tray', zone: 'Inside a tray', x: 548, y: 136, hitR: 25, lod: 1.2,
      note: 'The host’s DDR memory: staging ground for datasets and checkpoints on their way into GPU memory.' },
    { id: 'rk.pciesw', name: 'PCIe switches', kind: 'atom', parent: 'rk.tray', zone: 'Inside a tray', x: 616, y: 131, hitR: 25, lod: 1.2,
      note: 'Fan the CPUs out to every GPU and NIC — and let GPU↔NIC traffic skip the CPU entirely on its way to the fabric.' },
    { id: 'rk.nic', name: 'RDMA NICs (×8)', kind: 'atom', parent: 'rk.tray', zone: 'Inside a tray', x: 738, y: 107, hitR: 55, lod: 1.2,
      note: 'One NIC per GPU, so each GPU has its own private full-bandwidth on-ramp to the cluster fabric.',
      role: 'gives each GPU its own private on-ramp to the cluster network' },
    { id: 'rk.nvsw', name: 'NVSwitch chips', kind: 'atom', parent: 'rk.tray', zone: 'Inside a tray', x: 876, y: 128, hitR: 35, lod: 1.2,
      note: 'A crossbar connecting all eight GPUs at full NVLink speed simultaneously — the tray-level scale-up domain.',
      role: 'connects all eight GPUs at full NVLink speed at the same time' },

    {
      id: 'rk.gpu', name: 'GPU module (exploded)', kind: 'container', zone: 'Inside a GPU module',
      x: 705, y: 458, w: 450, h: 255, art: gpuArt,
      note: 'The GPU as it actually ships (SXM/OAM): a bare package bolted to a board — no fans, no case; the tray supplies power, coolant and links.',
    },
    { id: 'rk.coldplate', name: 'Cold plate', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a GPU module', x: 545, y: 372, hitR: 25, lod: 1.3,
      note: 'The liquid-cooled metal clamped over die and HBM — a kilowatt of heat leaves through this sandwich.' },
    { id: 'rk.die', name: 'GPU die', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a GPU module', x: 686, y: 444, hitR: 45, lod: 1.3,
      note: 'The compute itself. Everything else in this rack exists to keep this square fed with data, power and coolant.',
      role: 'the square of silicon the entire rack exists to feed' },
    { id: 'rk.hbm', name: 'HBM stacks', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a GPU module', x: 759, y: 442, hitR: 30, lod: 1.3,
      note: 'The memory towers flanking the die on the same package — terabytes per second, the first stop outside the die.' },
    { id: 'rk.vrm', name: 'VRM (power stages)', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a GPU module', x: 870, y: 430, hitR: 35, lod: 1.3,
      note: 'Voltage regulators stepping busbar DC down to ~1 V at over a thousand amps, placed millimeters from the die so nothing is lost on the way.',
      role: 'steps power down to ~1 V at over a thousand amps beside the die' },
    { id: 'rk.nvconn', name: 'NVLink connector', kind: 'atom', parent: 'rk.gpu', zone: 'Inside a GPU module', x: 705, y: 558, hitR: 55, lod: 1.3,
      note: 'The edge fingers where this module’s NVLink lanes leave for the NVSwitches — the reason eight GPUs can act like one big one.' },
  ],
}

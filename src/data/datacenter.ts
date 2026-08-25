import type { ModuleDef } from '../types'

// Layout: the server (scale-up world) top-left, the cluster fabric (scale-out
// world) top-right, and the optical layer that carries the fabric spanning the
// bottom — laid out left→right as a transceiver's signal path.
const amber = (a: number) => `hsla(38,95%,60%,${a})`
const sky = (a: number) => `hsla(199,90%,65%,${a})`
const slate = (a: number) => `hsla(220,20%,70%,${a})`

export const datacenter: ModuleDef = {
  id: 'datacenter',
  title: 'The AI Datacenter & Optical Networking',
  tagline: 'How ten thousand GPUs become one computer — copper up close, light everywhere else.',
  world: { w: 1000, h: 620 },
  art: [
    // the transceiver drawn as a module: electrical in, light in the middle
    { t: 'rect', x: 240, y: 392, w: 640, h: 46, r: 6, s: slate(0.35), lw: 1.2 },
    { t: 'line', pts: [310, 415, 388, 415], s: sky(0.5), lw: 1.3 },
    { t: 'line', pts: [452, 415, 518, 415], s: sky(0.5), lw: 1.3 },
    // between modulator and photodetector, the signal is light
    { t: 'line', pts: [582, 415, 596, 408, 610, 422, 624, 408, 638, 422, 650, 415], s: amber(0.7), lw: 1.5 },
    { t: 'line', pts: [712, 415, 778, 415], s: sky(0.5), lw: 1.3 },
    { t: 'text', x: 250, y: 383, text: 'electrical', size: 7.5, f: sky(0.6), lod: 1.2 },
    { t: 'text', x: 596, y: 398, text: 'light', size: 7.5, f: amber(0.7), lod: 1.2 },
    { t: 'text', x: 800, y: 383, text: 'electrical', size: 7.5, f: sky(0.6), lod: 1.2 },
    // a leaf-spine mini-topology behind the Clos atom
    { t: 'circle', cx: 700, cy: 55, r: 4, f: slate(0.5), lod: 1.3 },
    { t: 'circle', cx: 750, cy: 55, r: 4, f: slate(0.5), lod: 1.3 },
    ...[680, 705, 745, 770].map(x => ({ t: 'circle' as const, cx: x, cy: 78, r: 3, f: sky(0.5), lod: 1.3 })),
    ...[680, 705, 745, 770].flatMap(x => ([
      { t: 'line' as const, pts: [x, 75, 700, 59], s: slate(0.3), lw: 0.7, lod: 1.3 },
      { t: 'line' as const, pts: [x, 75, 750, 59], s: slate(0.3), lw: 0.7, lod: 1.3 },
    ])),
  ],
  flows: [
    // one bit's journey through the module, end to end
    { pts: [250, 415, 415, 415, 550, 415, 680, 415, 810, 415, 870, 415], color: amber(0.75), n: 4, speed: 110, size: 2.2 },
  ],
  items: [
    {
      id: 'dc.node', name: 'The server (scale-up)', kind: 'container', zone: 'Scale-up vs scale-out',
      x: 200, y: 180, w: 320, h: 280,
      note: 'Inside one box, GPUs talk over links ~10× faster than any network — the scale-up domain where tensor parallelism lives.',
    },
    { id: 'dc.nvlink', name: 'NVLink', kind: 'atom', parent: 'dc.node', zone: 'Scale-up vs scale-out', x: 120, y: 115,
      note: 'Direct GPU-to-GPU links — 1.8 TB/s per Blackwell GPU, ~10× any NIC — the reason the chattiest parallelism stays inside the scale-up domain.',
      role: 'links GPUs directly so tensor parallelism can stay inside one server' },
    { id: 'dc.nvswitch', name: 'NVSwitch', kind: 'atom', parent: 'dc.node', zone: 'Scale-up vs scale-out', x: 280, y: 115,
      note: 'A switch chip just for NVLink, so all eight-plus GPUs in the box talk at full speed simultaneously.' },
    { id: 'dc.pcie', name: 'PCIe', kind: 'atom', parent: 'dc.node', zone: 'Scale-up vs scale-out', x: 120, y: 250,
      note: 'The general-purpose bus to the CPU, SSDs and NICs — capable, but the slow road compared to NVLink.' },
    { id: 'dc.nic', name: 'NIC (RDMA)', kind: 'atom', parent: 'dc.node', zone: 'Scale-up vs scale-out', x: 280, y: 250,
      note: 'Each GPU’s door to the cluster: RDMA writes tensors straight into a remote GPU’s memory with no CPU and no copies.',
      role: 'writes tensors directly into a remote GPU’s memory, bypassing the CPU' },

    {
      id: 'dc.fabric', name: 'The cluster fabric (scale-out)', kind: 'container', zone: 'Scale-up vs scale-out',
      x: 660, y: 150, w: 480, h: 220,
      note: 'The network that stitches thousands of servers into one machine — built around one traffic pattern: collectives.',
    },
    { id: 'dc.ib', name: 'InfiniBand', kind: 'atom', parent: 'dc.fabric', zone: 'Scale-up vs scale-out', x: 480, y: 100,
      note: 'The lossless RDMA fabric of most big training clusters — low, predictable latency at a premium price.' },
    { id: 'dc.roce', name: 'Ethernet / RoCE', kind: 'atom', parent: 'dc.fabric', zone: 'Scale-up vs scale-out', x: 600, y: 100, ldy: 24,
      note: 'RDMA over datacenter Ethernet — cheaper and open, and taking over as its congestion control matures.' },
    { id: 'dc.clos', name: 'Leaf-spine (Clos)', kind: 'atom', parent: 'dc.fabric', zone: 'Scale-up vs scale-out', x: 725, y: 100, lalign: 'right' as const,
      note: 'Every leaf switch connects to every spine, so any GPU reaches any other in a fixed number of hops at full bandwidth.',
      role: 'gives every GPU a full-bandwidth path to every other GPU' },
    { id: 'dc.tor', name: 'Top-of-rack switch', kind: 'atom', parent: 'dc.fabric', zone: 'Scale-up vs scale-out', x: 845, y: 100,
      note: 'The first hop out of the server — a rack’s worth of NICs converge here before heading to the spine.' },
    { id: 'dc.collective', name: 'All-reduce traffic', kind: 'atom', parent: 'dc.fabric', zone: 'Scale-up vs scale-out', x: 540, y: 205,
      note: 'Gradient averaging makes every GPU talk to every other, every step — the bursty all-to-all pattern the fabric is sized for.' },
    { id: 'dc.rdma', name: 'RDMA', kind: 'atom', parent: 'dc.fabric', zone: 'Scale-up vs scale-out', x: 760, y: 205,
      note: 'Remote Direct Memory Access — the zero-copy primitive underneath both InfiniBand and RoCE, and under every collective.' },

    {
      id: 'dc.optics', name: 'Inside the optics', kind: 'container', zone: 'The optical layer',
      x: 560, y: 465, w: 720, h: 230,
      note: 'Past a few meters, copper gives out — every fabric link is light, and each end of it is this chain of parts.',
    },
    { id: 'dc.xcvr', name: 'Pluggable transceiver', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 280, y: 415, ldy: -26,
      note: 'An 800G module in the switch faceplate turning electrical bits into light and back — ~15 W each, and a big cluster runs hundreds of thousands of them.',
      role: 'converts electrical bits to light and back at the switch faceplate' },
    { id: 'dc.laser', name: 'Laser', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 420, y: 415, ldy: 26,
      note: 'The light source itself — and historically the most failure-prone part of the whole link.' },
    { id: 'dc.mod', name: 'Modulator', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 550, y: 415, ldy: -26,
      note: 'Carves the data onto the light — Mach-Zehnder or microring structures switching at tens of gigahertz.' },
    { id: 'dc.pd', name: 'Photodetector', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 680, y: 415, ldy: 26,
      note: 'The far end of the link: turns arriving photons back into electrical current.' },
    { id: 'dc.dsp', name: 'Transceiver DSP', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 810, y: 415, ldy: -26,
      note: 'Cleans, equalizes and retimes the PAM4 signal — burning 6–8 W, roughly half the whole module’s power, to do it.' },
    { id: 'dc.fiber', name: 'Fiber (SMF vs MMF)', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 350, y: 525,
      note: 'Single-mode’s tiny core carries light kilometers; multimode is cheaper to drive but fades after ~100 m — reach picks the fiber.' },
    { id: 'dc.sipho', name: 'Silicon photonics', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 530, y: 525,
      note: 'Builds modulators and waveguides in a CMOS fab, so optics start riding the same cost curve as chips.' },
    { id: 'dc.cpo', name: 'Co-packaged optics', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 700, y: 525,
      note: 'Moves the optics off the faceplate and into the switch ASIC’s own package — early CPO switches cut optical interconnect power by up to ~70%.',
      role: 'puts the optical engines inside the switch ASIC’s package to save power' },
    { id: 'dc.lpo', name: 'LPO (linear drive)', kind: 'atom', parent: 'dc.optics', zone: 'The optical layer', x: 855, y: 525,
      note: 'Drops the DSP and drives the optics straight from the switch ASIC: module power falls to 6–9 W and latency under 3 ns — but reach shrinks to ~500 m.' },
  ],
}

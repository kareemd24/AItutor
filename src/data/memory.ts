import type { ModuleDef } from '../types'

// Layout: a staircase from top-left (small, fast, close) descending to
// bottom-right (huge, slow, far) — position IS the hierarchy. The physics
// concepts that explain the whole staircase sit in the open lower-left.
export const memory: ModuleDef = {
  id: 'memory',
  title: 'The Memory Hierarchy',
  tagline: 'Registers to network storage: every step down is bigger, slower, and farther from the math.',
  world: { w: 1000, h: 620 },
  items: [
    {
      id: 'mem.onchip', name: 'On-chip (SRAM)', kind: 'container', zone: 'The staircase',
      x: 200, y: 160, w: 320, h: 240,
      note: 'Megabytes at terabytes-per-second, right next to the compute — the only memory fast enough to keep up with the ALUs.',
    },
    { id: 'mem.reg', name: 'Registers', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 110, y: 100,
      note: 'Per-thread and single-cycle — the only place the ALU can actually compute from; everything else is staging.' },
    { id: 'mem.l1', name: 'Shared memory / L1', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 285, y: 100,
      note: 'A few hundred KB per SM, software-managed — kernels are written around tiling data through here.' },
    { id: 'mem.sram', name: 'SRAM cell', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 110, y: 220,
      note: 'Six transistors per bit: blazing fast, but ~100× less dense than DRAM — the physics of why on-chip memory stays in megabytes.' },
    { id: 'mem.l2', name: 'L2 cache', kind: 'atom', parent: 'mem.onchip', zone: 'The staircase', x: 285, y: 220,
      note: 'Tens of MB shared across the whole die — the last line of defense before traffic spills out to HBM.' },

    {
      id: 'mem.inpkg', name: 'In-package (HBM)', kind: 'container', zone: 'The staircase',
      x: 500, y: 300, w: 200, h: 200,
      note: 'The middle step: DRAM moved into the package, next to the die — where the model actually lives while running.',
    },
    { id: 'mem.hbm', name: 'HBM', kind: 'atom', parent: 'mem.inpkg', zone: 'The staircase', x: 460, y: 260,
      note: '100–200 GB at multiple TB/s. Weights, activations and KV cache all fight for this space — "out of memory" means out of this.',
      role: 'holds the running model — its capacity decides whether the model fits at all' },
    { id: 'mem.stack', name: '3D stacking', kind: 'atom', parent: 'mem.inpkg', zone: 'The staircase', x: 545, y: 345,
      note: 'Bandwidth comes from width, and width comes from stacking DRAM dies vertically on thousands of short vias instead of a narrow bus.' },

    {
      id: 'mem.system', name: 'System & beyond', kind: 'container', zone: 'The staircase',
      x: 810, y: 460, w: 340, h: 260,
      note: 'The bottom of the staircase: enormous and cheap, but a slow bus ride away from the GPU.',
    },
    { id: 'mem.ddr', name: 'Host DRAM (DDR)', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 705, y: 395,
      note: 'The CPU’s terabyte-class memory — an order of magnitude less bandwidth than HBM, and a PCIe hop away from the GPU.' },
    { id: 'mem.nvme', name: 'NVMe SSD', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 895, y: 395,
      note: 'Where checkpoints and datasets live; a frontier model’s weights load from here in tens of seconds, not milliseconds.' },
    { id: 'mem.offload', name: 'Offloading', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 705, y: 515,
      note: 'Spilling weights or KV cache down the staircase to host DRAM or SSD — the model runs, but every step waits on the slow rungs.' },
    { id: 'mem.cxl', name: 'CXL memory expansion', kind: 'atom', parent: 'mem.system', zone: 'The staircase', x: 895, y: 515,
      note: 'Pools extra DRAM behind a PCIe-like link — capacity for cheap, at a latency the workload has to be able to tolerate.' },

    { id: 'mem.roofline', name: 'Arithmetic intensity', kind: 'atom', zone: 'The physics', x: 170, y: 440,
      note: 'FLOPs per byte moved. Below the roofline’s ridge you are bandwidth-bound (decode); above it, compute-bound (prefill).',
      role: 'measures FLOPs per byte moved, separating compute-bound from bandwidth-bound' },
    { id: 'mem.wall', name: 'The memory wall', kind: 'atom', zone: 'The physics', x: 335, y: 440,
      note: 'Compute grows faster than bandwidth every hardware generation — so more and more of AI becomes a memory problem, not a math problem.' },
    { id: 'mem.bwcap', name: 'Bandwidth vs capacity', kind: 'atom', zone: 'The physics', x: 250, y: 545,
      note: 'The trade every rung makes: you can have fast or you can have big, and each step down the staircase swaps one for the other.' },
  ],
}

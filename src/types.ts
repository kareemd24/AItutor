// Core data model, following the MyMapTap abstraction:
// containers are regions you tap inside; atoms are points you tap near.

export type ItemKind = 'container' | 'atom'

export interface Item {
  id: string
  name: string
  kind: ItemKind
  /** container this atom lives inside (containers may omit) */
  parent?: string
  /** sub-grouping label shown in setup and used for learn-tour ordering */
  zone: string
  /** center position in module world coordinates */
  x: number
  y: number
  /** extent (containers only), centered on x/y */
  w?: number
  h?: number
  /** one hand-written sentence — the hook the learner hangs the concept on */
  note: string
  /** optional "find the one that…" prompt for role questions */
  role?: string
}

export interface ModuleDef {
  id: string
  title: string
  tagline: string
  /** world coordinate extents for the designed layout */
  world: { w: number; h: number }
  items: Item[]
}

export type Mode = 'learn' | 'drill' | 'sprint' | 'review'

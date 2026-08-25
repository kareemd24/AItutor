// Core data model, following the MyMapTap abstraction:
// containers are regions you tap inside; atoms are points you tap near.

export type ItemKind = 'container' | 'atom'

// Vector illustration primitives, drawn in world coordinates. `lod` hides a
// shape until the camera zoom (relative to fit) reaches that multiple — this
// is how fine detail appears as you zoom in.
export type Shape =
  | { t: 'rect'; x: number; y: number; w: number; h: number; r?: number; f?: string; s?: string; lw?: number; dash?: number[]; lod?: number; lodMax?: number }
  | { t: 'circle'; cx: number; cy: number; r: number; f?: string; s?: string; lw?: number; lod?: number; lodMax?: number }
  | { t: 'line'; pts: number[]; s?: string; lw?: number; dash?: number[]; lod?: number; lodMax?: number }
  | { t: 'text'; x: number; y: number; text: string; size?: number; f?: string; align?: 'left' | 'center'; mono?: boolean; lod?: number; lodMax?: number }

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
  /** illustration drawn with (under) this item, in world coordinates */
  art?: Shape[]
  /** item only appears (and is tappable) once zoom ≥ lod × fit — zoom to find it */
  lod?: number
  /** extra tap radius in world units, for atoms whose art is bigger than a dot */
  hitR?: number
  /** label offset in screen px (ldx replaces the default right-of-dot offset) */
  ldx?: number
  ldy?: number
  /** right-align the label so it ends at the offset (for left-side labels) */
  lalign?: 'right'
}

export interface ModuleDef {
  id: string
  title: string
  tagline: string
  /** world coordinate extents for the designed layout */
  world: { w: number; h: number }
  /** backdrop illustration (leader lines, annotations) drawn beneath items */
  art?: Shape[]
  /** animated particles moving along polylines — data/power/tokens in motion */
  flows?: Flow[]
  items: Item[]
}

export interface Flow {
  /** polyline in world coordinates: x0,y0,x1,y1,… */
  pts: number[]
  color: string
  /** number of particles on the path at once */
  n: number
  /** world units per second */
  speed: number
  size?: number
}

export type Mode = 'learn' | 'explore' | 'drill' | 'sprint' | 'review'

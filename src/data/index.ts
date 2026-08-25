import type { ModuleDef } from '../types'
import { tokenpath } from './tokenpath'
import { rack } from './rack'
import { transformer } from './transformer'
import { inference } from './inference'
import { training } from './training'
import { silicon } from './silicon'
import { memory } from './memory'
import { datacenter } from './datacenter'
import { conceptGuideFor } from './beginner'

export const MODULES: ModuleDef[] = [
  tokenpath,
  rack,
  transformer,
  inference,
  training,
  silicon,
  memory,
  datacenter,
]

// A new map item is not complete until a casual reader gets the same
// beginner-first treatment as every existing concept.
const missingBeginnerGuides = MODULES.flatMap(module =>
  module.items.filter(item => !conceptGuideFor(item.id)).map(item => item.id),
)
if (missingBeginnerGuides.length > 0) {
  throw new Error(`Missing beginner explanations: ${missingBeginnerGuides.join(', ')}`)
}

export function getModule(id: string): ModuleDef | undefined {
  return MODULES.find(m => m.id === id)
}

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
import { quizClueFor } from './quiz'
import { teachingLensFor } from './teaching'
import { visualStoryFor } from './visuals'

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
const incompleteConcepts = MODULES.flatMap(module =>
  module.items
    .filter(item => !conceptGuideFor(item.id) || !teachingLensFor(item.id) || !quizClueFor(item.id) || !visualStoryFor(item.id))
    .map(item => item.id),
)
if (incompleteConcepts.length > 0) {
  throw new Error(`Missing beginner teaching material: ${incompleteConcepts.join(', ')}`)
}

export function getModule(id: string): ModuleDef | undefined {
  return MODULES.find(m => m.id === id)
}

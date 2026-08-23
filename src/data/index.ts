import type { ModuleDef } from '../types'
import { transformer } from './transformer'
import { inference } from './inference'
import { training } from './training'
import { silicon } from './silicon'
import { memory } from './memory'
import { datacenter } from './datacenter'

export const MODULES: ModuleDef[] = [
  transformer,
  inference,
  training,
  silicon,
  memory,
  datacenter,
]

export function getModule(id: string): ModuleDef | undefined {
  return MODULES.find(m => m.id === id)
}

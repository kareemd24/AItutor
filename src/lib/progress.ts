// Versioned localStorage progress store. A corrupt store costs history,
// never the app: every read is guarded and falls back to empty.

import { EMPTY_PROGRESS, applyResult, mastery, type ItemProgress } from '../game/engine'

const KEY = 'chipmap.progress.v1'

interface StoreShape {
  v: 1
  items: Record<string, ItemProgress>
}

let cache: StoreShape | null = null

function load(): StoreShape {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.v === 1 && typeof parsed.items === 'object' && parsed.items !== null) {
        cache = parsed as StoreShape
        return cache
      }
    }
  } catch {
    // fall through to a fresh store
  }
  cache = { v: 1, items: {} }
  return cache
}

function save(store: StoreShape) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // storage may be unavailable (private mode); play on without persistence
  }
}

export function getProgress(id: string): ItemProgress {
  const p = load().items[id]
  if (!p || typeof p.attempts !== 'number') return EMPTY_PROGRESS
  return p
}

export function recordResult(id: string, correct: boolean, now = Date.now()): ItemProgress {
  const store = load()
  const next = applyResult(getProgress(id), correct, now)
  store.items[id] = next
  save(store)
  return next
}

export function resetItems(ids: string[]) {
  const store = load()
  for (const id of ids) delete store.items[id]
  save(store)
}

export interface ModuleStats {
  total: number
  seen: number
  due: number
  masteryAvg: number
  accuracy: number | null
}

export function moduleStats(itemIds: string[], now = Date.now()): ModuleStats {
  let seen = 0
  let due = 0
  let masterySum = 0
  let attempts = 0
  let correct = 0
  for (const id of itemIds) {
    const p = getProgress(id)
    if (p.attempts > 0) {
      seen++
      if (p.due <= now) due++
    }
    masterySum += mastery(p)
    attempts += p.attempts
    correct += p.correct
  }
  return {
    total: itemIds.length,
    seen,
    due,
    masteryAvg: itemIds.length ? masterySum / itemIds.length : 0,
    accuracy: attempts > 0 ? correct / attempts : null,
  }
}

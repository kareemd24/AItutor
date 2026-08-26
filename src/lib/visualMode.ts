export type VisualMode = 'analogy' | 'map'

const KEY = 'chipmap.lesson-visual.v1'

export function savedVisualMode(): VisualMode {
  try {
    return localStorage.getItem(KEY) === 'map' ? 'map' : 'analogy'
  } catch {
    return 'analogy'
  }
}

export function saveVisualMode(mode: VisualMode): void {
  try { localStorage.setItem(KEY, mode) } catch { /* private browsing can deny storage */ }
}

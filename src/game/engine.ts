// Pure game logic: prompt selection, scoring, grading, spaced repetition.
// No DOM, no React, no renderer imports — this file must stay portable.

import type { Item, ModuleDef } from '../types'
import { quizClueFor } from '../data/quiz'

export interface ItemProgress {
  attempts: number
  correct: number
  streak: number
  /** Leitner box 0..5 */
  box: number
  /** epoch ms when this item is due for review */
  due: number
}

export const EMPTY_PROGRESS: ItemProgress = { attempts: 0, correct: 0, streak: 0, box: 0, due: 0 }

/** Distance scale for partial credit: the module's own extent defines "close". */
export function moduleScale(mod: ModuleDef): number {
  return Math.hypot(mod.world.w, mod.world.h)
}

// ---------------------------------------------------------------- learn tour

/**
 * Containers in authored order (the module file tells the story), each
 * followed by its atoms; orphan atoms last.
 */
export function buildLearnTour(mod: ModuleDef): Item[] {
  const containers = mod.items.filter(i => i.kind === 'container')
  const tour: Item[] = []
  for (const c of containers) {
    tour.push(c)
    tour.push(...mod.items.filter(i => i.parent === c.id))
  }
  tour.push(...mod.items.filter(i => i.kind === 'atom' && !i.parent))
  return tour
}

// ------------------------------------------------------------------ prompts

export interface Prompt {
  item: Item
  kind: 'clue'
  text: string
}

export function makePrompt(item: Item): Prompt {
  return {
    item,
    kind: 'clue',
    text: quizClueFor(item.id) ?? (item.role ? `Find the part that ${item.role}.` : item.note),
  }
}

/**
 * Weakness-weighted sampling: unseen and often-missed items come up more.
 * Never repeats the immediately previous prompt (unless the pool is size 1).
 */
export function pickPrompt(
  mod: ModuleDef,
  progress: (id: string) => ItemProgress,
  lastId: string | null,
  rand: () => number = Math.random,
): Prompt {
  let pool = mod.items.filter(i => i.id !== lastId)
  if (pool.length === 0) pool = mod.items
  const weights = pool.map(i => {
    const p = progress(i.id)
    const winRate = p.attempts > 0 ? p.correct / p.attempts : 0
    const unseen = p.attempts === 0 ? 2 : 0
    return 1 + unseen + 4 * (1 - winRate)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return makePrompt(pool[i])
  }
  return makePrompt(pool[pool.length - 1])
}

/** Items due for spaced review, most overdue first. Unseen items are not due. */
export function buildReviewQueue(
  mod: ModuleDef,
  progress: (id: string) => ItemProgress,
  now: number,
): Item[] {
  return mod.items
    .filter(i => {
      const p = progress(i.id)
      return p.attempts > 0 && p.due <= now
    })
    .sort((a, b) => progress(a.id).due - progress(b.id).due)
}

// ------------------------------------------------------------------ grading

export interface Verdict {
  correct: boolean
  points: number
  /** what the learner actually answered, when it was a different item */
  resolvedName: string | null
  headline: string
  /** the target's note — the teaching moment */
  note: string
}

const SPEED_BONUS_MAX = 50
const SPEED_WINDOW_MS = 6000
const PARTIAL_MAX = 55

export function streakMultiplier(streak: number): number {
  return 1 + 0.1 * Math.min(streak, 10)
}

/**
 * Grade a tap. `resolved` is what the renderer says was hit (may be null for
 * open space); partial credit decays with world-space distance, scaled by the
 * module's own extent so "close" is relative to this layout.
 */
export function grade(
  target: Item,
  resolved: Item | null,
  tapWorld: { x: number; y: number },
  scale: number,
  elapsedMs: number,
  streak: number,
): Verdict {
  // A tap resolving to the target's container counts only if the target IS
  // that container; atoms must be hit as atoms.
  const correct = resolved !== null && resolved.id === target.id
  if (correct) {
    const speed = Math.max(0, 1 - elapsedMs / SPEED_WINDOW_MS)
    const points = Math.round((100 + SPEED_BONUS_MAX * speed) * streakMultiplier(streak))
    return {
      correct: true,
      points,
      resolvedName: null,
      headline: `${target.name} — correct!`,
      note: target.note,
    }
  }
  const d = Math.hypot(tapWorld.x - target.x, tapWorld.y - target.y)
  const partial = Math.round(PARTIAL_MAX * Math.exp(-d / (0.15 * scale)))
  const headline = resolved
    ? `That’s ${resolved.name} — you needed ${target.name}`
    : `Not quite — that was ${target.name}`
  return { correct: false, points: partial, resolvedName: resolved?.name ?? null, headline, note: target.note }
}

// --------------------------------------------------------- spaced repetition

/** Leitner intervals by box, in ms. Box 0 retries within the same sitting. */
const INTERVALS_MS = [
  10 * 60 * 1000,            // box 0: 10 minutes
  24 * 60 * 60 * 1000,       // box 1: 1 day
  3 * 24 * 60 * 60 * 1000,   // box 2: 3 days
  7 * 24 * 60 * 60 * 1000,   // box 3: 1 week
  21 * 24 * 60 * 60 * 1000,  // box 4: 3 weeks
  60 * 24 * 60 * 60 * 1000,  // box 5: 2 months
]

export function applyResult(p: ItemProgress, correct: boolean, now: number): ItemProgress {
  const box = correct ? Math.min(5, p.box + 1) : Math.max(0, p.box - 2)
  return {
    attempts: p.attempts + 1,
    correct: p.correct + (correct ? 1 : 0),
    streak: correct ? p.streak + 1 : 0,
    box,
    due: now + (correct ? INTERVALS_MS[box] : 5 * 60 * 1000),
  }
}

/** 0..1 mastery for progress rings. */
export function mastery(p: ItemProgress): number {
  return Math.min(1, p.box / 5)
}

/** How many prompts one drill sitting should have. */
export function drillLength(mod: ModuleDef): number {
  return Math.max(8, Math.min(16, mod.items.length))
}

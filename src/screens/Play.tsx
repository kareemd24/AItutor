import { useEffect, useMemo, useRef, useState } from 'react'
import type { Item, Mode, ModuleDef } from '../types'
import type { Mark } from '../canvas/ConceptMap'
import ConceptMap from '../canvas/ConceptMap'
import {
  buildLearnTour, buildReviewQueue, drillLength, grade, moduleScale,
  pickPrompt, type Prompt, type Verdict,
} from '../game/engine'
import { getProgress, recordResult } from '../lib/progress'
import { investorNoteFor } from '../data/guides'

declare global {
  interface Window {
    /** deterministic hook: what the current question wants (smoke tests) */
    __cmTarget?: { id: string; x: number; y: number; kind: string; lod?: number } | null
    __cmPhase?: string
  }
}

interface Props {
  mod: ModuleDef
  mode: Mode
  initialItemId?: string
}

interface Answered {
  item: Item
  correct: boolean
}

const SPRINT_SECONDS = 60

export default function Play({ mod, mode, initialItemId }: Props) {
  const scale = useMemo(() => moduleScale(mod), [mod])
  const tour = useMemo(() => buildLearnTour(mod), [mod])
  const reviewQueue = useMemo(
    () => (mode === 'review' ? buildReviewQueue(mod, getProgress, Date.now()) : []),
    [mod, mode],
  )

  // learn
  const [tourIdx, setTourIdx] = useState(0)

  // explore
  const [selId, setSelId] = useState<string | null>(
    initialItemId && mod.items.some(item => item.id === initialItemId) ? initialItemId : null,
  )

  // "zoom in" nudge when the current target is hidden behind a zoom threshold
  const [zoomHint, setZoomHint] = useState(false)

  // quiz (drill / sprint / review)
  const [qNum, setQNum] = useState(1)
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [answered, setAnswered] = useState<Answered[]>([])
  const [done, setDone] = useState(false)
  const [sprintLeft, setSprintLeft] = useState(SPRINT_SECONDS)

  const askedAtRef = useRef(0)
  const lastIdRef = useRef<string | null>(null)
  const sprintEndRef = useRef(0)
  const autoNextRef = useRef<number | null>(null)

  const totalQ = mode === 'drill' ? drillLength(mod) : mode === 'review' ? reviewQueue.length : Infinity

  function nextPrompt(n: number) {
    let p: Prompt | null = null
    if (mode === 'review') {
      const item = reviewQueue[n - 1]
      p = item ? { item, kind: 'name', text: item.name } : null
    } else {
      p = pickPrompt(mod, getProgress, lastIdRef.current)
    }
    if (!p) {
      setDone(true)
      return
    }
    lastIdRef.current = p.item.id
    setPrompt(p)
    setVerdict(null)
    setWrongId(null)
    askedAtRef.current = performance.now()
  }

  // first prompt / sprint clock
  useEffect(() => {
    if (mode === 'learn' || mode === 'explore') return
    if (mode === 'review' && reviewQueue.length === 0) {
      setDone(true)
      return
    }
    nextPrompt(1)
    if (mode === 'sprint') {
      sprintEndRef.current = Date.now() + SPRINT_SECONDS * 1000
      const t = window.setInterval(() => {
        const left = Math.max(0, Math.ceil((sprintEndRef.current - Date.now()) / 1000))
        setSprintLeft(left)
        if (left <= 0) {
          window.clearInterval(t)
          setDone(true)
        }
      }, 250)
      return () => window.clearInterval(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, mod.id])

  // deterministic hooks for the smoke harness
  useEffect(() => {
    const item = mode === 'learn' ? tour[tourIdx] : prompt?.item
    window.__cmTarget = item
      ? { id: item.id, x: item.x, y: item.y, kind: item.kind, lod: item.lod }
      : null
    window.__cmPhase = done ? 'done' : verdict ? 'verdict' : 'ask'
    return () => {
      window.__cmTarget = null
      window.__cmPhase = undefined
    }
  }, [mode, tour, tourIdx, prompt, verdict, done])

  // while asking for an item hidden behind a zoom threshold, nudge the player
  useEffect(() => {
    const lod = prompt?.item.lod
    if (!lod || verdict || done) {
      setZoomHint(false)
      return
    }
    const t = window.setInterval(() => {
      setZoomHint((window.__cmRelK ?? 1) < lod)
    }, 300)
    return () => window.clearInterval(t)
  }, [prompt, verdict, done])

  useEffect(() => () => {
    if (autoNextRef.current !== null) window.clearTimeout(autoNextRef.current)
  }, [])

  function advance() {
    if (mode === 'sprint') {
      if (Date.now() >= sprintEndRef.current) {
        setDone(true)
        return
      }
      setQNum(n => n + 1)
      nextPrompt(qNum + 1)
      return
    }
    if (qNum >= totalQ) {
      setDone(true)
      return
    }
    setQNum(n => n + 1)
    nextPrompt(qNum + 1)
  }

  function onTap(world: { x: number; y: number }, resolved: Item | null) {
    if (!prompt || verdict || done) return
    const elapsed = performance.now() - askedAtRef.current
    const v = grade(prompt.item, resolved, world, scale, elapsed, streak)
    recordResult(prompt.item.id, v.correct)
    setVerdict(v)
    setWrongId(v.correct ? null : resolved?.id ?? null)
    setScore(s => s + v.points)
    setStreak(s => (v.correct ? s + 1 : 0))
    setAnswered(a => [...a, { item: prompt.item, correct: v.correct }])
    if (mode === 'sprint') {
      autoNextRef.current = window.setTimeout(() => advance(), 1400)
    }
  }

  // ------------------------------------------------------------------ marks
  const marks: Record<string, Mark> = {}
  let focusId: string | null = null
  if (mode === 'learn') {
    const cur = tour[tourIdx]
    if (cur) {
      marks[cur.id] = 'focus'
      focusId = cur.id
    }
  } else if (verdict && prompt) {
    marks[prompt.item.id] = verdict.correct ? 'correct' : 'focus'
    if (wrongId && wrongId !== prompt.item.id) marks[wrongId] = 'wrong'
    focusId = verdict.correct ? null : prompt.item.id
  }

  const nCorrect = answered.filter(a => a.correct).length
  const missed = [...new Set(answered.filter(a => !a.correct).map(a => a.item.name))]

  // ---------------------------------------------------------------- explore
  if (mode === 'explore') {
    const sel = selId ? mod.items.find(i => i.id === selId) : undefined
    const exploreMarks: Record<string, Mark> = sel ? { [sel.id]: 'focus' } : {}
    return (
      <div className="play">
        <TopBar mod={mod} label="Explore" right="" />
        <ConceptMap
          mod={mod}
          marks={exploreMarks}
          showAtomLabels
          interactive
          onTap={(_world, resolved) => setSelId(resolved?.id ?? null)}
        />
        <div className="panel" data-testid="explore-card">
          {sel ? (
            <>
              <div className="panel-head">
                <span className={`kind-badge ${sel.kind}`}>{sel.kind === 'container' ? 'region' : 'component'}</span>
                <h3>{sel.name}</h3>
              </div>
              <ConceptCopy item={sel} />
            </>
          ) : (
            <p className="note">
              Tap any component to see what it does. Pinch or scroll to zoom — smaller parts
              appear as you get closer. ⛶ resets the view.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------ learn
  if (mode === 'learn') {
    const cur = tour[tourIdx]
    const isLast = tourIdx >= tour.length - 1
    return (
      <div className="play">
        <TopBar mod={mod} label="Learn" right={`${tourIdx + 1} / ${tour.length}`} />
        <ConceptMap
          mod={mod} marks={marks} showAtomLabels interactive={false} focusId={focusId}
        />
        {cur && (
          <div className="panel" data-testid="learn-card">
            <div className="panel-head">
              <span className={`kind-badge ${cur.kind}`}>{cur.kind === 'container' ? 'region' : 'concept'}</span>
              <h3>{cur.name}</h3>
            </div>
            <ConceptCopy item={cur} />
            <div className="panel-actions">
              <button className="ghost-btn" disabled={tourIdx === 0} onClick={() => setTourIdx(i => i - 1)}>
                ← Back
              </button>
              {isLast ? (
                <a className="primary-btn" href={`#/m/${mod.id}/drill`}>Start drill →</a>
              ) : (
                <button className="primary-btn" data-testid="learn-next" onClick={() => setTourIdx(i => i + 1)}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ------------------------------------------------------------------- done
  if (done) {
    const emptyReview = mode === 'review' && reviewQueue.length === 0
    return (
      <div className="play">
        <TopBar mod={mod} label={modeLabel(mode)} right="" />
        <ConceptMap mod={mod} marks={{}} showAtomLabels interactive={false} />
        <div className="panel results" data-testid="results">
          {emptyReview ? (
            <>
              <h3>Nothing due for review</h3>
              <p className="note">Everything you’ve practiced here is still fresh. Drill some more, or come back later.</p>
            </>
          ) : (
            <>
              <h3>{modeLabel(mode)} complete</h3>
              <div className="results-stats">
                <div><strong data-testid="final-score">{score}</strong><span>score</span></div>
                <div><strong>{nCorrect}/{answered.length}</strong><span>correct</span></div>
                <div><strong>{answered.length ? Math.round((nCorrect / answered.length) * 100) : 0}%</strong><span>accuracy</span></div>
              </div>
              {missed.length > 0 && (
                <p className="note">Worth another look: {missed.slice(0, 6).join(' · ')}</p>
              )}
            </>
          )}
          <div className="panel-actions">
            <a className="ghost-btn" href={`#/m/${mod.id}`}>Module</a>
            {!emptyReview && (
              <a className="primary-btn" href={`#/m/${mod.id}/${mode}`} onClick={() => window.location.reload()}>
                Play again
              </a>
            )}
            {emptyReview && <a className="primary-btn" href={`#/m/${mod.id}/drill`}>Drill instead</a>}
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------- quiz
  return (
    <div className="play">
      <TopBar
        mod={mod}
        label={modeLabel(mode)}
        right={
          mode === 'sprint'
            ? `${sprintLeft}s`
            : `${Math.min(qNum, totalQ)} / ${totalQ === Infinity ? '∞' : totalQ}`
        }
      />
      <div className="hud">
        <div className="hud-prompt" data-testid="prompt">
          {prompt ? (prompt.kind === 'role' ? prompt.text : <>Tap: <strong>{prompt.text}</strong></>) : '…'}
        </div>
        <div className="hud-score">
          <span data-testid="score">{score}</span>
          {streak >= 2 && <span className="streak">×{streak}</span>}
        </div>
      </div>
      <div className="map-stack">
        <ConceptMap
          mod={mod}
          marks={marks}
          showAtomLabels={false}
          prefer={prompt?.item.kind}
          focusId={focusId}
          resetSignal={qNum}
          interactive={!verdict}
          onTap={onTap}
        />
        {zoomHint && (
          <div className="hud-hint" data-testid="zoom-hint">
            It’s a small component — zoom in and it will appear.
          </div>
        )}
      </div>
      {verdict && (
        <div className={`panel verdict ${verdict.correct ? 'good' : 'bad'}`} data-testid="verdict">
          <div className="panel-head">
            <h3>{verdict.headline}</h3>
            <span className="points">+{verdict.points}</span>
          </div>
          <p className="note">{verdict.note}</p>
          {prompt && investorNoteFor(prompt.item.id) && (
            <div className="investor-lens"><span>Investor lens</span><p>{investorNoteFor(prompt.item.id)}</p></div>
          )}
          {mode !== 'sprint' && (
            <div className="panel-actions">
              <button className="primary-btn" data-testid="next-btn" onClick={advance}>
                {qNum >= totalQ ? 'Finish' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ConceptCopy({ item }: { item: Item }) {
  const investorNote = investorNoteFor(item.id)
  return (
    <>
      <p className="note">{item.note}</p>
      {investorNote && <div className="investor-lens"><span>Investor lens</span><p>{investorNote}</p></div>}
    </>
  )
}

function modeLabel(mode: Mode): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function TopBar({ mod, label, right }: { mod: ModuleDef; label: string; right: string }) {
  return (
    <div className="topbar">
      <a className="exit" href={`#/m/${mod.id}`} aria-label="Exit">✕</a>
      <div className="topbar-title">
        <strong>{label}</strong>
        <span>{mod.title}</span>
      </div>
      <div className="topbar-right">{right}</div>
    </div>
  )
}

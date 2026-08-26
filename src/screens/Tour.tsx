import { useState } from 'react'
import ConceptMap, { type Mark } from '../canvas/ConceptMap'
import ConceptExplanation from '../components/ConceptExplanation'
import LessonVisual from '../components/LessonVisual'
import { getModule } from '../data'
import { TOUR } from '../data/tour'

// The Grand Tour: a guided narrative that follows one request across four
// modules. Each step focuses one place on one map; crossing a module
// boundary remounts the canvas on the new map.

export default function Tour() {
  const [idx, setIdx] = useState(0)
  const step = TOUR[idx]
  const mod = getModule(step.module)!
  const item = step.item ? mod.items.find(candidate => candidate.id === step.item) : undefined
  const marks: Record<string, Mark> = step.item ? { [step.item]: 'focus' } : {}
  const isLast = idx === TOUR.length - 1

  return (
    <div className="play">
      <div className="topbar">
        <a className="exit" href="#/" aria-label="Exit">✕</a>
        <div className="topbar-title">
          <strong>The Grand Tour</strong>
          <span>{mod.title}</span>
        </div>
        <div className="topbar-right">{idx + 1} / {TOUR.length}</div>
      </div>
      <div className="concept-workspace lesson-workspace tour-workspace">
        {item ? (
          <LessonVisual key={`${mod.id}:${item.id}`} mod={mod} item={item} marks={marks} focusId={step.item ?? null} />
        ) : (
          <div className="visual-column lesson-visual">
            <div className="visual-context"><span>{mod.title}</span><strong>{step.title}</strong></div>
            <ConceptMap
              key={mod.id}
              mod={mod}
              marks={marks}
              showAtomLabels={false}
              showContainerLabels
              interactive={false}
              focusId={null}
            />
            <div className="focus-caption"><span aria-hidden>◎</span>First, see where this chapter sits in the whole system.</div>
          </div>
        )}
        <aside className="panel side-panel lesson-panel" data-testid="tour-card">
          <div className="panel-head">
            <span className="kind-badge atom">step {idx + 1}</span>
            <h3>{step.title}</h3>
          </div>
          <div className="tour-example-label"><span>Worked illustration</span> Exact tokens and values vary by model and serving stack.</div>
          {item
            ? <ConceptExplanation item={item} detailOverride={step.text} detailLabel="What happens in this step" showInvestor={!step.insight} />
            : <p className="note">{step.text}</p>}
          {step.insight && <div className="investor-lens"><span>Investor lens</span><p>{step.insight}</p></div>}
          <div className="panel-actions">
            <button className="ghost-btn" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>
              ← Back
            </button>
            {isLast ? (
              <a className="primary-btn" data-testid="tour-end" href="#/m/tokenpath/drill">
                Drill it →
              </a>
            ) : (
              <button className="primary-btn" data-testid="tour-next" onClick={() => setIdx(i => i + 1)}>
                Next →
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

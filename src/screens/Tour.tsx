import { useState } from 'react'
import ConceptMap, { type Mark } from '../canvas/ConceptMap'
import ConceptExplanation from '../components/ConceptExplanation'
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
      <ConceptMap
        key={mod.id}
        mod={mod}
        marks={marks}
        showAtomLabels
        interactive={false}
        focusId={step.item ?? null}
      />
      <div className="panel" data-testid="tour-card">
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
      </div>
    </div>
  )
}

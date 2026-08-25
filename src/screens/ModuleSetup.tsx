import type { ModuleDef } from '../types'
import { moduleStats, resetItems } from '../lib/progress'
import { useState } from 'react'

export default function ModuleSetup({ mod }: { mod: ModuleDef }) {
  const [, bump] = useState(0)
  const ids = mod.items.map(i => i.id)
  const stats = moduleStats(ids)
  const zones = [...new Set(mod.items.map(i => i.zone))]
  const containers = mod.items.filter(i => i.kind === 'container').length

  return (
    <div className="page">
      <a className="back" href="#/">← All modules</a>
      <header className="setup-header">
        <h1>{mod.title}</h1>
        <p className="sub">{mod.tagline}</p>
        <div className="meta">
          <span>{containers} regions</span>
          <span>{mod.items.length - containers} concepts</span>
          <span>{Math.round(stats.masteryAvg * 100)}% mastered</span>
          {stats.accuracy !== null && <span>{Math.round(stats.accuracy * 100)}% accuracy</span>}
        </div>
        <div className="zones">
          {zones.map(z => <span key={z} className="zone-chip">{z}</span>)}
        </div>
      </header>

      <div className="mode-list">
        <a className="mode-card" href={`#/m/${mod.id}/learn`}>
          <h3>Learn</h3>
          <p>A guided tour, no score. Builds the mental picture region by region.</p>
        </a>
        <a className="mode-card" href={`#/m/${mod.id}/explore`}>
          <h3>Explore</h3>
          <p>Free roam — tap any component to see what it does, zoom in for the fine detail.</p>
        </a>
        <a className="mode-card" href={`#/m/${mod.id}/drill`}>
          <h3>Drill</h3>
          <p>Timed prompts, weighted toward what you know least. This is the game.</p>
        </a>
        <a className="mode-card" href={`#/m/${mod.id}/sprint`}>
          <h3>Sprint</h3>
          <p>One 60-second clock, endless prompts. For fluency.</p>
        </a>
        <a className="mode-card" href={`#/m/${mod.id}/review`}>
          <h3>Review {stats.due > 0 && <span className="due-badge">{stats.due} due</span>}</h3>
          <p>Spaced repetition — only what you’re due to forget.</p>
        </a>
      </div>

      {stats.seen > 0 && (
        <button
          className="ghost-btn"
          onClick={() => {
            if (window.confirm(`Reset all progress for “${mod.title}”?`)) {
              resetItems(ids)
              bump(n => n + 1)
            }
          }}
        >
          Reset progress for this module
        </button>
      )}
    </div>
  )
}

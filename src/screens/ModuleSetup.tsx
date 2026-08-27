import { useState } from 'react'
import type { ModuleDef } from '../types'
import { guideFor } from '../data/guides'
import { moduleWatchFor } from '../data/watch'
import WatchClips from '../components/WatchClips'
import { moduleStats, resetItems } from '../lib/progress'

const MODE_META = [
  { id: 'learn', icon: '01', title: 'Learn', text: 'A guided visual walkthrough: plain meaning, real mechanism, prompt connection, then investor relevance.', featured: true },
  { id: 'explore', icon: '⌕', title: 'Explore', text: 'Free roam. Tap any part for the same beginner-first explanation.' },
  { id: 'drill', icon: '◎', title: 'Drill', text: 'Short prompts weighted toward concepts you know least.' },
  { id: 'sprint', icon: '60', title: 'Sprint', text: 'A one-minute fluency check across the entire map.' },
  { id: 'review', icon: '↻', title: 'Review', text: 'Spaced repetition for concepts that are due.' },
] as const

export default function ModuleSetup({ mod }: { mod: ModuleDef }) {
  const [, bump] = useState(0)
  const guide = guideFor(mod.id)
  const ids = mod.items.map(i => i.id)
  const stats = moduleStats(ids)
  const zones = [...new Set(mod.items.map(i => i.zone))]
  const containers = mod.items.filter(i => i.kind === 'container').length

  return (
    <div className="module-page">
      <header className="site-nav module-nav">
        <a className="brand" href="#/">
          <span className="brand-mark" aria-hidden>CM</span>
          <span>ChipMap</span>
        </a>
        <a className="back" href="#/">← All modules</a>
      </header>

      <main className="module-main">
        <section className="module-hero">
          <div className="module-title-block">
            <div className="chapter-line"><span>{guide.chapter}</span><span>{guide.track}</span><span>{guide.eyebrow}</span></div>
            <h1>{mod.title}</h1>
            <p>{guide.thesis}</p>
            <div className="meta">
              <span>{containers} visual regions</span>
              <span>{mod.items.length - containers} concepts</span>
              <span>{Math.round(stats.masteryAvg * 100)}% mastered</span>
              {stats.accuracy !== null && <span>{Math.round(stats.accuracy * 100)}% accuracy</span>}
            </div>
          </div>

          <aside className="investor-question-card">
            <span>Ask this as an investor</span>
            <p>{guide.investorQuestion}</p>
          </aside>
        </section>

        <section className="metric-grid" aria-label="Key mental models">
          {guide.metrics.map(metric => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <p>{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="map-scope">
          <div>
            <span className="scope-label">What this map covers</span>
            <p>{mod.tagline}</p>
          </div>
          <div>
            <span className="scope-label">Read the numbers correctly</span>
            <p>{guide.scope}</p>
          </div>
        </section>
        <div className="zone-row" aria-label="Map sequence">
          <span>Map sequence</span>
          {zones.map((zone, index) => <span key={zone}>{String(index + 1).padStart(2, '0')} · {zone}</span>)}
        </div>

        <section className="learning-section">
          <div className="section-heading compact">
            <p className="eyebrow">Choose a mode</p>
            <h2>Understand it first, then test recall</h2>
          </div>
          <div className="mode-list">
            {MODE_META.map(mode => (
              <a className={`mode-card ${'featured' in mode && mode.featured ? 'featured' : ''}`} key={mode.id} href={`#/m/${mod.id}/${mode.id}`}>
                <span className="mode-icon">{mode.icon}</span>
                <div>
                  <h3>
                    {mode.title}
                    {mode.id === 'review' && stats.due > 0 && <span className="due-badge">{stats.due} due</span>}
                  </h3>
                  <p>{mode.text}</p>
                </div>
                <span className="mode-arrow" aria-hidden>→</span>
              </a>
            ))}
          </div>
        </section>

        {moduleWatchFor(mod.id).length > 0 && (
          <section className="learning-section">
            <div className="section-heading compact">
              <p className="eyebrow">Watch first</p>
              <h2>The best free explainers, cut to this map</h2>
            </div>
            <WatchClips clips={moduleWatchFor(mod.id)} heading="Curated video chapters" />
          </section>
        )}

        <section className="source-section">
          <div className="source-heading">
            <div>
              <p className="eyebrow">Research notes</p>
              <h2>Primary sources behind this module</h2>
            </div>
            <span>{guide.sources.length} references</span>
          </div>
          <div className="source-list">
            {guide.sources.map((source, index) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{source.label}</strong><small>{source.publisher}</small></div>
                <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
          {stats.seen > 0 && (
            <button
              className="reset-link"
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
        </section>
      </main>
    </div>
  )
}

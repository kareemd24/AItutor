import { useMemo, useState } from 'react'
import { MODULES } from '../data'
import { guideFor } from '../data/guides'
import { moduleStats } from '../lib/progress'

function Ring({ value }: { value: number }) {
  const r = 17
  const c = 2 * Math.PI * r
  return (
    <svg className="ring" viewBox="0 0 44 44" width="44" height="44" aria-hidden>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r} fill="none" stroke="#34d399" strokeWidth="4"
        strokeLinecap="round" strokeDasharray={`${c * value} ${c}`}
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="23" textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">
        {Math.round(value * 100)}
      </text>
    </svg>
  )
}

const TRACKS = [
  { id: 'Model', title: 'How the model works', blurb: 'Build the mental model first: tokens, transformers, and training.' },
  { id: 'Economics', title: 'How AI becomes a service', blurb: 'Connect latency, throughput, utilization, and model quality to unit economics.' },
  { id: 'Infrastructure', title: 'What the physical stack requires', blurb: 'Move from chip architecture through memory, racks, power, cooling, and networking.' },
] as const

export default function Home() {
  const [query, setQuery] = useState('')
  const cleanQuery = query.trim().toLocaleLowerCase()
  const matches = useMemo(() => {
    if (cleanQuery.length < 2) return []
    return MODULES.flatMap(mod => mod.items.map(item => ({ mod, item })))
      .filter(({ mod, item }) => `${item.name} ${item.note} ${mod.title}`.toLocaleLowerCase().includes(cleanQuery))
      .slice(0, 7)
  }, [cleanQuery])
  const conceptCount = MODULES.reduce((sum, mod) => sum + mod.items.filter(item => item.kind === 'atom').length, 0)

  return (
    <div className="home-shell">
      <header className="site-nav">
        <a className="brand" href="#/" aria-label="ChipMap home">
          <span className="brand-mark" aria-hidden>CM</span>
          <span>ChipMap</span>
        </a>
        <span className="nav-edition">Investor edition</span>
      </header>

      <main className="home-main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">An interactive field guide to the AI stack</p>
            <h1>See where AI performance and value actually come from.</h1>
            <p className="hero-sub">
              Follow a token from prompt to silicon, then connect model design, inference,
              memory, packaging, power, cooling, and networks to the questions investors ask.
            </p>
            <div className="hero-actions">
              <a className="primary-btn hero-btn" href="#/tour">Take the 10-minute tour <span>→</span></a>
              <a className="text-link" href="#curriculum">Browse the curriculum ↓</a>
            </div>
            <div className="hero-proof" aria-label="Course summary">
              <div><strong>{MODULES.length}</strong><span>visual maps</span></div>
              <div><strong>{conceptCount}</strong><span>key concepts</span></div>
              <div><strong>Primary</strong><span>sources linked</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-label="A request moving from prompt through model, memory, chip, rack, and network">
            <div className="signal-line" aria-hidden />
            {[
              ['01', 'Prompt', '5 token pieces'],
              ['02', 'Model', 'prefill → decode'],
              ['03', 'Memory', 'weights + KV'],
              ['04', 'Silicon', 'math + bandwidth'],
              ['05', 'System', 'power + network'],
            ].map(([n, title, sub], index) => (
              <div className={`signal-node node-${index + 1}`} key={title}>
                <span className="signal-index">{n}</span>
                <div><strong>{title}</strong><small>{sub}</small></div>
              </div>
            ))}
            <div className="pulse p1" aria-hidden />
            <div className="pulse p2" aria-hidden />
            <div className="visual-caption"><span className="live-dot" /> One request, end to end</div>
          </div>
        </section>

        <section className="grand-tour-card">
          <div className="tour-number">00</div>
          <div className="tour-copy">
            <p className="eyebrow">Recommended first</p>
            <h2>The path of one answer</h2>
            <p>
              Follow “The capital of France is” from keystroke to first token, through a shared
              serving worker, into HBM, and down to a liquid-cooled rack. The values are clearly
              marked as illustrative; the system relationships are real.
            </p>
          </div>
          <a className="tour-start" href="#/tour"><span>Start guided tour</span><strong>→</strong></a>
        </section>

        <section className="concept-search" aria-label="Concept finder">
          <div>
            <p className="eyebrow">Concept finder</p>
            <h2>Jump straight to a term</h2>
          </div>
          <div className="search-wrap">
            <span aria-hidden>⌕</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Try “KV cache”, “HBM”, or “quantization”"
              aria-label="Search AI concepts"
            />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          </div>
          {cleanQuery.length >= 2 && (
            <div className="search-results" role="list">
              {matches.length > 0 ? matches.map(({ mod, item }) => (
                <a key={`${mod.id}:${item.id}`} role="listitem" href={`#/m/${mod.id}/explore/${item.id}`}>
                  <div><strong>{item.name}</strong><span>{mod.title}</span></div>
                  <p>{item.note}</p>
                  <span className="result-arrow">→</span>
                </a>
              )) : <p className="search-empty">No match yet. Try a broader term.</p>}
            </div>
          )}
        </section>

        <section id="curriculum" className="curriculum">
          <div className="section-heading">
            <p className="eyebrow">The curriculum</p>
            <h2>Three layers, one investment picture</h2>
            <p>Each module starts with the business question, then lets you learn, explore, and test the underlying concepts spatially.</p>
          </div>

          {TRACKS.map(track => {
            const mods = MODULES.filter(mod => guideFor(mod.id).track === track.id)
            return (
              <div className="track" key={track.id}>
                <div className="track-heading">
                  <div><span>{track.id}</span><h3>{track.title}</h3></div>
                  <p>{track.blurb}</p>
                </div>
                <div className="module-grid">
                  {mods.map(mod => {
                    const guide = guideFor(mod.id)
                    const stats = moduleStats(mod.items.map(i => i.id))
                    const containers = mod.items.filter(i => i.kind === 'container').length
                    return (
                      <a key={mod.id} className={`module-card module-${mod.id}`} href={`#/m/${mod.id}`}>
                        <div className="module-topline">
                          <span>{guide.chapter}</span>
                          <span>{guide.eyebrow}</span>
                          <Ring value={stats.masteryAvg} />
                        </div>
                        <div className="module-card-text">
                          <h3>{mod.title}</h3>
                          <p>{guide.thesis}</p>
                          <div className="module-question"><span>Investor question</span>{guide.investorQuestion}</div>
                          <div className="meta">
                            <span>{containers} regions</span>
                            <span>{mod.items.length - containers} concepts</span>
                            {stats.due > 0 && <span className="due-badge">{stats.due} due</span>}
                          </div>
                        </div>
                        <span className="card-arrow" aria-hidden>↗</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      </main>

      <footer className="home-footer">
        <div><strong>ChipMap</strong><span>AI fluency for investment decisions.</span></div>
        <p>Educational content, not investment advice. Hardware figures are generation-specific and linked to primary sources. Progress stays in this browser.</p>
      </footer>
    </div>
  )
}

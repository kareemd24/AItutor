import { MODULES } from '../data'
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
      <text x="22" y="23" textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
        {Math.round(value * 100)}
      </text>
    </svg>
  )
}

export default function Home() {
  return (
    <div className="page">
      <header className="home-header">
        <h1>ChipMap</h1>
        <p className="sub">
          Learn AI &amp; semiconductor concepts the way you learn a map: every idea has a place,
          and tapping the place <em>is</em> the answer.
        </p>
      </header>
      <a className="tour-banner" href="#/tour">
        <div>
          <h2>▶ The Grand Tour</h2>
          <p>
            Follow one request — <em>"The capital of France is"</em> — from keystroke to silicon:
            through the model, across the serving GPU, into memory, down to the rack.
          </p>
        </div>
        <span className="tour-go">Start →</span>
      </a>
      <div className="module-list">
        {MODULES.map(m => {
          const stats = moduleStats(m.items.map(i => i.id))
          const containers = m.items.filter(i => i.kind === 'container').length
          return (
            <a key={m.id} className="module-card" href={`#/m/${m.id}`}>
              <div className="module-card-text">
                <h2>{m.title}</h2>
                <p>{m.tagline}</p>
                <div className="meta">
                  <span>{containers} regions</span>
                  <span>{m.items.length - containers} concepts</span>
                  {stats.due > 0 && <span className="due-badge">{stats.due} due</span>}
                </div>
              </div>
              <Ring value={stats.masteryAvg} />
            </a>
          )
        })}
      </div>
      <footer className="home-footer">
        Progress lives in this browser only. Built on the MyMapTap playbook.
      </footer>
    </div>
  )
}

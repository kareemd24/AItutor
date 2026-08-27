import { useState } from 'react'
import { VIDEO_META, embedUrl, fmtTime, watchUrl, type WatchClip } from '../data/watch'

// Curated video clips for a concept or module. Nothing is fetched from
// YouTube until the learner presses play — the page stays fast and fully
// offline-safe; the embed (privacy-enhanced youtube-nocookie) loads on click.

interface Props {
  clips: WatchClip[]
  heading?: string
}

export default function WatchClips({ clips, heading = 'Watch it explained' }: Props) {
  const [active, setActive] = useState<number | null>(null)
  if (clips.length === 0) return null

  return (
    <section className="watch-section" data-testid="watch-clips">
      <span className="watch-heading">{heading}</span>
      <div className="watch-list">
        {clips.map((clip, index) => {
          const meta = VIDEO_META[clip.video]
          const isActive = active === index
          return (
            <div key={`${clip.video}:${clip.start}`} className={`watch-clip ${isActive ? 'active' : ''}`}>
              <button
                className="watch-row"
                onClick={() => setActive(isActive ? null : index)}
                aria-expanded={isActive}
              >
                <span className="watch-play" aria-hidden>{isActive ? '■' : '▶'}</span>
                <span className="watch-text">
                  <strong>{clip.chapter}</strong>
                  <small>{meta.creator} · {meta.title} · from {fmtTime(clip.start)}</small>
                </span>
              </button>
              {!isActive && <p className="watch-why">{clip.why}</p>}
              {isActive && (
                <div className="watch-player">
                  <iframe
                    src={embedUrl(clip)}
                    title={`${meta.creator} — ${clip.chapter}`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                  <a className="watch-external" href={watchUrl(clip)} target="_blank" rel="noreferrer">
                    Open on YouTube ↗
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

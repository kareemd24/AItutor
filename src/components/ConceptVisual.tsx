import type { VisualStory } from '../data/visuals'

interface Props {
  story: VisualStory
  itemName: string
}

const roleLabel = {
  input: 'Starts here',
  work: 'What happens',
  memory: 'Saved for reuse',
  output: 'Result',
} as const

export default function ConceptVisual({ story, itemName }: Props) {
  return (
    <figure className={`concept-scene scene-${story.kind}`} aria-label={`Visual explanation of ${itemName}`}>
      <figcaption>
        <span>{story.kicker}</span>
        <strong>{story.title}</strong>
      </figcaption>
      {story.image ? (
        <div className="scene-illustration">
          <img src={story.image} alt={story.imageAlt ?? ''} />
          <div className="scene-image-key" aria-hidden>
            {story.beats.map((beat, index) => (
              <span key={`${beat.label}:${index}`}>
                <i>{index + 1}</i>
                <span><em>{roleLabel[beat.tone ?? 'work']}</em><strong>{beat.label}</strong></span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="scene-stage">
          {story.beats.map((beat, index) => (
            <div className={`scene-beat tone-${beat.tone ?? 'work'}`} key={`${beat.label}:${index}`}>
              <span className="scene-beat-meta"><i aria-hidden>{index + 1}</i><em>{roleLabel[beat.tone ?? 'work']}</em></span>
              <div><strong>{beat.label}</strong><small>{beat.detail}</small></div>
            </div>
          ))}
        </div>
      )}
      <p><span aria-hidden>◎</span>{story.takeaway}</p>
    </figure>
  )
}

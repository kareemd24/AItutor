import type { VisualStory } from '../data/visuals'

interface Props {
  story: VisualStory
  itemName: string
}

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
            {story.beats.map((beat, index) => <span key={`${beat.label}:${index}`}><i>{index + 1}</i>{beat.label}</span>)}
          </div>
        </div>
      ) : (
        <div className="scene-stage">
          {story.beats.map((beat, index) => (
            <div className={`scene-beat tone-${beat.tone ?? 'work'}`} key={`${beat.label}:${index}`}>
              <i aria-hidden>{index + 1}</i>
              <div><strong>{beat.label}</strong><small>{beat.detail}</small></div>
            </div>
          ))}
        </div>
      )}
      <p><span aria-hidden>◎</span>{story.takeaway}</p>
    </figure>
  )
}

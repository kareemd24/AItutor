import ConceptMap, { type Mark } from '../canvas/ConceptMap'
import ConceptVisual from './ConceptVisual'
import { visualStoryFor } from '../data/visuals'
import type { VisualMode } from '../lib/visualMode'
import type { Item, ModuleDef } from '../types'

interface Props {
  mod: ModuleDef
  item: Item
  marks: Record<string, Mark>
  focusId: string | null
  mode: VisualMode
  onModeChange: (mode: VisualMode) => void
}

export default function LessonVisual({ mod, item, marks, focusId, mode, onModeChange }: Props) {
  const story = visualStoryFor(item.id)
  const effectiveMode = story ? mode : 'map'

  return (
    <div className="visual-column lesson-visual">
      <div className="visual-context"><span>{item.zone}</span><strong>{item.name}</strong></div>
      {story && (
        <div className="visual-toggle" role="group" aria-label="Choose lesson visual">
          <button className={effectiveMode === 'analogy' ? 'active' : ''} onClick={() => onModeChange('analogy')}>Analogy</button>
          <button className={effectiveMode === 'map' ? 'active' : ''} onClick={() => onModeChange('map')}>Diagram</button>
        </div>
      )}
      {story && effectiveMode === 'analogy' ? (
        <ConceptVisual story={story} itemName={item.name} />
      ) : (
        <ConceptMap
          mod={mod}
          marks={marks}
          showAtomLabels={false}
          showContainerLabels={false}
          interactive={false}
          focusId={focusId}
          isolateFocus
        />
      )}
      <div className="focus-caption"><span aria-hidden>◎</span>{effectiveMode === 'analogy' ? 'This visual changes with every concept; use Diagram to see where it lives.' : 'Everything unrelated is hidden while you learn this part.'}</div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import ConceptMap, { type Mark } from '../canvas/ConceptMap'
import { teachingLensFor } from '../data/teaching'
import type { Item, ModuleDef } from '../types'

interface AssetDef {
  src: string
  alt: string
  sequence: string
}

function assetFor(moduleId: string, itemId: string): AssetDef | undefined {
  if (moduleId === 'transformer') {
    return {
      src: './lessons/transformer-office.webp',
      alt: 'An office cutaway: a request becomes standard cards, colleagues exchange context, analysts privately transform it, and an editor ranks final candidates.',
      sequence: 'Reception → shared meeting → private desk work → final editor',
    }
  }
  if (moduleId === 'inference') {
    return {
      src: './lessons/inference-kitchen.webp',
      alt: 'An industrial kitchen: complete orders are prepared in bursts, plates leave one at a time, requests share a service rail, and storage bins grow.',
      sequence: 'Order arrives → whole-order prep → one plate at a time → shared service line',
    }
  }
  if (moduleId === 'tokenpath') {
    const servingIds = new Set([
      'tp.prefill', 'tp.parallel', 'tp.ttft', 'tp.decode', 'tp.last', 'tp.attn2',
      'tp.ffn2', 'tp.logits', 'tp.sample', 'tp.newtok', 'tp.stream', 'tp.cache', 'tp.kv', 'tp.grow',
    ])
    return servingIds.has(itemId)
      ? {
          src: './lessons/inference-kitchen.webp',
          alt: 'An industrial kitchen comparing complete-order preparation with a one-plate-at-a-time service loop.',
          sequence: 'Read the whole order → prepare context → serve one piece → repeat',
        }
      : {
          src: './lessons/transformer-office.webp',
          alt: 'An office cutaway showing text intake, shared context gathering, private transformation, and final candidate ranking.',
          sequence: 'Standardize the request → share context → transform privately → choose output',
        }
  }
  return undefined
}

interface Props {
  mod: ModuleDef
  item: Item
  marks: Record<string, Mark>
  focusId: string | null
}

export default function LessonVisual({ mod, item, marks, focusId }: Props) {
  const asset = assetFor(mod.id, item.id)
  const [mode, setMode] = useState<'analogy' | 'map'>(asset ? 'analogy' : 'map')
  const teaching = teachingLensFor(item.id)

  useEffect(() => setMode(asset ? 'analogy' : 'map'), [asset?.src, item.id])

  return (
    <div className="visual-column lesson-visual">
      <div className="visual-context"><span>{item.zone}</span><strong>{item.name}</strong></div>
      {asset && (
        <div className="visual-toggle" role="group" aria-label="Choose lesson visual">
          <button className={mode === 'analogy' ? 'active' : ''} onClick={() => setMode('analogy')}>Analogy</button>
          <button className={mode === 'map' ? 'active' : ''} onClick={() => setMode('map')}>Diagram</button>
        </div>
      )}
      {asset && mode === 'analogy' ? (
        <div className="analogy-visual">
          <img src={asset.src} alt={asset.alt} />
          <div className="analogy-sequence"><span>Mental model</span><strong>{asset.sequence}</strong></div>
          {teaching && <p>{teaching.analogy}</p>}
        </div>
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
      <div className="focus-caption"><span aria-hidden>◎</span>{mode === 'analogy' ? 'Use the analogy to remember the job; use Diagram to see where it lives.' : 'Everything unrelated is hidden while you learn this part.'}</div>
    </div>
  )
}

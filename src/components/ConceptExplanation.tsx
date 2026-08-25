import type { Item } from '../types'
import { conceptGuideFor } from '../data/beginner'
import { investorNoteFor } from '../data/guides'

interface Props {
  item: Item
  detailOverride?: string
  detailLabel?: string
  showInvestor?: boolean
}

export default function ConceptExplanation({
  item,
  detailOverride,
  detailLabel = 'What is happening',
  showInvestor = true,
}: Props) {
  const investorNote = showInvestor ? investorNoteFor(item.id) : undefined
  const guide = conceptGuideFor(item.id)

  if (!guide) {
    return (
      <>
        <p className="note">{detailOverride ?? item.note}</p>
        {investorNote && <div className="investor-lens"><span>Investor lens</span><p>{investorNote}</p></div>}
      </>
    )
  }

  return (
    <div className="concept-guide">
      <section className="concept-plain">
        <span>Plain English</span>
        <p>{guide.plain}</p>
      </section>

      {guide.steps && (
        <ol className="concept-steps" aria-label="What happens step by step">
          {guide.steps.map((step, index) => (
            <li key={step}><span>{index + 1}</span><p>{step}</p></li>
          ))}
        </ol>
      )}

      <div className="concept-detail-grid">
        <section>
          <span>{detailLabel}</span>
          <p>{detailOverride ?? item.note}</p>
        </section>
        <section className="prompt-connection">
          <span>Back to your prompt</span>
          <p>{guide.prompt}</p>
        </section>
      </div>

      {guide.caution && (
        <div className="concept-caution"><span>Do not picture it as</span><p>{guide.caution}</p></div>
      )}
      {investorNote && <div className="investor-lens"><span>Investor lens</span><p>{investorNote}</p></div>}
    </div>
  )
}

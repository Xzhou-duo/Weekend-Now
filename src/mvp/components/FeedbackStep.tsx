import type { FeedbackValue } from '../types'
import { trackMvp } from '../analytics'

const choices: { value: FeedbackValue; label: string; desc: string }[] = [
  { value: 'helpful', label: '有帮助', desc: '确实省了点纠结' },
  { value: 'ok', label: '一般', desc: '还行但需要再挑' },
  { value: 'not-helpful', label: '没用', desc: '不太贴我' },
]

export type FeedbackStepMode = 'post-depart' | 'post-visit'

const HEADER_COPY: Record<
  FeedbackStepMode,
  { title: string; subtitle: string }
> = {
  'post-depart': {
    title: '有没有让你心动的地方？',
    subtitle: '不用真的出门，感受对就行（MVP 验证用）。',
  },
  'post-visit': {
    title: '整体感受？',
    subtitle: '选一个最接近的就行（MVP 验证用）。',
  },
}

export function FeedbackStep({
  mode,
  onSubmit,
}: {
  mode: FeedbackStepMode
  onSubmit: (value: FeedbackValue) => void
}) {
  const header = HEADER_COPY[mode]

  return (
    <div className="flex flex-col gap-section">
      <header className="rounded-block bg-brand-purple px-card-inner py-5 text-center">
        <h2 className="text-title-section text-white">{header.title}</h2>
        <p className="mt-2 text-caption text-text-on-purple">
          {header.subtitle}
        </p>
      </header>

      <div className="flex flex-col gap-element">
        {choices.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              trackMvp('mvp_feedback_submit', { feedback: c.value })
              onSubmit(c.value)
            }}
            className="rounded-block border border-border-card bg-surface-card px-card-inner py-4 text-left shadow-card transition-colors duration-150 ease-out hover:border-brand-purple"
          >
            <span className="text-body font-medium text-text-primary">
              {c.label}
            </span>
            <p className="mt-1 text-caption text-text-secondary">{c.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

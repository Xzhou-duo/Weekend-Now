import { useState } from 'react'
import type {
  QuizAnswers,
  Recommendation,
  VisitOutcome,
  VisitPraiseTag,
  VisitReasonTag,
} from '../types'
import {
  BAD_REASON_OPTIONS,
  GOOD_REASON_OPTIONS,
  OUTCOME_OPTIONS,
  PRAISE_OPTIONS,
} from '../visitFeedbackUi'
import { PlaceIcon } from './PlaceIcon'
import { quizSubtitleLine } from '../recoUi'

const toneBg = {
  natural: 'bg-icon-block-natural',
  literate: 'bg-icon-block-literate',
  bazaar: 'bg-icon-block-bazaar',
} as const

const toneFg = {
  natural: 'text-teal-deep',
  literate: 'text-brand-purple-darkest',
  bazaar: 'text-amber-deep',
} as const

export function VisitFeedbackStep({
  item,
  quiz,
  onBack,
  onSubmit,
}: {
  item: Recommendation
  quiz: Required<QuizAnswers>
  onBack: () => void
  onSubmit: (payload: {
    outcome: VisitOutcome
    reasons: VisitReasonTag[]
    praiseTags?: VisitPraiseTag[]
  }) => void
}) {
  const [outcome, setOutcome] = useState<VisitOutcome | null>(null)
  const [reasons, setReasons] = useState<VisitReasonTag[]>([])
  const [praise, setPraise] = useState<VisitPraiseTag[]>([])

  const toggleReason = (r: VisitReasonTag) => {
    setReasons((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    )
  }

  const togglePraise = (p: VisitPraiseTag) => {
    setPraise((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  const reasonOptions =
    outcome === 'good'
      ? GOOD_REASON_OPTIONS
      : outcome === 'bad'
        ? BAD_REASON_OPTIONS
        : []

  const canSubmit =
    outcome !== null &&
    (outcome === 'ok' || reasons.length > 0 || outcome === 'good')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-element overflow-y-auto pb-4">
      <header className="-mx-page-h rounded-b-[20px] bg-brand-purple px-page-h pb-5 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-caption text-text-on-purple underline underline-offset-2"
        >
          返回
        </button>
        <h2 className="mt-3 text-title-section text-white">去过啦？</h2>
        <p className="mt-1 text-caption text-text-on-purple">
          {quizSubtitleLine(quiz)} · 帮我们把画像调准一点
        </p>
      </header>

      <div className="flex gap-element rounded-card border border-border-card bg-surface-card p-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-icon-block ${toneBg[item.venue.iconTone]}`}
        >
          <PlaceIcon
            name={item.venue.iconName}
            size={26}
            className={toneFg[item.venue.iconTone]}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-text-primary">
            {item.venue.name}
          </p>
          <p className="text-hint text-text-tertiary">{item.venue.categoryLine}</p>
        </div>
      </div>

      <section>
        <p className="mb-2 text-caption text-text-secondary">整体怎么样？</p>
        <div className="flex flex-col gap-2">
          {OUTCOME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setOutcome(opt.value)
                setReasons([])
                setPraise([])
              }}
              className={
                outcome === opt.value
                  ? 'rounded-block border border-brand-purple bg-brand-purple-light px-3 py-3 text-left'
                  : 'rounded-block border border-border-card bg-surface-card px-3 py-3 text-left'
              }
            >
              <span className="text-body font-medium text-text-primary">
                {opt.label}
              </span>
              <p className="mt-0.5 text-hint text-text-secondary">{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {outcome && outcome !== 'ok' && reasonOptions.length > 0 ? (
        <section>
          <p className="mb-2 text-caption text-text-secondary">
            {outcome === 'bad' ? '主要是哪方面？（可多选）' : '哪里做得好？'}
          </p>
          <div className="flex flex-wrap gap-2">
            {reasonOptions.map((opt) => {
              const on = reasons.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleReason(opt.value)}
                  className={
                    on
                      ? 'rounded-[10px] border border-brand-purple bg-brand-purple px-3 py-2 text-caption text-white'
                      : 'rounded-[10px] border border-border-card bg-surface-bg px-3 py-2 text-caption text-text-secondary'
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {outcome === 'good' ? (
        <section>
          <p className="mb-2 text-caption text-text-secondary">还想夸夸？（可选）</p>
          <div className="flex flex-wrap gap-2">
            {PRAISE_OPTIONS.map((opt) => {
              const on = praise.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => togglePraise(opt.value)}
                  className={
                    on
                      ? 'rounded-[10px] border border-teal bg-teal px-3 py-2 text-caption text-white'
                      : 'rounded-[10px] border border-border-card bg-surface-bg px-3 py-2 text-caption text-text-secondary'
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => {
          if (!outcome) return
          onSubmit({
            outcome,
            reasons,
            praiseTags: outcome === 'good' ? praise : undefined,
          })
        }}
        className="mt-auto w-full rounded-block bg-brand-purple py-3 text-body font-medium text-white disabled:opacity-40"
      >
        提交反馈
      </button>
    </div>
  )
}

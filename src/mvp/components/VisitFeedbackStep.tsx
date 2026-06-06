import { useState } from 'react'
import {
  IconArrowLeft,
  IconMoodHappy,
  IconMoodNeutral,
  IconMoodSad,
} from '@tabler/icons-react'
import type {
  QuizAnswers,
  Recommendation,
  VisitOutcome,
  VisitPraiseTag,
  VisitReasonTag,
} from '../types'
import {
  btnPurplePrimary,
  feedbackTagOff,
  feedbackTagOn,
  purpleHeader,
} from '../figmaUi'
import {
  BAD_REASON_OPTIONS,
  GOOD_REASON_OPTIONS,
  OUTCOME_OPTIONS,
  PRAISE_OPTIONS,
} from '../visitFeedbackUi'
import { AiReasonBox } from './AiReasonBox'
import { VenuePhoto } from './VenuePhoto'
import { quizSubtitleLine } from '../recoUi'

const OUTCOME_STYLE: Record<
  VisitOutcome,
  {
    active: string
    icon: typeof IconMoodHappy
    iconColor: string
    labelOn: string
  }
> = {
  good: {
    active: 'border-teal bg-teal-light',
    icon: IconMoodHappy,
    iconColor: 'text-teal',
    labelOn: 'text-teal-deep',
  },
  ok: {
    active: 'border-amber bg-amber-light',
    icon: IconMoodNeutral,
    iconColor: 'text-amber',
    labelOn: 'text-amber-deep',
  },
  bad: {
    active: 'border-danger-border bg-danger-light',
    icon: IconMoodSad,
    iconColor: 'text-danger-border',
    labelOn: 'text-danger',
  },
}

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
    (outcome === 'ok' || reasons.length > 0 || praise.length > 0)

  const aiNote =
    outcome === 'good' && praise.length > 0
      ? '根据你的反馈，AI 记录到：独自出行时你更在意「环境安静」，下次会优先推荐此类场所。'
      : outcome
        ? '提交后 AI 会结合本次出行更新你的口味画像。'
        : '选好感受与标签，推荐会越来越贴你。'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface-bg">
      <header className={`${purpleHeader} pb-[22px]`}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-caption text-text-on-purple"
        >
          <IconArrowLeft size={16} stroke={2} aria-hidden />
          这次去得怎么样？
        </button>
        <div className="mt-3 flex gap-2 rounded-[12px] bg-brand-purple-pale p-[8px_10px]">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[9px] bg-surface-secondary">
            <VenuePhoto
              imageId={item.venue.imageId}
              alt={item.venue.name}
              width={72}
              height={72}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-body font-medium text-brand-purple-navy">
              {item.venue.name}
            </p>
            <p className="text-caption text-brand-purple-deep">
              今天 · {quizSubtitleLine(quiz)}
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-0 py-3">
        <section>
          <p className="mb-2 text-body font-medium text-text-primary">总体感受</p>
          <div className="flex gap-2">
            {OUTCOME_OPTIONS.map((opt) => {
              const on = outcome === opt.value
              const style = OUTCOME_STYLE[opt.value]
              const Icon = style.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setOutcome(opt.value)
                    setReasons([])
                    if (opt.value !== 'good') setPraise([])
                  }}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-block border-[1.5px] px-1 py-3 ${
                    on
                      ? style.active
                      : 'border-border-card bg-surface-card'
                  }`}
                >
                  <Icon
                    size={20}
                    className={on ? style.iconColor : 'text-text-tertiary'}
                    stroke={1.8}
                  />
                  <span
                    className={`text-caption ${on ? style.labelOn : 'text-text-secondary'}`}
                  >
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {outcome === 'good' ? (
          <section className="rounded-block bg-surface-card px-card-inner py-[10px]">
            <p className="mb-2 text-caption text-text-secondary">
              哪里让你满意？（可多选）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRAISE_OPTIONS.map((opt) => {
                const on = praise.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => togglePraise(opt.value)}
                    className={on ? feedbackTagOn : feedbackTagOff}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        {outcome && outcome !== 'ok' && reasonOptions.length > 0 ? (
          <section className="rounded-block bg-surface-card px-card-inner py-[10px]">
            <p className="mb-2 text-caption text-text-secondary">
              {outcome === 'bad' ? '主要是哪方面？（可多选）' : '哪里做得好？'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {reasonOptions.map((opt) => {
                const on = reasons.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleReason(opt.value)}
                    className={on ? feedbackTagOn : feedbackTagOff}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        <AiReasonBox title="AI 正在更新你的画像" icon="refresh">
          {aiNote}
        </AiReasonBox>
      </div>

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
        className={`${btnPurplePrimary} mb-4 shrink-0 disabled:opacity-40`}
      >
        提交反馈，让推荐更懂你
      </button>
    </div>
  )
}

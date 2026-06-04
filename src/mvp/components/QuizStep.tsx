import { QUIZ_COPY } from '../mockData'
import type { QuizAnswers, Distance, Mood, Party } from '../types'

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? 'rounded-[10px] border border-brand-purple bg-brand-purple px-btn-inner-x py-[6px] text-caption font-medium text-white'
          : 'rounded-[10px] border border-border-card bg-surface-bg px-btn-inner-x py-[6px] text-caption text-text-secondary'
      }
    >
      {children}
    </button>
  )
}

export function QuizStep({
  quiz,
  onQuizChange,
  onSubmit,
  pending,
}: {
  quiz: QuizAnswers
  onQuizChange: (next: QuizAnswers) => void
  onSubmit: () => void
  pending?: boolean
}) {
  const setField = (
    key: keyof QuizAnswers,
    value: Party | Mood | Distance,
  ) => {
    onQuizChange({ ...quiz, [key]: value })
  }

  const canSubmit = Boolean(quiz.party && quiz.mood && quiz.distance)
  const answeredCount = [quiz.party, quiz.mood, quiz.distance].filter(Boolean).length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="-mx-page-h shrink-0 rounded-b-[20px] bg-brand-purple px-page-h pb-[18px] pt-4 text-left">
        <span className="inline-block rounded-badge bg-brand-purple-light px-2 py-1 text-hint font-semibold text-brand-purple-deep">
          周六 · 出门前
        </span>
        <h2 className="mt-2 text-title-section font-semibold text-white">
          今天出门前，先说下状态？
        </h2>
        <p className="mt-1.5 text-caption leading-[1.45] text-text-on-purple">
          已选好默认值，可直接生成；也可改一改更贴今天。
        </p>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {QUIZ_COPY.map((block, i) => (
            <div
              key={block.key}
              className={`h-[3px] flex-1 rounded-sm ${
                quiz[block.key] ? 'bg-white' : 'bg-white/25'
              }`}
              title={`第 ${i + 1} 题`}
            />
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-element overflow-y-auto py-3">
        {QUIZ_COPY.map((block, i) => (
          <section
            key={block.key}
            className="rounded-block border border-border-card bg-surface-card px-card-inner py-3 shadow-card"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple-light text-[10px] font-bold text-brand-purple">
                {i + 1}
              </span>
              <p className="text-caption font-medium text-text-primary">
                {block.label}
              </p>
            </div>
            <div className="flex flex-wrap gap-[6px]">
              {block.options.map((opt) => {
                const selected = quiz[block.key] === opt.value
                return (
                  <OptionButton
                    key={String(opt.value)}
                    selected={selected}
                    onClick={() => setField(block.key, opt.value)}
                  >
                    {opt.label}
                  </OptionButton>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="-mx-page-h shrink-0 border-t border-border-card bg-surface-card px-page-h pb-4 pt-2.5">
        <button
          type="button"
          disabled={!canSubmit || pending}
          onClick={() => {
            if (!canSubmit || pending) return
            onSubmit()
          }}
          className="w-full rounded-block bg-teal py-3 text-body font-semibold text-teal-light shadow-[0_4px_12px_rgba(29,158,117,0.25)] disabled:opacity-40"
        >
          {pending ? '正在生成方案…' : '生成今日专属方案 →'}
        </button>
        <p className="mt-1.5 text-center text-hint text-text-tertiary">
          {pending
            ? '正在结合口味档案与今日状态'
            : `已答 ${answeredCount}/3 · 约 3 秒生成`}
        </p>
      </div>
    </div>
  )
}

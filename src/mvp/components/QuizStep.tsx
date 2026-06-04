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
          ? 'rounded-[10px] border border-brand-purple bg-brand-purple px-btn-inner-x py-btn-inner-y text-caption font-medium text-white'
          : 'rounded-[10px] border border-border-card bg-surface-bg px-btn-inner-x py-btn-inner-y text-caption text-text-secondary'
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
  /** 调用 MiMo /api/recommend 时禁用 */
  pending?: boolean
}) {
  const setField = (
    key: keyof QuizAnswers,
    value: Party | Mood | Distance,
  ) => {
    onQuizChange({ ...quiz, [key]: value })
  }

  const canSubmit = Boolean(quiz.party && quiz.mood && quiz.distance)

  return (
    <div className="flex flex-col gap-[10px]">
      <header className="-mx-page-h rounded-b-[20px] bg-brand-purple px-page-h pb-5 pt-5 text-left">
        <span className="inline-block rounded-badge bg-brand-purple-light px-2 py-1 text-hint font-medium text-brand-purple-deep">
          周六 · 出门前
        </span>
        <h2 className="mt-3 text-title-section text-white">
          今天出门前，先说下状态？
        </h2>
        <p className="mt-2 text-caption text-text-on-purple">
          已选好默认值，可直接生成；也可改一改更贴今天。
        </p>
      </header>

      <div className="flex flex-col gap-element">
        {QUIZ_COPY.map((block) => (
          <section
            key={block.key}
            className="rounded-block border border-border-card bg-surface-card px-card-inner py-3 shadow-card"
          >
            <p className="mb-[6px] text-caption text-text-secondary">
              {block.label}
            </p>
            <div className="flex flex-wrap gap-[8px]">
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

      <button
        type="button"
        disabled={!canSubmit || pending}
        onClick={() => {
          if (!canSubmit || pending) return
          onSubmit()
        }}
        className="mt-section w-full rounded-block bg-teal py-3 text-body font-medium text-teal-light disabled:opacity-40"
      >
        {pending ? '正在生成方案…' : '生成今日专属方案 →'}
      </button>
    </div>
  )
}

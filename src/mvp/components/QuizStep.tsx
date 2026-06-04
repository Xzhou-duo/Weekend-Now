import { QUIZ_COPY } from '../mockData'
import {
  btnTealPrimary,
  purpleHeader,
  quizOptionOff,
  quizOptionOn,
} from '../figmaUi'
import type { QuizAnswers, Distance, Mood, Party } from '../types'

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

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface-bg">
      <header className={purpleHeader}>
        <span className="inline-block rounded-badge bg-brand-purple-light px-2 py-[3px] text-hint font-medium text-brand-purple-deep">
          周六早上
        </span>
        <h2 className="mt-1.5 text-title-section text-white">今天什么感觉？</h2>
        <p className="mt-1 text-caption text-text-on-purple">
          3个问题，AI帮你定制今日方案
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-section overflow-y-auto py-3">
        {QUIZ_COPY.map((block) => (
          <section
            key={block.key}
            className="rounded-block bg-surface-card px-card-inner py-[10px]"
          >
            <p className="mb-1.5 text-caption text-text-secondary">
              {block.label}
            </p>
            <div className="flex flex-wrap gap-[5px]">
              {block.options.map((opt) => {
                const selected = quiz[block.key] === opt.value
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setField(block.key, opt.value)}
                    className={selected ? quizOptionOn : quizOptionOff}
                  >
                    {opt.label}
                  </button>
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
        className={`${btnTealPrimary} mb-4 mt-1 shrink-0`}
      >
        {pending ? '正在生成方案…' : '生成今日专属方案 →'}
      </button>
    </div>
  )
}

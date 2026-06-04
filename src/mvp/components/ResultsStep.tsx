import type { QuizAnswers, Recommendation } from '../types'
import { PlaceIcon } from './PlaceIcon'
import { trackMvp } from '../analytics'
import { quizSubtitleLine } from '../recoUi'
import { RECO_DECK_MAX } from '../recommend'

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

export function ResultsStep({
  items,
  quiz,
  onNext,
  onEnterRecoSwipe,
  onOpenVenue,
  recoSource,
}: {
  items: Recommendation[]
  quiz: Required<QuizAnswers>
  onNext: () => void
  onEnterRecoSwipe: () => void
  onOpenVenue: (venueId: string) => void
  recoSource?: 'mimo' | 'rules'
}) {
  const preview = items.slice(0, 3)
  const exploreCount = items.filter((i) => i.explore).length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-element">
      <div className="rounded-b-none bg-surface-card px-page-h pb-2 pt-section">
        <h2 className="text-title-section text-text-primary">今日首推</h2>
        <p className="mt-[6px] text-caption leading-[1.4] text-text-secondary">
          {quizSubtitleLine(quiz)}
          {exploreCount > 0
            ? ` · 含 ${exploreCount} 个探索位`
            : ''}
        </p>
        <p className="mt-1 text-hint text-text-tertiary">
          {recoSource === 'mimo'
            ? '首推理由由 MiMo 生成；可刷卡浏览全部推荐并实时调整顺序。'
            : '本地规则已按「今日状态优先于历史口味」排序；建议刷卡挑一挑。'}
        </p>
      </div>

      <ul className="flex flex-col gap-element">
        {preview.map((row) => (
          <li
            key={row.venue.id}
            className="overflow-hidden rounded-card border border-border-card bg-surface-card p-[10px] shadow-card"
          >
            <button
              type="button"
              className="flex w-full gap-element text-left"
              onClick={() => {
                trackMvp('mvp_result_expand', { venueId: row.venue.id })
                onOpenVenue(row.venue.id)
              }}
            >
              <div
                className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-icon-block ${toneBg[row.venue.iconTone]}`}
              >
                <PlaceIcon
                  name={row.venue.iconName}
                  size={28}
                  className={toneFg[row.venue.iconTone]}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={`inline-block rounded-[6px] px-[6px] py-px text-hint font-medium ${
                    row.explore
                      ? 'bg-amber-light text-amber-deep'
                      : 'bg-teal-light text-teal-deep'
                  }`}
                >
                  {row.explore
                    ? '探索'
                    : `匹配 ${row.scorePercent ?? '—'}%`}
                </span>
                <h3 className="mt-1 truncate text-[12px] font-medium text-text-primary">
                  {row.venue.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-hint leading-[1.35] text-text-tertiary">
                  {row.reason}
                </p>
                <span className="mt-2 inline-block text-caption text-brand-purple-deep">
                  查看详情 →
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {items.length > 3 ? (
        <button
          type="button"
          onClick={() => {
            trackMvp('mvp_reco_swipe_enter', { deckSize: items.length })
            onEnterRecoSwipe()
          }}
          className="w-full rounded-block border-2 border-brand-purple bg-brand-purple-light py-3 text-body font-medium text-brand-purple-deep"
        >
          刷卡挑一挑（共 {Math.min(items.length, RECO_DECK_MAX)} 个）
        </button>
      ) : null}

      <div className="mt-auto pb-4 pt-2">
        <button
          type="button"
          onClick={() => onNext()}
          className="w-full rounded-block bg-brand-purple py-3 text-body font-medium text-white"
        >
          看完了 · 给个整体反馈
        </button>
      </div>
    </div>
  )
}

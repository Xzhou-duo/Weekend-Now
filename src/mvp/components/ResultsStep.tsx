import { useMemo, useState } from 'react'
import { IconChevronRight } from '@tabler/icons-react'
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

type ResultFilter = 'all' | 'food' | 'stroll' | 'cafe'

const FILTER_CHIPS: { id: ResultFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'food', label: '吃饭' },
  { id: 'stroll', label: '逛逛' },
  { id: 'cafe', label: '喝咖啡' },
]

function matchesFilter(item: Recommendation, filter: ResultFilter): boolean {
  if (filter === 'all') return true
  const tags = item.venue.tags
  if (filter === 'food') return tags.includes('food')
  if (filter === 'cafe') return tags.includes('cafe')
  return (
    tags.includes('market') ||
    tags.includes('neighbor') ||
    tags.includes('design')
  )
}

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
  const [filter, setFilter] = useState<ResultFilter>('all')
  const exploreCount = items.filter((i) => i.explore).length

  const filtered = useMemo(
    () => items.filter((row) => matchesFilter(row, filter)),
    [items, filter],
  )
  const preview = filtered.slice(0, 3)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border-card bg-surface-card pb-2">
        <div className="pt-1">
          <h2 className="text-title-section font-semibold text-text-primary">
            今日首推
          </h2>
          <p className="mt-1 text-caption leading-[1.4] text-text-secondary">
            {quizSubtitleLine(quiz)}
            {exploreCount > 0 ? ` · 含 ${exploreCount} 个探索位` : ''}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-badge bg-brand-purple-light px-2 py-1 text-hint font-medium text-brand-purple-deep">
            共 {items.length} 个候选
          </span>
          <span className="rounded-badge bg-teal-light px-2 py-1 text-hint font-medium text-teal-deep">
            {recoSource === 'mimo' ? 'MiMo 排序' : '本地规则排序'}
          </span>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={
                filter === chip.id
                  ? 'shrink-0 rounded-[20px] border border-brand-purple bg-brand-purple px-[11px] py-[5px] text-caption font-medium text-white'
                  : 'shrink-0 rounded-[20px] border border-border-card bg-surface-bg px-[11px] py-[5px] text-caption text-text-secondary'
              }
            >
              {chip.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-hint text-text-tertiary">
          {recoSource === 'mimo'
            ? '首推理由由 MiMo 生成；可刷卡浏览全部推荐。'
            : '已按「今日状态优先于历史口味」排序；建议刷卡挑一挑。'}
        </p>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-element overflow-y-auto py-3">
        {preview.length === 0 ? (
          <li className="rounded-block border border-border-card bg-surface-card p-4 text-center text-caption text-text-secondary">
            该分类下暂无推荐，试试「全部」
          </li>
        ) : (
          preview.map((row, idx) => (
            <li
              key={row.venue.id}
              className="overflow-hidden rounded-[14px] border border-border-card bg-surface-card p-[10px] shadow-card"
            >
              <button
                type="button"
                className="flex w-full items-stretch gap-2 text-left"
                onClick={() => {
                  trackMvp('mvp_result_expand', { venueId: row.venue.id })
                  onOpenVenue(row.venue.id)
                }}
              >
                <span className="w-[14px] shrink-0 pt-1 text-center text-[11px] font-bold text-text-tertiary">
                  {idx + 1}
                </span>
                <div
                  className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-icon-block ${toneBg[row.venue.iconTone]}`}
                >
                  <PlaceIcon
                    name={row.venue.iconName}
                    size={24}
                    className={toneFg[row.venue.iconTone]}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] font-semibold text-text-primary">
                    {row.venue.name}
                  </h3>
                  <span
                    className={`mt-1 inline-block rounded-[6px] px-[7px] py-px text-hint font-medium ${
                      row.explore
                        ? 'bg-brand-purple-light text-brand-purple-deep'
                        : 'bg-teal-light text-teal-deep'
                    }`}
                  >
                    {row.explore
                      ? '你说想要新鲜感'
                      : row.reason.slice(0, 18) +
                        (row.reason.length > 18 ? '…' : '')}
                  </span>
                  <p className="mt-1 text-hint text-text-tertiary">
                    {row.venue.categoryLine}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
                  <span
                    className={`rounded-badge px-2 py-1 text-hint font-bold ${
                      row.explore
                        ? 'bg-brand-purple-light text-brand-purple-deep'
                        : 'bg-teal-light text-teal-deep'
                    }`}
                  >
                    {row.explore ? '探索' : `${row.scorePercent ?? '—'}%`}
                  </span>
                  <IconChevronRight
                    size={14}
                    className="text-text-tertiary"
                    aria-hidden
                  />
                </div>
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="shrink-0 space-y-2 border-t border-border-card bg-surface-bg pb-4 pt-2">
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

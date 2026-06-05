import { useMemo, useState } from 'react'
import type { QuizAnswers, Recommendation } from '../types'
import {
  btnPurplePrimary,
  filterChipOff,
  filterChipOn,
  matchBadgeExplore,
  matchBadgeHi,
} from '../figmaUi'
import { PlaceIcon } from './PlaceIcon'
import { trackMvp } from '../analytics'
import { resultsListSubtitle, venueMetaLine } from '../recoUi'
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
}: {
  items: Recommendation[]
  quiz: Required<QuizAnswers>
  onNext: () => void
  onEnterRecoSwipe: () => void
  onOpenVenue: (venueId: string) => void
  recoSource?: 'mimo' | 'rules'
}) {
  const [filter, setFilter] = useState<ResultFilter>('all')

  const filtered = useMemo(
    () => items.filter((row) => matchesFilter(row, filter)),
    [items, filter],
  )
  const preview = filtered.slice(0, 3)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden bg-surface-bg">
      <div className="-mx-page-h shrink-0 bg-surface-card px-page-h pb-2 pt-3">
        <h2 className="text-title-section text-text-primary">
          为你挑了 {items.length} 个地方
        </h2>
        <p className="mt-0.5 text-caption text-text-secondary">
          {resultsListSubtitle(quiz)}
        </p>
      </div>

      <div className="-mx-page-h shrink-0 bg-surface-card px-page-h py-1.5">
        <div className="flex flex-wrap gap-[5px]">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={filter === chip.id ? filterChipOn : filterChipOff}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-element overflow-y-auto py-2">
        {preview.length === 0 ? (
          <li className="rounded-card bg-surface-card p-4 text-center text-caption text-text-secondary">
            该分类暂无结果，试试「全部」
          </li>
        ) : (
          preview.map((row) => (
            <li key={row.venue.id} className="rounded-card bg-surface-card p-[10px]">
              <button
                type="button"
                className="flex w-full items-start gap-[10px] text-left"
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
                    size={24}
                    className={toneFg[row.venue.iconTone]}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-text-primary">
                    {row.venue.name}
                  </div>
                  <p className="mt-[3px] text-[11px] leading-[1.5] text-text-secondary line-clamp-2">
                    {row.explore ? '为你加入一个新鲜探索' : row.reason}
                  </p>
                  <div className="text-hint text-text-tertiary">
                    {venueMetaLine(row.venue, quiz)}
                  </div>
                </div>
                <span
                  className={row.explore ? matchBadgeExplore : matchBadgeHi}
                >
                  {row.explore ? '探索' : `${row.scorePercent ?? '—'}%`}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="shrink-0 space-y-2 pb-4 pt-1">
        {items.length > 3 ? (
          <button
            type="button"
            onClick={() => {
              trackMvp('mvp_reco_swipe_enter', { deckSize: items.length })
              onEnterRecoSwipe()
            }}
            className="w-full rounded-block border border-brand-purple bg-brand-purple-light py-2.5 text-caption font-medium text-brand-purple-deep"
          >
            刷卡挑一挑（共 {Math.min(items.length, RECO_DECK_MAX)} 个）
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onNext()}
          className={btnPurplePrimary}
        >
          看完了，说说感受 →
        </button>
      </div>
    </div>
  )
}

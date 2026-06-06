import { IconSparkles } from '@tabler/icons-react'
import { COLD_START_TARGET } from '../coldStart'
import type { QuizAnswers, Recommendation } from '../types'
import {
  btnPurplePrimary,
  btnSecondary,
  filterChipOff,
  filterChipOn,
  matchBadgeExplore,
  matchBadgeHi,
  reasonTagPurple,
  reasonTagTeal,
} from '../figmaUi'
import { VenuePhoto } from './VenuePhoto'
import { resultsListSubtitle, venueMetaLine } from '../recoUi'
import { MvpProgressBar } from './MvpProgressBar'

const FILTER_LABELS = ['全部', '吃饭', '逛逛', '喝咖啡'] as const

function PreviewCard({ row, quiz }: { row: Recommendation; quiz: Required<QuizAnswers> }) {
  return (
    <div className="rounded-card bg-surface-card p-[10px]">
      <div className="flex items-start gap-[10px]">
        <div className="h-[54px] w-[54px] shrink-0 overflow-hidden rounded-icon-block bg-surface-secondary">
          <VenuePhoto
            imageId={row.venue.imageId}
            alt={row.venue.name}
            width={108}
            height={108}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium text-text-primary">
            {row.venue.name}
          </div>
          <span className={row.explore ? reasonTagPurple : reasonTagTeal}>
            {row.explore ? '探索' : '匹配推荐'}
          </span>
          <div className="text-hint text-text-tertiary">
            {venueMetaLine(row.venue, quiz)}
          </div>
        </div>
        <span className={row.explore ? matchBadgeExplore : matchBadgeHi}>
          {row.explore ? '探索' : '—%'}
        </span>
      </div>
    </div>
  )
}

export function ResultsEmptyStep({
  items,
  quiz,
  swipeCount,
  onContinueSwipe,
  onBrowseAnyway,
}: {
  items: Recommendation[]
  quiz: Required<QuizAnswers>
  swipeCount: number
  onContinueSwipe: () => void
  onBrowseAnyway: () => void
}) {
  const preview = items.slice(0, 2)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface-bg">
      <div className="-mx-page-h shrink-0 bg-surface-card px-page-h pb-2 pt-3">
        <h2 className="text-title-section text-text-primary">
          为你挑了 {items.length} 个地方
        </h2>
        <p className="mt-0.5 text-caption text-text-secondary">
          {resultsListSubtitle(quiz)}
        </p>
      </div>

      <div className="-mx-page-h shrink-0 bg-surface-card px-page-h py-1.5">
        <div className="flex flex-wrap gap-[5px] opacity-50 pointer-events-none">
          {FILTER_LABELS.map((label, i) => (
            <span
              key={label}
              className={i === 0 ? filterChipOn : filterChipOff}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative shrink-0 px-0 py-2 opacity-[0.35] pointer-events-none">
        <div className="flex flex-col gap-element">
          {preview.map((row) => (
            <PreviewCard key={row.venue.id} row={row} quiz={quiz} />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-surface-bg"
          aria-hidden
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-2 py-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-brand-purple-light">
          <IconSparkles size={38} className="text-brand-purple" aria-hidden />
        </div>
        <div>
          <p className="text-[14px] font-medium text-text-primary">
            再滑几张，推荐就准了
          </p>
          <p className="mt-1.5 whitespace-pre-line text-body-sm leading-[1.6] text-text-secondary">
            {'AI 还在了解你的口味\n完成口味建档后解锁专属推荐'}
          </p>
        </div>
        <div className="w-full rounded-[12px] bg-surface-bg p-card-inner text-left">
          <div className="mb-1.5 flex justify-between text-caption">
            <span className="text-text-secondary">口味建档进度</span>
            <span className="font-medium text-brand-purple">
              {swipeCount} / {COLD_START_TARGET} 张
            </span>
          </div>
          <MvpProgressBar current={swipeCount} total={COLD_START_TARGET} />
        </div>
        <div className="flex w-full flex-col gap-1.5">
          <button
            type="button"
            onClick={onContinueSwipe}
            className={btnPurplePrimary}
          >
            继续滑卡，完善口味
          </button>
          <button type="button" onClick={onBrowseAnyway} className={btnSecondary}>
            先看看大家都在去哪
          </button>
        </div>
        <p className="text-caption text-text-tertiary">
          完成后推荐准确度提升约 60%
        </p>
      </div>
    </div>
  )
}

import { IconArrowLeft, IconBookmark } from '@tabler/icons-react'
import type { QuizAnswers, Recommendation } from '../types'
import { AiReasonBox } from './AiReasonBox'
import { PlaceIcon } from './PlaceIcon'
import { venueMetaLine } from '../recoUi'

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

export function VenueDetailSheet({
  item,
  quiz,
  recoSource,
  bookmarked,
  onBack,
  onToggleBookmark,
  onDecideHere,
}: {
  item: Recommendation
  quiz: Required<QuizAnswers>
  recoSource?: 'mimo' | 'rules'
  bookmarked: boolean
  onBack: () => void
  onToggleBookmark: () => void
  onDecideHere: () => void
}) {
  const { venue } = item

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card-main bg-surface-card">
      <div className="flex items-center gap-2 border-b border-border-card px-3 py-3">
        <button
          type="button"
          aria-label="返回"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple-light text-brand-purple-deep"
        >
          <IconArrowLeft size={18} stroke={2} />
        </button>
        <span className="flex-1 text-caption font-medium text-text-primary">
          详情
        </span>
        <button
          type="button"
          aria-label={bookmarked ? '取消收藏' : '收藏'}
          onClick={onToggleBookmark}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            bookmarked ? 'bg-amber-light text-amber-collect' : 'bg-surface-bg text-text-secondary'
          }`}
        >
          <IconBookmark size={18} stroke={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-page-h py-4">
        <div
          className={`mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-icon-block ${toneBg[venue.iconTone]}`}
        >
          <PlaceIcon
            name={venue.iconName}
            size={42}
            className={toneFg[venue.iconTone]}
          />
        </div>
        <h2 className="mt-4 text-title-section text-text-primary">{venue.name}</h2>
        <p className="mt-1 text-caption text-text-secondary">
          {venue.categoryLine}
        </p>
        <p className="mt-2 text-caption text-text-tertiary">
          {venueMetaLine(venue, quiz)}
        </p>
        {item.explore ? (
          <span className="mt-3 inline-block rounded-badge bg-amber-light px-2 py-1 text-hint font-medium text-amber-deep">
            探索推荐 · 换换口味
          </span>
        ) : (
          <span className="mt-3 inline-block rounded-badge bg-teal-light px-2 py-1 text-hint font-medium text-teal-deep">
            匹配度约 {item.scorePercent ?? '—'}%
          </span>
        )}
        <div className="mt-4">
          <p className="mb-2 text-caption font-medium text-brand-purple-deep">
            为什么推荐给你
          </p>
          <AiReasonBox>{item.reason}</AiReasonBox>
        </div>
        <p className="mt-4 text-hint leading-[1.5] text-text-tertiary">
          {recoSource === 'mimo'
            ? '推荐语由 MiMo 生成，并结合今日状态与口味档案。'
            : '推荐语由本地规则生成，已按今日状态优先于历史偏好加权。'}
        </p>
      </div>

      <div className="border-t border-border-card p-3">
        <button
          type="button"
          onClick={onDecideHere}
          className="w-full rounded-block bg-brand-purple py-3 text-body font-medium text-white"
        >
          就去这家 · 回来后反馈
        </button>
      </div>
    </div>
  )
}

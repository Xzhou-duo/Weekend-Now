import {
  IconArrowLeft,
  IconBookmark,
  IconClock,
  IconCoin,
  IconMapPin,
} from '@tabler/icons-react'
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
  const meta = venueMetaLine(venue, quiz)

  return (
    <div className="-mx-page-h flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-bg">
      <div
        className={`relative flex h-[100px] shrink-0 items-center justify-center ${toneBg[venue.iconTone]}`}
      >
        <PlaceIcon
          name={venue.iconName}
          size={42}
          className={toneFg[venue.iconTone]}
        />
        <button
          type="button"
          aria-label="返回"
          onClick={onBack}
          className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-card"
        >
          <IconArrowLeft size={14} stroke={2} className="text-text-primary" />
        </button>
        <button
          type="button"
          aria-label={bookmarked ? '取消收藏' : '收藏'}
          onClick={onToggleBookmark}
          className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-card text-brand-purple"
        >
          <IconBookmark
            size={14}
            stroke={2}
            className={bookmarked ? 'text-amber-collect' : undefined}
          />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-page-h py-3">
        <h2 className="text-title-section text-text-primary">{venue.name}</h2>
        <div className="flex flex-wrap gap-2.5">
          <span className="flex items-center gap-1 text-caption text-text-secondary">
            <IconMapPin size={10} aria-hidden />
            {meta || venue.categoryLine}
          </span>
          <span className="flex items-center gap-1 text-caption text-text-secondary">
            <IconCoin size={10} aria-hidden />
            {venue.tags.includes('budget')
              ? '亲民'
              : venue.tags.includes('premium')
                ? '¥80/人'
                : '中等消费'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-caption text-text-secondary">
          <IconClock size={10} aria-hidden />
          营业中 · 11:00-22:00
        </div>
        <AiReasonBox>{item.reason}</AiReasonBox>
      </div>

      <div className="flex shrink-0 gap-2 px-page-h pb-[14px]">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-block border-[1.5px] border-border-card bg-surface-card py-[11px] text-body-sm text-text-secondary"
        >
          不感兴趣
        </button>
        <button
          type="button"
          onClick={onDecideHere}
          className="flex-[2] rounded-block bg-brand-purple py-3 text-body font-medium text-white"
        >
          就决定这里了
        </button>
      </div>
    </div>
  )
}

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
  const meta = venueMetaLine(venue, quiz)

  return (
    <div className="-mx-page-h flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-bg">
      <div
        className={`relative flex h-[112px] shrink-0 items-center justify-center ${toneBg[venue.iconTone]}`}
      >
        <PlaceIcon
          name={venue.iconName}
          size={40}
          className={`opacity-90 ${toneFg[venue.iconTone]}`}
        />
        <button
          type="button"
          aria-label="返回"
          onClick={onBack}
          className="absolute left-3 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-card shadow-card"
        >
          <IconArrowLeft size={14} stroke={2} className="text-text-primary" />
        </button>
        <button
          type="button"
          aria-label={bookmarked ? '取消收藏' : '收藏'}
          onClick={onToggleBookmark}
          className={`absolute right-3 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-card shadow-card ${
            bookmarked ? 'text-amber-collect' : 'text-brand-purple'
          }`}
        >
          <IconBookmark size={14} stroke={2} />
        </button>
      </div>

      <div className="-mt-3 flex min-h-0 flex-1 flex-col overflow-hidden px-page-h">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-[16px] bg-surface-card pt-3">
          <h2 className="text-title-section font-semibold text-text-primary">
            {venue.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-badge bg-surface-bg px-2 py-1 text-hint text-text-secondary">
              <IconMapPin size={11} aria-hidden />
              {meta || venue.categoryLine}
            </span>
            {item.explore ? (
              <span className="rounded-badge bg-amber-light px-2 py-1 text-hint font-medium text-amber-deep">
                探索推荐
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-badge bg-surface-bg px-2 py-1 text-hint text-text-secondary">
                <IconCoin size={11} aria-hidden />
                匹配 {item.scorePercent ?? '—'}%
              </span>
            )}
            <span className="flex items-center gap-1 rounded-badge bg-surface-bg px-2 py-1 text-hint text-text-secondary">
              <IconClock size={11} aria-hidden />
              {venue.categoryLine.split('·')[0]?.trim() ?? '营业中'}
            </span>
          </div>
          <div className="mt-3">
            <AiReasonBox>{item.reason}</AiReasonBox>
          </div>
          <p className="mt-3 text-hint leading-[1.5] text-text-tertiary">
            {recoSource === 'mimo'
              ? '推荐语由 MiMo 生成，并结合今日状态与口味档案。'
              : '推荐语由本地规则生成，已按今日状态优先于历史偏好加权。'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-border-card bg-surface-bg px-page-h py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-block border-[1.5px] border-border-card bg-surface-card py-[11px] text-caption text-text-secondary"
        >
          不感兴趣
        </button>
        <button
          type="button"
          onClick={onDecideHere}
          className="flex-[1.6] rounded-block bg-brand-purple py-[11px] text-caption font-semibold text-white shadow-[0_4px_12px_rgba(127,119,221,0.35)]"
        >
          就决定这里了
        </button>
      </div>
    </div>
  )
}

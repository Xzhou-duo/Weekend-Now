import { IconTrash } from '@tabler/icons-react'
import type { BookmarkEntry, Venue } from '../types'
import { PlaceIcon } from './PlaceIcon'

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

function timeLabel(savedAt: number): string {
  const daysAgo = Math.floor((Date.now() - savedAt) / 86_400_000)
  if (daysAgo === 0) return '今天存的'
  if (daysAgo === 1) return '昨天存的'
  if (daysAgo < 7) return `${daysAgo}天前`
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}周前`
  return `${Math.floor(daysAgo / 30)}个月前`
}

export function BookmarksView({
  bookmarks,
  venuesById,
  onSelect,
  onRemove,
}: {
  bookmarks: BookmarkEntry[]
  venuesById: Map<string, Venue>
  onSelect: (venueId: string) => void
  onRemove: (venueId: string) => void
}) {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-body text-text-secondary">还没有收藏</p>
        <p className="text-caption text-text-tertiary">
          在推荐结果或详情页上滑 / 点书签即可收藏
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-element overflow-y-auto py-3 pb-24">
      <p className="text-caption text-text-tertiary">
        共 {bookmarks.length} 个收藏 · 点击查看详情
      </p>
      <ul className="flex flex-col gap-element">
        {[...bookmarks].reverse().map((entry) => {
          const venue = venuesById.get(entry.venueId)
          if (!venue) return null
          return (
            <li
              key={entry.venueId}
              className="flex items-center gap-3 rounded-card bg-surface-card p-[10px]"
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => onSelect(entry.venueId)}
              >
                <div
                  className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-icon-block ${toneBg[venue.iconTone]}`}
                >
                  <PlaceIcon
                    name={venue.iconName}
                    size={20}
                    className={toneFg[venue.iconTone]}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text-primary">
                    {venue.name}
                  </p>
                  <p className="mt-0.5 text-hint text-text-tertiary">
                    {venue.categoryLine} · {timeLabel(entry.savedAt)}
                  </p>
                </div>
                <span className="shrink-0 text-caption text-text-tertiary">›</span>
              </button>

              <button
                type="button"
                aria-label="删除收藏"
                onClick={() => onRemove(entry.venueId)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-tertiary hover:bg-danger-light hover:text-danger"
              >
                <IconTrash size={14} stroke={1.8} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

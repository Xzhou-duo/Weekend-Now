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

export function BookmarksView({
  bookmarks,
  venuesById,
  onRemove,
}: {
  bookmarks: BookmarkEntry[]
  venuesById: Map<string, Venue>
  onRemove: (venueId: string) => void
}) {
  const sorted = [...bookmarks].sort((a, b) => b.savedAt - a.savedAt)

  if (sorted.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-page-h py-16 text-center">
        <p className="text-body font-medium text-text-primary">还没有收藏</p>
        <p className="mt-2 max-w-[260px] text-caption leading-[1.5] text-text-secondary">
          在推荐详情或刷卡时上滑收藏，会出现在这里。
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-element overflow-y-auto pb-24">
      <header className="pt-2">
        <h2 className="text-title-section text-text-primary">收藏夹</h2>
        <p className="mt-1 text-caption text-text-secondary">
          共 {sorted.length} 个去处
        </p>
      </header>

      <ul className="flex flex-col gap-element">
        {sorted.map((b) => {
          const venue = venuesById.get(b.venueId)
          if (!venue) return null
          return (
            <li
              key={b.venueId}
              className="flex items-center gap-element rounded-card border border-border-card bg-surface-card p-3 shadow-card"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-icon-block ${toneBg[venue.iconTone]}`}
              >
                <PlaceIcon
                  name={venue.iconName}
                  size={24}
                  className={toneFg[venue.iconTone]}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-text-primary">
                  {venue.name}
                </p>
                <p className="text-hint text-text-tertiary">
                  {venue.categoryLine}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(b.venueId)}
                className="shrink-0 rounded-badge px-2 py-1 text-hint text-danger"
              >
                删除
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

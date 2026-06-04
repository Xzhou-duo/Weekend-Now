import {
  IconCompass,
  IconBookmark,
  IconUser,
} from '@tabler/icons-react'

export type MainTab = 'discover' | 'bookmarks' | 'profile'

const tabs: { id: MainTab; label: string; Icon: typeof IconCompass }[] = [
  { id: 'discover', label: '发现', Icon: IconCompass },
  { id: 'bookmarks', label: '收藏', Icon: IconBookmark },
  { id: 'profile', label: '我的', Icon: IconUser },
]

export function PrototypeTabBar({
  active,
  onChange,
}: {
  active: MainTab
  onChange: (tab: MainTab) => void
}) {
  return (
    <nav className="flex shrink-0 border-t border-border-card bg-surface-card px-2 pb-2 pt-1.5">
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center gap-0.5 py-1"
          >
            <Icon
              size={20}
              stroke={1.8}
              className={on ? 'text-brand-purple' : 'text-text-tertiary'}
            />
            <span
              className={
                on
                  ? 'text-[10px] font-medium text-brand-purple'
                  : 'text-[10px] text-text-tertiary'
              }
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

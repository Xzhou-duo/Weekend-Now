import { IconRefresh, IconSparkles } from '@tabler/icons-react'

export function AiReasonBox({
  title = 'AI 为什么推荐这里',
  icon = 'sparkles',
  children,
}: {
  title?: string
  icon?: 'sparkles' | 'refresh'
  children: React.ReactNode
}) {
  const Icon = icon === 'refresh' ? IconRefresh : IconSparkles
  const iconSize = icon === 'refresh' ? 13 : 14

  return (
    <div className="rounded-block bg-brand-purple-light p-[10px_12px]">
      <div className="mb-1 flex items-center gap-[5px]">
        <Icon
          size={iconSize}
          className="shrink-0 text-brand-purple"
          stroke={1.5}
          aria-hidden
        />
        <span className="text-caption font-medium text-brand-purple-deep">
          {title}
        </span>
      </div>
      <p className="text-body-sm leading-[1.5] text-brand-purple-darkest">
        {children}
      </p>
    </div>
  )
}

import { IconSparkles } from '@tabler/icons-react'

export function AiReasonBox({
  title = 'AI 为什么推荐这里',
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-block bg-brand-purple-light p-[10px_12px]">
      <div className="mb-1 flex items-center gap-[5px]">
        <IconSparkles
          size={14}
          className="shrink-0 text-brand-purple"
          stroke={1.5}
          aria-hidden
        />
        <span className="text-hint font-medium text-brand-purple-deep">
          {title}
        </span>
      </div>
      <p className="text-body-sm leading-[1.5] text-brand-purple-darkest">
        {children}
      </p>
    </div>
  )
}

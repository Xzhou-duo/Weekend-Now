import { IconSparkles } from '@tabler/icons-react'

export function AiReasonBox({
  title = '为什么这么推',
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-block bg-brand-purple-light p-[10px_12px]">
      <div className="flex items-center gap-[6px]">
        <IconSparkles
          size={14}
          className="shrink-0 text-brand-purple"
          stroke={1.5}
          aria-hidden
        />
        <span className="text-caption font-medium text-brand-purple-deep">
          {title}
        </span>
      </div>
      <p className="mt-[6px] text-body-sm leading-[1.5] text-brand-purple-darkest">
        {children}
      </p>
    </div>
  )
}

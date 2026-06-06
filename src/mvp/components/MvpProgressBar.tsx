export function MvpProgressBar({
  current,
  total,
  variant = 'default',
}: {
  current: number
  total: number
  variant?: 'default' | 'onPurple'
}) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  const onPurple = variant === 'onPurple'
  return (
    <div className="flex items-center gap-element">
      <div
        className={`h-[6px] flex-1 overflow-hidden rounded-[3px] ${
          onPurple ? 'bg-brand-purple-pale' : 'bg-brand-purple-light'
        }`}
      >
        <div
          className={`h-full rounded-[3px] transition-[width] duration-300 ease-out ${
            onPurple ? 'bg-white' : 'bg-brand-purple'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`shrink-0 text-hint tabular-nums ${
          onPurple ? 'text-text-on-purple' : 'text-text-secondary'
        }`}
      >
        {current} / {total}
      </span>
    </div>
  )
}

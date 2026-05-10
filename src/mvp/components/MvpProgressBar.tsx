export function MvpProgressBar({
  current,
  total,
}: {
  current: number
  total: number
}) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div className="flex items-center gap-element">
      <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-brand-purple-light">
        <div
          className="h-full rounded-[3px] bg-brand-purple transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-hint text-text-secondary tabular-nums">
        {current} / {total}
      </span>
    </div>
  )
}

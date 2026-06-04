export function MvpProgressBar({
  current,
  total,
  label = '建档进度',
}: {
  current: number
  total: number
  label?: string
}) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-hint font-semibold text-brand-purple">{label}</span>
        <span className="shrink-0 text-hint tabular-nums text-text-secondary">
          {current} / {total}
        </span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-[3px] bg-brand-purple-light">
        <div
          className="h-full rounded-[3px] bg-gradient-to-r from-brand-purple to-[#9A93E8] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import type { Recommendation } from '../types'
import { AiReasonBox } from './AiReasonBox'
import { PlaceIcon } from './PlaceIcon'
import { trackMvp } from '../analytics'

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

export function ResultsStep({
  items,
  onNext,
  recoSource,
}: {
  items: Recommendation[]
  onNext: () => void
  recoSource?: 'mimo' | 'rules'
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.venue.id ?? null)

  const toggle = (id: string) => {
    setOpenId((prev) => {
      const next = prev === id ? null : id
      if (next === id)
        trackMvp('mvp_result_expand', {
          venueId: id,
        })
      return next
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-element">
      <div className="rounded-b-none bg-surface-card px-page-h pb-2 pt-section">
        <h2 className="text-title-section text-text-primary">
          为你挑了 {items.length} 个去处
        </h2>
        <p className="mt-[6px] text-caption leading-[1.4] text-text-secondary">
          {recoSource === 'mimo'
            ? '本次推荐语由 MiMo-V2.5-Pro 生成，并结合了你的状态与滑卡偏好。'
            : '本次使用本地规则推荐（MiMo 未返回可用结果或未启动 API 示例）。'}
        </p>
      </div>

      <ul className="flex flex-col gap-element pb-28">
        {items.map((row, idx) => {
          const expanded = openId === row.venue.id
          return (
            <li
              key={row.venue.id}
              className="overflow-hidden rounded-card border border-border-card bg-surface-card p-[10px] shadow-card"
            >
              <div className="flex gap-element">
                <div
                  className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-icon-block ${toneBg[row.venue.iconTone]}`}
                >
                  <PlaceIcon
                    name={row.venue.iconName}
                    size={28}
                    className={toneFg[row.venue.iconTone]}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-[6px] bg-teal-light px-[6px] py-px text-hint font-medium text-teal-deep">
                        匹配 {(88 - idx * 7)}%
                      </span>
                      <h3 className="mt-1 truncate text-[12px] font-medium leading-tight text-text-primary">
                        {row.venue.name}
                      </h3>
                      <p className="mt-px text-hint leading-[1.3] text-text-tertiary">
                        {row.venue.categoryLine}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-2 flex items-center gap-1 text-caption text-brand-purple-deep"
                    onClick={() => toggle(row.venue.id)}
                  >
                    {expanded ? '收起理由' : '展开理由'}
                    {expanded ? (
                      <IconChevronUp size={14} stroke={2} aria-hidden />
                    ) : (
                      <IconChevronDown size={14} stroke={2} aria-hidden />
                    )}
                  </button>
                  {expanded && (
                    <div className="mt-2">
                      <AiReasonBox>{row.reason}</AiReasonBox>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 bg-surface-bg/95 px-page-h pb-4 pt-2 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => onNext()}
          className="w-full rounded-block bg-brand-purple py-3 text-body font-medium text-white"
        >
          看完了 · 给个整体反馈
        </button>
      </div>
    </div>
  )
}

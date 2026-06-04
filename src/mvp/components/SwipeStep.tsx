import type { CSSProperties } from 'react'
import { useCallback, useRef, useState } from 'react'
import { IconBookmark, IconHeartFilled, IconX } from '@tabler/icons-react'
import { COLD_START_TARGET } from '../coldStart'
import { SWIPE_DECK } from '../mockData'
import type { SwipeAction, SwipeCardModel, TasteTag } from '../types'
import { Chip } from './Chip'
import { MvpProgressBar } from './MvpProgressBar'
import { PlaceIcon } from './PlaceIcon'
import { trackMvp } from '../analytics'

const iconToneBg: Record<SwipeCardModel['iconTone'], string> = {
  natural: 'bg-icon-block-natural',
  literate: 'bg-icon-block-literate',
  bazaar: 'bg-icon-block-bazaar',
}

const iconToneFg: Record<SwipeCardModel['iconTone'], string> = {
  natural: 'text-teal-deep',
  literate: 'text-brand-purple-darkest',
  bazaar: 'text-amber-deep',
}

function SwipeCardFrame({
  model,
  style,
}: {
  model: SwipeCardModel
  style?: CSSProperties
}) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-card-main border border-border-card bg-surface-card shadow-card"
      style={style}
    >
      <div
        className={`relative flex h-[110px] shrink-0 items-center justify-center ${iconToneBg[model.iconTone]}`}
      >
        <PlaceIcon name={model.iconName} className={iconToneFg[model.iconTone]} />
        <span className="absolute left-[10px] top-[10px] rounded-badge bg-white px-2 py-1 text-hint font-medium text-teal-deep">
          口味测试
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-[6px] p-[10px_12px] pb-3">
        <h3 className="text-title-card text-text-primary">{model.title}</h3>
        <p className="text-caption leading-[1.4] text-text-secondary">
          {model.description}
        </p>
        <div className="mt-1 flex flex-wrap gap-[6px]">
          {model.chips.map((c) => (
            <Chip key={c.text} variant={c.variant}>
              {c.text}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SwipeStep({
  onComplete,
  priorSwipeCount = 0,
  canSkipUsingProfile = false,
  onSkipToQuiz,
}: {
  onComplete: (records: { tags: TasteTag[]; action: SwipeAction }[]) => void
  /** 历史累计滑卡次数（用于文案） */
  priorSwipeCount?: number
  canSkipUsingProfile?: boolean
  onSkipToQuiz?: () => void
}) {
  const total = SWIPE_DECK.length
  const [index, setIndex] = useState(0)
  const [records, setRecords] = useState<
    { tags: TasteTag[]; action: SwipeAction }[]
  >([])

  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const drag = useRef({ active: false, startX: 0, startY: 0 })

  const current = SWIPE_DECK[index]
  const lifetimeDone = priorSwipeCount >= COLD_START_TARGET

  const finalize = useCallback(
    (action: SwipeAction) => {
      if (!current) return
      const next = [...records, { tags: [...current.tags], action }]
      setRecords(next)
      setDx(0)
      setDy(0)
      if (index + 1 >= total) {
        trackMvp('mvp_swipe_done', {
          count: next.length,
          lifetimePrior: priorSwipeCount,
        })
        onComplete(next)
      } else {
        setIndex((i) => i + 1)
      }
    },
    [current, index, onComplete, priorSwipeCount, records, total],
  )

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: e.clientX, startY: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    setDx(e.clientX - drag.current.startX)
    setDy(e.clientY - drag.current.startY)
  }

  const onPointerUp = () => {
    if (!drag.current.active || !current) return
    drag.current.active = false
    const tX = 72
    const tY = -64
    if (dy < tY && Math.abs(dy) > Math.abs(dx)) finalize('bookmark')
    else if (dx > tX) finalize('like')
    else if (dx < -tX) finalize('dislike')
    setDx(0)
    setDy(0)
  }

  if (!current) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[10px]">
      <div>
        <p className="text-caption text-text-secondary">嗨，先认识一下你的口味</p>
        <h2 className="mt-1 text-title-page text-text-primary">
          <span className="border-b-2 border-brand-purple text-brand-purple">
            喜欢
          </span>
          右滑 · 不喜左滑 · 收藏上滑
        </h2>
        <p className="mt-2 text-hint leading-[1.45] text-text-tertiary">
          {lifetimeDone
            ? '口味档案已建立，本轮滑卡会微调推荐。'
            : `滑满 ${COLD_START_TARGET} 张后推荐更准（环境 · 价格 · 类型 · 社交）。`}
        </p>
        <div className="mt-3">
          <MvpProgressBar current={records.length} total={total} />
          {!lifetimeDone && priorSwipeCount > 0 ? (
            <p className="mt-1.5 text-hint text-text-tertiary">
              历史已累计 {priorSwipeCount} 次滑卡信号
            </p>
          ) : null}
        </div>
        {canSkipUsingProfile && onSkipToQuiz ? (
          <button
            type="button"
            onClick={onSkipToQuiz}
            className="mt-3 w-full rounded-block border border-brand-purple bg-brand-purple-light py-2.5 text-caption font-medium text-brand-purple-deep"
          >
            跳过 · 使用已有口味档案
          </button>
        ) : null}
      </div>

      <div className="relative min-h-[280px] flex-1 pb-2">
        <div
          className="touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="origin-bottom will-change-transform"
            style={{
              transform: `translate(${dx}px, ${dy}px) rotate(${dx * 0.04}deg)`,
            }}
          >
            <SwipeCardFrame model={current} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-[14px] bg-surface-bg py-3">
        <button
          type="button"
          aria-label="不喜欢"
          onClick={() => finalize('dislike')}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-danger-light text-danger"
        >
          <IconX size={20} stroke={2} />
        </button>
        <button
          type="button"
          aria-label="喜欢"
          onClick={() => finalize('like')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple text-brand-purple-light"
        >
          <IconHeartFilled size={24} />
        </button>
        <button
          type="button"
          aria-label="收藏"
          onClick={() => finalize('bookmark')}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-amber-light text-amber-collect"
        >
          <IconBookmark size={20} stroke={2} />
        </button>
      </div>
    </div>
  )
}

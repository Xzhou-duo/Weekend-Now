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
  className = '',
}: {
  model: SwipeCardModel
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-[18px] border border-border-card bg-surface-card shadow-card ${className}`}
      style={style}
    >
      <div
        className={`relative flex h-[108px] shrink-0 items-center justify-center ${iconToneBg[model.iconTone]}`}
      >
        <PlaceIcon name={model.iconName} className={iconToneFg[model.iconTone]} />
        <span className="absolute left-[10px] top-[10px] rounded-badge bg-white px-2 py-1 text-hint font-semibold text-teal-deep">
          口味测试
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-[6px] p-[10px_12px] pb-3">
        <h3 className="text-title-card font-semibold text-text-primary">
          {model.title}
        </h3>
        <p className="text-caption leading-[1.45] text-text-secondary">
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

function SwipeActionCol({
  label,
  onClick,
  ariaLabel,
  children,
  size = 'md',
}: {
  label: string
  onClick: () => void
  ariaLabel: string
  children: React.ReactNode
  size?: 'md' | 'lg'
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className={
          size === 'lg'
            ? 'flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple text-brand-purple-light shadow-[0_6px_16px_rgba(127,119,221,0.45)]'
            : 'flex h-11 w-11 items-center justify-center rounded-full'
        }
      >
        {children}
      </button>
      <span className="text-[8px] text-text-secondary">{label}</span>
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
  const nextCard = SWIPE_DECK[index + 1]
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border-card bg-surface-card pb-2.5 pt-1">
        <p className="text-caption text-text-secondary">嗨，先认识一下你的口味</p>
        <h2 className="mt-1 text-title-page font-semibold leading-[1.35] text-text-primary">
          <span className="border-b-2 border-brand-purple text-brand-purple">
            喜欢
          </span>
          右滑 · 不喜左滑 · 收藏上滑
        </h2>
        <p className="mt-1.5 text-hint leading-[1.4] text-text-tertiary">
          {lifetimeDone
            ? '口味档案已建立，本轮滑卡会微调推荐。'
            : `滑满 ${COLD_START_TARGET} 张后推荐更准（环境 · 价格 · 类型 · 社交）。`}
        </p>
      </div>

      <div className="shrink-0 bg-surface-card px-0 pb-2.5 pt-2">
        <MvpProgressBar current={records.length} total={total} />
        {!lifetimeDone && priorSwipeCount > 0 ? (
          <p className="mt-1.5 text-hint text-text-tertiary">
            历史已累计 {priorSwipeCount} 次滑卡信号
          </p>
        ) : null}
        {canSkipUsingProfile && onSkipToQuiz ? (
          <button
            type="button"
            onClick={onSkipToQuiz}
            className="mt-2.5 w-full rounded-block border border-brand-purple bg-brand-purple-light py-2.5 text-caption font-medium text-brand-purple-deep"
          >
            跳过 · 使用已有口味档案
          </button>
        ) : null}
      </div>

      <div className="relative min-h-[220px] flex-1 px-0 py-2">
        {nextCard ? (
          <div
            className="pointer-events-none absolute inset-x-1.5 top-2 bottom-0 scale-[0.96] rounded-[18px] border border-border-card bg-surface-card opacity-55"
            aria-hidden
          />
        ) : null}
        <div
          className="relative mx-0 h-full min-h-[200px] touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="absolute inset-0 origin-bottom will-change-transform"
            style={{
              transform: `translate(${dx}px, ${dy}px) rotate(${dx * 0.04}deg)`,
            }}
          >
            <SwipeCardFrame model={current} className="h-full" />
          </div>
        </div>
      </div>

      <div className="-mx-page-h shrink-0 border-t border-border-card bg-surface-card px-page-h pb-4 pt-2.5">
        <p className="mb-2.5 text-center text-hint text-text-tertiary">
          也可点下方按钮操作
        </p>
        <div className="flex items-end justify-center gap-5">
          <SwipeActionCol
            label="不喜欢"
            ariaLabel="不喜欢"
            onClick={() => finalize('dislike')}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-light text-danger">
              <IconX size={18} stroke={2} />
            </span>
          </SwipeActionCol>
          <SwipeActionCol
            label="喜欢"
            ariaLabel="喜欢"
            size="lg"
            onClick={() => finalize('like')}
          >
            <IconHeartFilled size={22} />
          </SwipeActionCol>
          <SwipeActionCol
            label="收藏"
            ariaLabel="收藏"
            onClick={() => finalize('bookmark')}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-light text-amber-collect">
              <IconBookmark size={18} stroke={2} />
            </span>
          </SwipeActionCol>
        </div>
      </div>
    </div>
  )
}

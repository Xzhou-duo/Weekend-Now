import type { CSSProperties } from 'react'
import { useCallback, useRef, useState } from 'react'
import { IconBookmark, IconHeartFilled, IconX } from '@tabler/icons-react'
import { COLD_START_TARGET } from '../coldStart'
import { SWIPE_DECK } from '../mockData'
import type { SwipeAction, SwipeCardModel, TasteTag } from '../types'
import { Chip } from './Chip'
import { MvpProgressBar } from './MvpProgressBar'
import { VenuePhoto } from './VenuePhoto'
import { trackMvp } from '../analytics'

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
      className={`flex flex-col overflow-hidden rounded-card-main border border-border-card bg-surface-card ${className}`}
      style={style}
    >
      <div className="relative h-[160px] shrink-0 overflow-hidden bg-surface-secondary">
        <VenuePhoto
          imageId={model.imageId}
          alt={model.title}
          width={480}
          height={320}
          loading="eager"
        />
        <span className="absolute left-2 top-2 rounded-badge bg-white/90 px-2 py-[3px] text-hint font-medium text-teal-deep backdrop-blur-[2px]">
          口味测试
        </span>
      </div>
      <div className="flex flex-1 flex-col p-[10px_12px]">
        <h3 className="text-title-card-sm text-text-primary">{model.title}</h3>
        <p className="mt-[3px] text-caption leading-[1.4] text-text-secondary">
          {model.description}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
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
  const [isDragging, setIsDragging] = useState(false)
  const drag = useRef({ active: false, startX: 0, startY: 0 })

  const current = SWIPE_DECK[index]
  const lifetimeDone = priorSwipeCount >= COLD_START_TARGET
  const sessionCurrent = priorSwipeCount + records.length

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
    setIsDragging(true)
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
    setIsDragging(false)
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
    <div className="flex min-h-0 flex-1 flex-col bg-surface-bg">
      <div className="shrink-0 bg-surface-card px-0 pb-2.5 pt-1">
        <p className="text-caption text-text-secondary">嗨，先认识一下你的口味</p>
        <h2 className="mt-0.5 text-title-page leading-[1.2] text-text-primary">
          左滑不喜欢，
          <br />
          右滑
          <span className="border-b-2 border-brand-purple text-brand-purple">
            喜欢
          </span>
        </h2>
        {!lifetimeDone ? (
          <p className="mt-1 text-hint text-text-tertiary">
            收藏上滑 · 滑满 {COLD_START_TARGET} 张后推荐更准
          </p>
        ) : null}
      </div>

      <div className="shrink-0 bg-surface-card py-2">
        <MvpProgressBar
          current={sessionCurrent}
          total={COLD_START_TARGET}
        />
        {canSkipUsingProfile && onSkipToQuiz ? (
          <button
            type="button"
            onClick={onSkipToQuiz}
            className="mt-2 w-full rounded-block border border-brand-purple bg-brand-purple-light py-2 text-caption font-medium text-brand-purple-deep"
          >
            跳过 · 使用已有口味档案
          </button>
        ) : null}
      </div>

      <div className="relative min-h-[220px] flex-1 px-0 py-2">
        <div
          className="h-full touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="h-full origin-bottom will-change-transform"
            style={{
              transform: `translate(${dx}px, ${dy}px)`,
            }}
          >
            <div
              className="relative h-full"
              style={{
                transform: `rotate(${dx * 0.06}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
              }}
            >
              {Math.abs(dx) > 10 && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-card-main"
                  style={{
                    background:
                      dx > 0
                        ? `rgba(34, 197, 94, ${Math.min(dx / 120, 0.28)})`
                        : `rgba(239, 68, 68, ${Math.min(Math.abs(dx) / 120, 0.28)})`,
                    transition: 'background 0.05s',
                  }}
                />
              )}
              {dy < -15 && Math.abs(dy) > Math.abs(dx) && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-card-main"
                  style={{
                    background: `rgba(245, 158, 11, ${Math.min(Math.abs(dy) / 100, 0.25)})`,
                    transition: 'background 0.05s',
                  }}
                />
              )}

              <SwipeCardFrame model={current} className="h-full" />

              <div
                className="pointer-events-none absolute right-3 top-3 rotate-[18deg] rounded-[6px] border-2 border-green-500 px-2 py-0.5"
                style={{ opacity: Math.min(Math.max(dx - 20, 0) / 80, 1) }}
              >
                <span className="text-[13px] font-bold text-green-500">喜欢</span>
              </div>

              <div
                className="pointer-events-none absolute left-3 top-3 rotate-[-18deg] rounded-[6px] border-2 border-red-400 px-2 py-0.5"
                style={{ opacity: Math.min(Math.max(-dx - 20, 0) / 80, 1) }}
              >
                <span className="text-[13px] font-bold text-red-400">跳过</span>
              </div>

              <div
                className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-[6px] border-2 border-amber-400 px-2 py-0.5"
                style={{
                  opacity:
                    dy < -15 && Math.abs(dy) > Math.abs(dx)
                      ? Math.min(Math.abs(dy) / 80, 1)
                      : 0,
                }}
              >
                <span className="text-[13px] font-bold text-amber-400">收藏</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-end justify-center gap-[14px] bg-surface-bg px-page-h pb-3 pt-2">
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            aria-label="不喜欢"
            onClick={() => finalize('dislike')}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-danger-light text-danger"
          >
            <IconX size={20} stroke={2} />
          </button>
          <span className="text-[9px] text-text-tertiary">不喜欢</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            aria-label="喜欢"
            onClick={() => finalize('like')}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple text-brand-purple-light"
          >
            <IconHeartFilled size={24} />
          </button>
          <span className="text-[9px] text-text-tertiary">喜欢</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            aria-label="收藏"
            onClick={() => finalize('bookmark')}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-amber-light text-amber-collect"
          >
            <IconBookmark size={20} stroke={2} />
          </button>
          <span className="text-[9px] text-text-tertiary">收藏 / 上滑</span>
        </div>
      </div>
    </div>
  )
}

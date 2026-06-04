import type { CSSProperties } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  IconArrowLeft,
  IconBookmark,
  IconHeartFilled,
  IconX,
} from '@tabler/icons-react'
import type { QuizAnswers, Recommendation, SwipeAction, TasteTag } from '../types'
import { AiReasonBox } from './AiReasonBox'
import { MvpProgressBar } from './MvpProgressBar'
import { PlaceIcon } from './PlaceIcon'
import { trackMvp } from '../analytics'
import { venueMetaLine } from '../recoUi'

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

function RecoCard({
  item,
  style,
}: {
  item: Recommendation
  style?: CSSProperties
}) {
  const { venue } = item
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-card-main border border-border-card bg-surface-card shadow-card"
      style={style}
    >
      <div
        className={`relative flex h-[100px] shrink-0 items-center justify-center ${toneBg[venue.iconTone]}`}
      >
        <PlaceIcon
          name={venue.iconName}
          className={toneFg[venue.iconTone]}
          size={40}
        />
        {item.explore ? (
          <span className="absolute left-[10px] top-[10px] rounded-[8px] bg-amber-light px-2 py-1 text-[9px] font-medium text-amber-deep">
            换换口味
          </span>
        ) : (
          <span className="absolute left-[10px] top-[10px] rounded-[8px] bg-teal-light px-2 py-1 text-[9px] font-medium text-teal-deep">
            匹配 {item.scorePercent ?? '—'}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <h3 className="text-title-card text-text-primary">{venue.name}</h3>
        <p className="text-caption text-text-tertiary">{venue.categoryLine}</p>
        <AiReasonBox>{item.reason}</AiReasonBox>
      </div>
    </div>
  )
}

export function RecoSwipeStep({
  initialDeck,
  quiz,
  rerankRemaining,
  onComplete,
  onBack,
  onOpenDetail,
  onBookmarkVenue,
}: {
  initialDeck: Recommendation[]
  quiz: Required<QuizAnswers>
  rerankRemaining: (
    remaining: Recommendation[],
    session: { tags: TasteTag[]; action: SwipeAction }[],
  ) => Recommendation[]
  onComplete: (session: { tags: TasteTag[]; action: SwipeAction }[]) => void
  onBack: () => void
  onOpenDetail: (venueId: string) => void
  onBookmarkVenue?: (venueId: string) => void
}) {
  const [queue, setQueue] = useState<Recommendation[]>(() => [...initialDeck])
  const [session, setSession] = useState<
    { tags: TasteTag[]; action: SwipeAction }[]
  >([])
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const drag = useRef({ active: false, startX: 0, startY: 0 })

  const total = initialDeck.length
  const done = total - queue.length
  const current = queue[0]

  const finalize = useCallback(
    (action: SwipeAction) => {
      if (!current) return
      const record = { tags: [...current.venue.tags], action }
      if (action === 'bookmark') onBookmarkVenue?.(current.venue.id)
      const nextSession = [...session, record]
      setSession(nextSession)
      trackMvp('mvp_reco_swipe_action', {
        venueId: current.venue.id,
        action,
        remaining: queue.length - 1,
      })

      const rest = queue.slice(1)
      const reranked = rerankRemaining(rest, nextSession)
      setQueue(reranked)
      setDx(0)
      setDy(0)

      if (reranked.length === 0) {
        trackMvp('mvp_reco_swipe_done', { count: nextSession.length })
        onComplete(nextSession)
      }
    },
    [current, onBookmarkVenue, onComplete, queue, rerankRemaining, session],
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

  const meta = useMemo(
    () => (current ? venueMetaLine(current.venue, quiz) : ''),
    [current, quiz],
  )

  if (!current) {
    return (
      <div className="flex flex-1 items-center justify-center text-caption text-text-secondary">
        没有更多推荐了
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          aria-label="返回"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-text-secondary"
        >
          <IconArrowLeft size={18} stroke={2} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-title-section text-text-primary">刷卡挑去处</h2>
          <p className="text-caption text-text-secondary">
            左滑跳过 · 右滑想去 · 上滑收藏；顺序会随你的反馈调整
          </p>
        </div>
      </div>

      <MvpProgressBar current={done} total={total} />

      <p className="mt-2 text-hint text-text-tertiary">{meta}</p>

      <div className="relative mt-2 min-h-[300px] flex-1">
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
            <RecoCard item={current} />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mb-2 text-center text-caption text-brand-purple-deep underline underline-offset-2"
        onClick={() => onOpenDetail(current.venue.id)}
      >
        查看详情与完整理由
      </button>

      <div className="flex items-center justify-center gap-[14px] py-2">
        <button
          type="button"
          aria-label="不感兴趣"
          onClick={() => finalize('dislike')}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-danger-light text-danger"
        >
          <IconX size={20} stroke={2} />
        </button>
        <button
          type="button"
          aria-label="想去"
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

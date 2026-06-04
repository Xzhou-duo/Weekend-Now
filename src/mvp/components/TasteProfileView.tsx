import { IconRefresh, IconUser } from '@tabler/icons-react'
import type { PersistedMvpStateV1 } from '../persist'
import { isColdStartComplete, COLD_START_TARGET } from '../coldStart'
import { PROFILE_AXES, axisStrength, tagLabel } from '../profileUi'
import type { TasteTag } from '../types'

const GRID_AXES = PROFILE_AXES.filter((a) =>
  ['env', 'price', 'social', 'radius'].includes(a.id),
)

const BAR_COLORS = [
  'bg-brand-purple',
  'bg-teal',
  'bg-brand-purple',
  'bg-amber',
] as const

export function TasteProfileView({ state }: { state: PersistedMvpStateV1 }) {
  const vec = state.preferenceVector
  const unlockedTags = (Object.entries(vec) as [TasteTag, number][]).filter(
    ([, v]) => v > 0.25,
  ).length

  const coldDone = isColdStartComplete(state.coldStartSwipeCount)
  const feedbackCount = state.venueFeedbackHistory.length
  const learning = !coldDone || feedbackCount < 3

  const topInsight = (Object.entries(vec) as [TasteTag, number][])
    .filter(([, v]) => v > 0.35)
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-section overflow-y-auto pb-24">
      <header className="-mx-page-h rounded-b-[20px] bg-brand-purple px-page-h pb-[18px] pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-purple-light">
            <IconUser size={22} className="text-brand-purple-deep" stroke={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-semibold text-white">
              已解锁 {unlockedTags} 个口味标签
            </h2>
            <p className="mt-0.5 text-hint text-text-on-purple">
              基于 {state.completedFlows} 次出行 · {state.coldStartSwipeCount}{' '}
              次滑动
            </p>
          </div>
          {learning ? (
            <span className="flex shrink-0 items-center gap-1 rounded-[20px] bg-text-on-purple px-2 py-1 text-[9px] font-semibold text-brand-purple-navy">
              <IconRefresh size={11} aria-hidden />
              学习中
            </span>
          ) : null}
        </div>
      </header>

      <section>
        <p className="mb-2 text-hint font-semibold tracking-wide text-text-secondary">
          口味维度
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GRID_AXES.map((axis, i) => {
            const { top, pct } = axisStrength(vec, axis.tags)
            return (
              <div
                key={axis.id}
                className="rounded-block border border-border-card bg-surface-card p-2.5"
              >
                <p className="text-hint text-text-secondary">{axis.label}偏好</p>
                <p className="mt-1 text-[11px] font-semibold leading-snug text-text-primary">
                  {top ? tagLabel(top) : '待学习'}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-sm bg-brand-purple-light">
                  <div
                    className={`h-full rounded-sm ${BAR_COLORS[i] ?? 'bg-brand-purple'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-block border border-[#F5D4D4] bg-danger-light p-card-inner">
        <p className="flex items-center gap-1.5 text-hint font-semibold text-danger">
          <span aria-hidden>!</span>
          AI 注意到
        </p>
        <p className="mt-1 text-body-sm leading-[1.45] text-danger-text">
          {topInsight
            ? `你对「${tagLabel(topInsight[0])}」信号较强${
                coldDone
                  ? '；疲惫或独行时推荐会偏向安静场所。'
                  : `；再滑 ${Math.max(0, COLD_START_TARGET - state.coldStartSwipeCount)} 张卡建档更准。`
              }`
            : coldDone
              ? '多完成几轮出行反馈，画像会更贴你。'
              : `完成冷启动（${COLD_START_TARGET} 张滑卡）后，这里会出现更具体的洞察。`}
        </p>
      </section>
    </div>
  )
}

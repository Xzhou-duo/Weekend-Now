import { IconRefresh, IconUser } from '@tabler/icons-react'
import type { PersistedMvpStateV1 } from '../persist'
import { isColdStartComplete, COLD_START_TARGET } from '../coldStart'
import { purpleHeader } from '../figmaUi'
import { PROFILE_AXES, axisStrength, tagLabel } from '../profileUi'
import type { TasteTag } from '../types'
import { AiNoteBox } from './AiNoteBox'

const GRID_AXES = [
  { id: 'env', dim: '环境偏好', bar: 'bg-brand-purple' },
  { id: 'price', dim: '价格敏感度', bar: 'bg-teal' },
  { id: 'social', dim: '社交模式', bar: 'bg-brand-purple' },
  { id: 'radius', dim: '出行半径', bar: 'bg-amber' },
] as const

export function TasteProfileView({ state }: { state: PersistedMvpStateV1 }) {
  const vec = state.preferenceVector
  const unlockedTags = (Object.entries(vec) as [TasteTag, number][]).filter(
    ([, v]) => v > 0.25,
  ).length

  const coldDone = isColdStartComplete(state.coldStartSwipeCount)
  const learning = !coldDone || state.venueFeedbackHistory.length < 3

  const topInsight = (Object.entries(vec) as [TasteTag, number][])
    .filter(([, v]) => v > 0.35)
    .sort((a, b) => b[1] - a[1])[0]

  const noteText = topInsight
    ? `你比较喜欢「${tagLabel(topInsight[0])}」类场所，已记入推荐偏好。${
        state.venueFeedbackHistory.length > 0
          ? `结合 ${state.venueFeedbackHistory.length} 次出行反馈持续优化中。`
          : ''
      }`
    : coldDone
      ? '多完成出行反馈，推荐会更贴你。'
      : `再滑 ${Math.max(0, COLD_START_TARGET - state.coldStartSwipeCount)} 张卡，推荐会更准。`

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-element overflow-x-hidden overflow-y-auto bg-surface-bg pb-24">
      <header className={purpleHeader}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple-light">
            <IconUser size={20} className="text-brand-purple-deep" stroke={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-medium text-white">
              已解锁 {unlockedTags} 个口味标签
            </h2>
            <p className="mt-0.5 text-caption text-text-on-purple">
              基于 {state.completedFlows} 次出行 · {state.coldStartSwipeCount}{' '}
              次滑动
            </p>
          </div>
          {learning ? (
            <span className="flex shrink-0 items-center gap-1 rounded-badge bg-brand-purple-pale px-2 py-1 text-hint font-medium text-brand-purple-navy">
              <IconRefresh size={11} aria-hidden />
              学习中
            </span>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-[7px]">
        {GRID_AXES.map(({ id, dim, bar }) => {
          const axis = PROFILE_AXES.find((a) => a.id === id)
          if (!axis) return null
          const { top, pct } = axisStrength(vec, axis.tags)
          return (
            <div key={id} className="rounded-block bg-surface-card p-[10px]">
              <p className="text-hint text-text-secondary">{dim}</p>
              <p className="mt-0.5 text-[11px] font-medium text-text-primary">
                {top ? tagLabel(top) : '待学习'}
              </p>
              <div className="mt-1.5 h-[4px] overflow-hidden rounded-sm bg-brand-purple-light">
                <div
                  className={`h-full rounded-sm ${bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <AiNoteBox>{noteText}</AiNoteBox>
    </div>
  )
}

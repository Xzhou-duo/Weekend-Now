import { IconUser } from '@tabler/icons-react'
import type { PersistedMvpStateV1 } from '../persist'
import { isColdStartComplete, COLD_START_TARGET } from '../coldStart'
import { PROFILE_AXES, axisStrength, tagLabel } from '../profileUi'
import type { TasteTag } from '../types'

export function TasteProfileView({ state }: { state: PersistedMvpStateV1 }) {
  const vec = state.preferenceVector
  const topAll = (Object.entries(vec) as [TasteTag, number][])
    .filter(([, v]) => v > 0.2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const coldDone = isColdStartComplete(state.coldStartSwipeCount)
  const feedbackCount = state.venueFeedbackHistory.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-section overflow-y-auto pb-24">
      <header className="-mx-page-h rounded-b-[20px] bg-brand-purple px-page-h pb-5 pt-4">
        <div className="flex items-center gap-2">
          <IconUser size={22} className="text-brand-purple-light" stroke={1.5} />
          <h2 className="text-title-section text-white">我的口味</h2>
        </div>
        <p className="mt-2 text-caption text-text-on-purple">
          来自滑卡、今日状态与出行反馈，存在本机浏览器
        </p>
      </header>

      <section className="rounded-block border border-border-card bg-surface-card p-card-inner shadow-card">
        <p className="text-caption text-text-secondary">建档进度</p>
        <p className="mt-1 text-body font-medium text-text-primary">
          {coldDone
            ? '冷启动已完成'
            : `累计滑卡 ${state.coldStartSwipeCount} / ${COLD_START_TARGET}`}
        </p>
        <p className="mt-1 text-hint text-text-tertiary">
          已完成 {state.completedFlows} 轮推荐 · 出行反馈 {feedbackCount} 条
        </p>
      </section>

      <section>
        <p className="mb-2 text-caption font-medium text-text-secondary">
          维度倾向
        </p>
        <div className="flex flex-col gap-3">
          {PROFILE_AXES.map((axis) => {
            const { top, pct } = axisStrength(vec, axis.tags)
            return (
              <div
                key={axis.id}
                className="rounded-block border border-border-card bg-surface-card px-3 py-3"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-caption font-medium text-text-primary">
                    {axis.label}
                  </span>
                  <span className="text-hint text-text-tertiary">
                    {top ? tagLabel(top) : '待学习'}
                  </span>
                </div>
                <div className="h-[6px] overflow-hidden rounded-[3px] bg-brand-purple-light">
                  <div
                    className="h-full rounded-[3px] bg-brand-purple transition-[width]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {topAll.length > 0 ? (
        <section>
          <p className="mb-2 text-caption font-medium text-text-secondary">
            高频标签
          </p>
          <div className="flex flex-wrap gap-2">
            {topAll.map(([t, v]) => (
              <span
                key={t}
                className="rounded-badge bg-teal-light px-2 py-1 text-hint font-medium text-teal-deep"
              >
                {tagLabel(t)}
                <span className="ml-1 opacity-70">{v.toFixed(1)}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

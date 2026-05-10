/** MVP-validation §四：预留事件名，默认仅 console（可换埋点 SDK） */

export type MvpEvent =
  | 'mvp_swipe_done'
  | 'mvp_quiz_done'
  | 'mvp_results_view'
  | 'mvp_result_expand'
  | 'mvp_feedback_submit'
  /** MiMo API 优先，本地 recommendTop3 兜底 */
  | 'mvp_recommend_source'

export function trackMvp(event: MvpEvent, payload?: Record<string, unknown>): void {
  const row = { event, payload, ts: Date.now() }
  if (import.meta.env.DEV) {
    console.info('[mvp]', row)
  }
  window.dispatchEvent(new CustomEvent('mvp-analytics', { detail: row }))
}

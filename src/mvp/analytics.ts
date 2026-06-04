/** MVP-validation §四：预留事件名，默认仅 console（可换埋点 SDK） */

export type MvpEvent =
  | 'mvp_swipe_done'
  | 'mvp_quiz_done'
  | 'mvp_results_view'
  | 'mvp_result_expand'
  | 'mvp_feedback_submit'
  /** 问卷引导页曝光 / 用户点击打开腾讯问卷 */
  | 'mvp_survey_prompt_view'
  | 'mvp_survey_open_click'
  /** MiMo API 优先，本地 recommendTop3 兜底 */
  | 'mvp_recommend_source'
  | 'mvp_app_session'
  | 'mvp_cold_start_skip'
  | 'mvp_cold_start_complete'
  | 'mvp_reco_swipe_enter'
  | 'mvp_reco_swipe_action'
  | 'mvp_reco_swipe_done'
  | 'mvp_bookmark_add'
  | 'mvp_bookmark_remove'
  | 'mvp_bookmarks_view'
  | 'mvp_profile_view'
  | 'mvp_visit_feedback_submit'
  | 'mvp_profile_updated'
  | 'mvp_flow_complete'

export function trackMvp(event: MvpEvent, payload?: Record<string, unknown>): void {
  const row = { event, payload, ts: Date.now() }
  if (import.meta.env.DEV) {
    console.info('[mvp]', row)
  }
  window.dispatchEvent(new CustomEvent('mvp-analytics', { detail: row }))
}

import type { VisitOutcome, VisitPraiseTag, VisitReasonTag } from './types'

export const OUTCOME_OPTIONS: {
  value: VisitOutcome
  label: string
}[] = [
  { value: 'good', label: '好' },
  { value: 'ok', label: '一般' },
  { value: 'bad', label: '踩雷' },
]

export const BAD_REASON_OPTIONS: { value: VisitReasonTag; label: string }[] = [
  { value: 'too_loud', label: '太吵了' },
  { value: 'too_busy', label: '太累/太挤' },
  { value: 'wrong_vibe', label: '氛围不对' },
  { value: 'too_far', label: '太远了' },
  { value: 'too_pricey', label: '性价比不高' },
  { value: 'not_my_taste', label: '口味不合' },
]

export const GOOD_REASON_OPTIONS: { value: VisitReasonTag; label: string }[] = [
  { value: 'quiet_env', label: '环境安静' },
  { value: 'good_food', label: '菜品好吃' },
  { value: 'nice_vibe', label: '氛围对味' },
  { value: 'worth_price', label: '性价比高' },
]

/** figma 页面07：满意点多选标签 */
/** design-system §7 Page 07 满意点预置 */
export const PRAISE_OPTIONS: { value: VisitPraiseTag; label: string }[] = [
  { value: 'quiet_env', label: '环境安静' },
  { value: 'worth_price', label: '性价比高' },
  { value: 'good_food', label: '菜品好吃' },
  { value: 'nice_vibe', label: '服务好' },
  { value: 'would_return', label: '交通方便' },
  { value: 'solo_friendly', label: '适合独处' },
]

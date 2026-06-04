import type { VisitOutcome, VisitPraiseTag, VisitReasonTag } from './types'

export const OUTCOME_OPTIONS: {
  value: VisitOutcome
  label: string
  desc: string
}[] = [
  { value: 'good', label: '很不错', desc: '会再去或愿意推荐' },
  { value: 'ok', label: '一般', desc: '没踩雷但也不太想再来' },
  { value: 'bad', label: '踩雷了', desc: '和预期差比较多' },
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
  { value: 'quiet_env', label: '环境舒服' },
  { value: 'good_food', label: '吃得满意' },
  { value: 'nice_vibe', label: '氛围对味' },
  { value: 'worth_price', label: '值这个价' },
]

export const PRAISE_OPTIONS: { value: VisitPraiseTag; label: string }[] = [
  { value: 'would_return', label: '愿意再来' },
  { value: 'quiet_env', label: '环境加分' },
  { value: 'good_food', label: '味道加分' },
  { value: 'nice_vibe', label: '氛围加分' },
]

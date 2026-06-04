import type { SwipeAction, TasteTag } from './types'
import { buildPreferenceVector } from './recommend'

/** 本轮会话滑卡权重（相对长期画像）；今日三题在 scoreVenue 里另算 */
export const SESSION_SWIPE_PREF_WEIGHT = 1.35

export function mergePreferenceForRecommend(
  longTerm: Record<TasteTag, number>,
  sessionRecords: { tags: TasteTag[]; action: SwipeAction }[],
  sessionBlendWeight = SESSION_SWIPE_PREF_WEIGHT,
): Record<TasteTag, number> {
  const session = buildPreferenceVector(sessionRecords)
  const out = { ...longTerm }
  for (const t of Object.keys(out) as TasteTag[]) {
    out[t] = (out[t] ?? 0) + session[t] * sessionBlendWeight
  }
  return out
}

export function effectiveSwipeRecordsForApi(
  sessionRecords: { tags: TasteTag[]; action: SwipeAction }[],
  longTerm: Record<TasteTag, number>,
): { tags: TasteTag[]; action: SwipeAction }[] {
  if (sessionRecords.length > 0) return sessionRecords
  const top = (Object.entries(longTerm) as [TasteTag, number][])
    .filter(([, v]) => v > 0.4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag)
  if (top.length === 0) return []
  return top.map((tag) => ({ tags: [tag], action: 'like' as const }))
}

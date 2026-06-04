import type { TasteTag } from './types'

const TAG_LABELS: Partial<Record<TasteTag, string>> = {
  quiet: '安静',
  lively: '热闹',
  outdoor: '户外',
  budget: '亲民',
  mid: '适中消费',
  premium: '愿意吃好',
  solo: '独行自在',
  pair: '两人约会',
  group: '多人聚会',
  walk: '步行圈',
  metro: '地铁方便',
  taxi: '打车可远',
  food: '正餐',
  cafe: '咖啡甜品',
  market: '市集烟火',
  design: '设计感',
  fresh: '新鲜体验',
  neighbor: '社区感',
}

export type ProfileAxis = {
  id: string
  label: string
  tags: TasteTag[]
}

export const PROFILE_AXES: ProfileAxis[] = [
  { id: 'env', label: '环境', tags: ['quiet', 'lively', 'outdoor'] },
  { id: 'price', label: '消费', tags: ['budget', 'mid', 'premium'] },
  { id: 'social', label: '社交', tags: ['solo', 'pair', 'group'] },
  { id: 'radius', label: '距离', tags: ['walk', 'metro', 'taxi'] },
  { id: 'type', label: '类型', tags: ['food', 'cafe', 'market', 'design', 'fresh', 'neighbor'] },
]

export function tagLabel(t: TasteTag): string {
  return TAG_LABELS[t] ?? t
}

export function axisStrength(
  vec: Record<TasteTag, number>,
  tags: TasteTag[],
): { top: TasteTag | null; value: number; pct: number } {
  let top: TasteTag | null = null
  let value = -Infinity
  for (const t of tags) {
    const v = vec[t] ?? 0
    if (v > value) {
      value = v
      top = t
    }
  }
  if (top === null || value <= 0) {
    return { top: null, value: 0, pct: 12 }
  }
  const pct = Math.min(100, Math.round(value * 22 + 18))
  return { top, value, pct }
}

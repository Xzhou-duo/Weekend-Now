import type { QuizAnswers, Recommendation, SwipeAction, TasteTag, Venue } from './types'
import { VENUE_POOL } from './mockData'

const TAG_LABELS: Partial<Record<TasteTag, string>> = {
  quiet: '安静',
  lively: '热闹一点',
  outdoor: '户外透气',
  budget: '性价比高',
  mid: '预算适中',
  premium: '值得吃好一点',
  solo: '一个人也自在',
  pair: '适合两人',
  group: '能容纳多人',
  walk: '步行可达',
  metro: '地铁方便',
  taxi: '愿意打车远一点',
  food: '吃点正经的',
  cafe: '咖啡甜品',
  market: '烟火气市集',
  design: '好看有设计感',
  fresh: '新鲜体验',
  neighbor: '社区感邻里店',
}

function emptyScores(): Record<TasteTag, number> {
  return {
    quiet: 0,
    lively: 0,
    outdoor: 0,
    budget: 0,
    mid: 0,
    premium: 0,
    solo: 0,
    pair: 0,
    group: 0,
    walk: 0,
    metro: 0,
    taxi: 0,
    food: 0,
    cafe: 0,
    market: 0,
    design: 0,
    fresh: 0,
    neighbor: 0,
  }
}

/** 滑卡反馈 → 偏好向量 */
export function buildPreferenceVector(
  records: { tags: TasteTag[]; action: SwipeAction }[],
): Record<TasteTag, number> {
  const scores = emptyScores()
  for (const { tags, action } of records) {
    const w = action === 'bookmark' ? 1.4 : action === 'like' ? 1 : -0.9
    for (const t of tags) scores[t] += w
  }
  return scores
}

function quizBoost(venue: Venue, quiz: QuizAnswers): number {
  let b = 0
  const { party, mood, distance } = quiz
  const has = (t: TasteTag) => venue.tags.includes(t)

  if (party === 'solo' && has('solo')) b += 2
  if (party === 'pair' && has('pair')) b += 2
  if (party === 'group' && has('group')) b += 2
  if (party === 'group' && has('lively')) b += 1

  if (mood === 'relax') {
    if (has('quiet') || has('cafe')) b += 2
    if (has('outdoor')) b += 0.8
  }
  if (mood === 'fresh') {
    if (has('design') || has('market') || has('fresh')) b += 2
  }
  if (mood === 'food') {
    if (has('food') || has('premium')) b += 2.5
  }
  if (mood === 'whatever') b += 0.6

  if (distance === 'walk' && has('walk')) b += 2
  if (distance === 'metro' && has('metro')) b += 2
  if (distance === 'taxi') b += 0.8

  return b
}

function scoreVenue(
  venue: Venue,
  pref: Record<TasteTag, number>,
  quiz: QuizAnswers,
): number {
  let s = 0
  for (const t of venue.tags) s += pref[t] ?? 0
  s += quizBoost(venue, quiz)
  return s
}

function topTagsFromPref(
  pref: Record<TasteTag, number>,
  n: number,
): TasteTag[] {
  return (Object.entries(pref) as [TasteTag, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t)
}

function moodLine(m: QuizAnswers['mood']): string {
  switch (m) {
    case 'relax':
      return '想放松一下'
    case 'fresh':
      return '想换点新鲜感'
    case 'food':
      return '想认真吃顿好的'
    case 'whatever':
      return '状态比较随意'
    default:
      return ''
  }
}

function partyLine(p: QuizAnswers['party']): string {
  switch (p) {
    case 'solo':
      return '一个人出门'
    case 'pair':
      return '两个人一起'
    case 'group':
      return '多人结伴'
    default:
      return ''
  }
}

function distanceLine(d: QuizAnswers['distance']): string {
  switch (d) {
    case 'walk':
      return '更希望步行圈里解决'
    case 'metro':
      return '可以接受地铁一两站'
    case 'taxi':
      return '远一点打车也能接受'
    default:
      return ''
  }
}

export function buildReason(
  venue: Venue,
  quiz: QuizAnswers,
  topTags: TasteTag[],
): string {
  const tagText =
    topTags.length > 0
      ? topTags
          .map((t) => TAG_LABELS[t])
          .filter(Boolean)
          .slice(0, 3)
          .join('、')
      : '轻松出门'

  const head = [
    moodLine(quiz.mood),
    partyLine(quiz.party),
    distanceLine(quiz.distance),
  ]
    .filter(Boolean)
    .join('，')

  return `结合你今天「${head}」，以及你刚才滑卡时更买账的「${tagText}」这类气质，「${venue.name}」相对更贴你此刻的状态——${venue.categoryLine}。`
}

/** 规则 + 固定池选 Top3；不调用外网，作为 API 失败兜底同一套逻辑 */
export function recommendTop3(
  swipeRecords: { tags: TasteTag[]; action: SwipeAction }[],
  quiz: QuizAnswers,
): Recommendation[] {
  const pref = buildPreferenceVector(swipeRecords)
  const topTags = topTagsFromPref(pref, 4)

  const ranked = [...VENUE_POOL]
    .map((venue) => ({
      venue,
      score: scoreVenue(venue, pref, quiz),
    }))
    .sort((a, b) => b.score - a.score)

  const seen = new Set<string>()
  const out: Recommendation[] = []
  for (const row of ranked) {
    if (out.length >= 3) break
    if (seen.has(row.venue.id)) continue
    seen.add(row.venue.id)
    out.push({
      venue: row.venue,
      reason: buildReason(row.venue, quiz, topTags),
    })
  }

  /** 兜底：池子不足理论上不会发生 */
  return out.slice(0, 3)
}

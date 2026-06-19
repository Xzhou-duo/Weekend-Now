import type { QuizAnswers, Recommendation, SwipeAction, TasteTag, Venue } from './types'
import { VENUE_POOL } from './mockData'
import { blendPersonaFallback } from './persona'
import {
  mergePreferenceForRecommend,
  SESSION_SWIPE_PREF_WEIGHT,
} from './preferenceMerge'

/** PRD 场景三：推荐池 8 条，约 6 贴合 + 2 探索 */
export const RECO_DECK_MAX = 8
export const RECO_EXPLORE_SLOTS = 2

/** 今日三题情境权重大于长期画像（PRD §04） */
export const QUIZ_CONTEXT_WEIGHT = 2.65
export const LONG_TERM_TAG_WEIGHT = 0.52

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
    if (has('design') || has('market') || has('fresh')) b += 2.2
  }
  if (mood === 'food') {
    if (has('food') || has('premium')) b += 2.5
  }
  if (mood === 'whatever') b += 0.6

  if (distance === 'walk' && has('walk')) b += 2
  if (distance === 'metro' && has('metro')) b += 2
  if (distance === 'taxi') b += 0.8
  if (
    distance === 'walk' &&
    venue.distanceKm != null &&
    venue.distanceKm > 2.5
  ) {
    b -= 1.2
  }
  if (
    distance === 'taxi' &&
    venue.distanceKm != null &&
    venue.distanceKm < 1.2
  ) {
    b -= 0.4
  }

  return b
}

export type ScoreContext = {
  longTerm: Record<TasteTag, number>
  sessionRecords: { tags: TasteTag[]; action: SwipeAction }[]
  quiz: Required<QuizAnswers>
  sessionBlendWeight: number
  recoLiveSession?: { tags: TasteTag[]; action: SwipeAction }[]
  bookmarkVenueIds?: string[]
}

export function scoreVenueWithContext(venue: Venue, ctx: ScoreContext): number {
  const longTerm = blendPersonaFallback(ctx.longTerm, ctx.quiz)
  const sessionPref = buildPreferenceVector(ctx.sessionRecords)
  const livePref = ctx.recoLiveSession
    ? buildPreferenceVector(ctx.recoLiveSession)
    : emptyScores()

  let tagScore = 0
  for (const t of venue.tags) {
    tagScore += (longTerm[t] ?? 0) * LONG_TERM_TAG_WEIGHT
    tagScore +=
      sessionPref[t] * ctx.sessionBlendWeight * SESSION_SWIPE_PREF_WEIGHT
    tagScore += livePref[t] * 1.15
  }

  let score = tagScore + quizBoost(venue, ctx.quiz) * QUIZ_CONTEXT_WEIGHT
  if (ctx.bookmarkVenueIds?.includes(venue.id)) score += 1.6
  return score
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
  hadSessionSwipe = true,
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

  const tasteClause = hadSessionSwipe
    ? `你刚才滑卡时更买账的「${tagText}」`
    : `你积累的口味画像里「${tagText}」`

  return `结合你今天「${head}」，以及${tasteClause}这类气质，「${venue.name}」相对更贴你此刻的状态——${venue.categoryLine}。`
}

function toPercentiles(
  rows: { score: number; rec: Recommendation }[],
): Recommendation[] {
  if (rows.length === 0) return []
  const max = Math.max(...rows.map((r) => r.score), 1)
  const min = Math.min(...rows.map((r) => r.score))
  const span = Math.max(max - min, 0.01)
  return rows.map((row, idx) => ({
    ...row.rec,
    scorePercent: Math.round(
      Math.min(96, Math.max(62, 62 + ((row.score - min) / span) * 34 - idx * 1.5)),
    ),
  }))
}

export type RecommendOptions = {
  longTermPreference?: Record<TasteTag, number>
  sessionBlendWeight?: number
  bookmarkVenueIds?: string[]
}

function buildScoreContext(
  swipeRecords: { tags: TasteTag[]; action: SwipeAction }[],
  quiz: Required<QuizAnswers>,
  options?: RecommendOptions,
): ScoreContext {
  const longTerm = options?.longTermPreference ?? emptyScores()
  const sessionBlendWeight =
    options?.sessionBlendWeight !== undefined
      ? options.sessionBlendWeight
      : swipeRecords.length > 0
        ? SESSION_SWIPE_PREF_WEIGHT
        : 0
  return {
    longTerm,
    sessionRecords: swipeRecords,
    quiz,
    sessionBlendWeight,
    bookmarkVenueIds: options?.bookmarkVenueIds,
  }
}

/** PRD：8 条推荐池（6 高匹配 + 2 探索） */
export function recommendDeck8(
  swipeRecords: { tags: TasteTag[]; action: SwipeAction }[],
  quiz: Required<QuizAnswers>,
  options?: RecommendOptions,
): Recommendation[] {
  const ctx = buildScoreContext(swipeRecords, quiz, options)
  const pref = mergePreferenceForRecommend(
    ctx.longTerm,
    swipeRecords,
    ctx.sessionBlendWeight,
  )
  const topTags = topTagsFromPref(pref, 4)
  const hadSessionSwipe = swipeRecords.length > 0

  const ranked = [...VENUE_POOL]
    .map((venue) => ({
      venue,
      score: scoreVenueWithContext(venue, ctx),
    }))
    .sort((a, b) => b.score - a.score)

  const exploitTarget = RECO_DECK_MAX - RECO_EXPLORE_SLOTS
  const seen = new Set<string>()
  const exploit: { score: number; rec: Recommendation }[] = []
  const pool: typeof ranked = []

  for (const row of ranked) {
    if (exploit.length >= exploitTarget) break
    if (seen.has(row.venue.id)) continue
    seen.add(row.venue.id)
    exploit.push({
      score: row.score,
      rec: {
        venue: row.venue,
        reason: buildReason(row.venue, quiz, topTags, hadSessionSwipe),
        explore: false,
      },
    })
  }

  const medianScore =
    exploit[Math.floor(exploit.length / 2)]?.score ?? ranked[0]?.score ?? 0

  for (const row of ranked) {
    if (seen.has(row.venue.id)) continue
    if (row.score > medianScore * 0.92) continue
    pool.push(row)
  }
  for (const row of ranked) {
    if (!seen.has(row.venue.id)) pool.push(row)
  }

  const explore: { score: number; rec: Recommendation }[] = []
  let pi = 0
  while (explore.length < RECO_EXPLORE_SLOTS && pi < pool.length) {
    const row = pool[pi++]
    if (seen.has(row.venue.id)) continue
    seen.add(row.venue.id)
    explore.push({
      score: row.score,
      rec: {
        venue: row.venue,
        reason: `${buildReason(row.venue, quiz, topTags, hadSessionSwipe)}（换换口味，可能也有惊喜）`,
        explore: true,
      },
    })
  }

  return toPercentiles([...exploit, ...explore]).slice(0, RECO_DECK_MAX)
}

export function recommendTop3(
  swipeRecords: { tags: TasteTag[]; action: SwipeAction }[],
  quiz: QuizAnswers,
  options?: RecommendOptions,
): Recommendation[] {
  if (!quiz.party || !quiz.mood || !quiz.distance) return []
  return recommendDeck8(
    swipeRecords,
    quiz as Required<QuizAnswers>,
    options,
  ).slice(0, 3)
}

/** 将 MiMo 返回的完整推荐结果补充为可展示的 deck */
export function augmentMimoToRecoDeck(
  mimoTop: Recommendation[],
): Recommendation[] {
  return mimoTop.slice(0, RECO_DECK_MAX).map((r, i) => ({
    ...r,
    explore: false,
    scorePercent: r.scorePercent ?? 90 - i * 4,
  }))
}

/** 推荐刷卡会话：对剩余条目实时重排 */
export function rerankRecommendationListByRecoSwipe(
  remaining: Recommendation[],
  recoSession: { tags: TasteTag[]; action: SwipeAction }[],
  swipeRecords: { tags: TasteTag[]; action: SwipeAction }[],
  quiz: Required<QuizAnswers>,
  options: RecommendOptions,
): Recommendation[] {
  const ctx: ScoreContext = {
    ...buildScoreContext(swipeRecords, quiz, options),
    recoLiveSession: recoSession,
  }
  const pref = mergePreferenceForRecommend(
    ctx.longTerm,
    swipeRecords,
    ctx.sessionBlendWeight,
  )
  const topTags = topTagsFromPref(pref, 4)
  const hadSessionSwipe = swipeRecords.length > 0

  const ranked = remaining
    .map((rec) => ({
      rec,
      score: scoreVenueWithContext(rec.venue, ctx),
    }))
    .sort((a, b) => b.score - a.score)

  return toPercentiles(
    ranked.map((row) => ({
      score: row.score,
      rec: {
        ...row.rec,
        reason: row.rec.reasonSource === 'mimo' || row.rec.explore
          ? row.rec.reason
          : buildReason(row.rec.venue, quiz, topTags, hadSessionSwipe),
      },
    })),
  )
}

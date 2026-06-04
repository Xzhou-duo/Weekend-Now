export type Step =
  | 'swipe'
  | 'quiz'
  | 'results'
  /** PRD 场景三：对推荐结果刷卡并实时重排 */
  | 'reco-swipe'
  /** PRD 场景四：出行后按店反馈 */
  | 'visit-feedback'
  | 'feedback'
  | 'survey'
  | 'done'

export type SwipeAction = 'dislike' | 'like' | 'bookmark'

export type Party = 'solo' | 'pair' | 'group'
export type Mood = 'relax' | 'fresh' | 'food' | 'whatever'
export type Distance = 'walk' | 'metro' | 'taxi'

export interface QuizAnswers {
  party?: Party
  mood?: Mood
  distance?: Distance
}

/** PRD 场景二：开箱默认，约 5 秒可提交 */
export const DEFAULT_QUIZ_SELECTION: Required<QuizAnswers> = {
  party: 'solo',
  mood: 'fresh',
  distance: 'metro',
}

/** 偏好维度（滑卡与世界模型共用标签） */
export type TasteTag =
  | 'quiet'
  | 'lively'
  | 'outdoor'
  | 'budget'
  | 'mid'
  | 'premium'
  | 'solo'
  | 'pair'
  | 'group'
  | 'walk'
  | 'metro'
  | 'taxi'
  | 'food'
  | 'cafe'
  | 'market'
  | 'design'
  | 'fresh'
  | 'neighbor'

export type ChipVariant = 'teal' | 'purple' | 'amber'

export interface SwipeCardModel {
  id: string
  title: string
  description: string
  chips: { variant: ChipVariant; text: string }[]
  tags: TasteTag[]
  /** 设计文档 §2.6 三色块意象 */
  iconTone: 'natural' | 'literate' | 'bazaar'
  /** Tabler icon 名称后缀 */
  iconName: 'building-store' | 'tools-kitchen-2' | 'plant-2'
}

export interface Venue {
  id: string
  name: string
  categoryLine: string
  tags: TasteTag[]
  iconTone: SwipeCardModel['iconTone']
  iconName: SwipeCardModel['iconName']
  /** mock 直线距离 km，接地图 API 后可替换 */
  distanceKm?: number
}

export interface Recommendation {
  venue: Venue
  reason: string
  /** PRD：探索型推荐位 */
  explore?: boolean
  /** 规则路径下的相对匹配度 0–100 */
  scorePercent?: number
}

export type FeedbackValue = 'helpful' | 'ok' | 'not-helpful'

/** PRD 场景四：出行后评价 */
export type VisitOutcome = 'good' | 'ok' | 'bad'

export type VisitReasonTag =
  | 'too_loud'
  | 'too_quiet'
  | 'too_busy'
  | 'wrong_vibe'
  | 'too_far'
  | 'too_pricey'
  | 'not_my_taste'
  | 'quiet_env'
  | 'good_food'
  | 'nice_vibe'
  | 'worth_price'

export type VisitPraiseTag =
  | 'quiet_env'
  | 'good_food'
  | 'nice_vibe'
  | 'worth_price'
  | 'would_return'
  | 'solo_friendly'

export interface BookmarkEntry {
  venueId: string
  savedAt: number
  quizSnapshot?: Required<QuizAnswers>
}

export interface VenueFeedbackRecord {
  venueId: string
  at: number
  outcome: VisitOutcome
  reasons: VisitReasonTag[]
  praiseTags?: VisitPraiseTag[]
  quiz: Required<QuizAnswers>
}

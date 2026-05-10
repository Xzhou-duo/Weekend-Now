export type Step =
  | 'swipe'
  | 'quiz'
  | 'results'
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
}

export interface Recommendation {
  venue: Venue
  reason: string
}

export type FeedbackValue = 'helpful' | 'ok' | 'not-helpful'

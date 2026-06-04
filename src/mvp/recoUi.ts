import type { QuizAnswers, Venue } from './types'

/** 原型 P3 副标题：基于你今天… · 独自出行 */
export function resultsListSubtitle(quiz: Required<QuizAnswers>): string {
  const mood =
    quiz.mood === 'relax'
      ? '想放松'
      : quiz.mood === 'fresh'
        ? '想要新鲜感'
        : quiz.mood === 'food'
          ? '想吃好的'
          : '随便看看'
  const party =
    quiz.party === 'solo'
      ? '独自出行'
      : quiz.party === 'pair'
        ? '两人出行'
        : '多人出行'
  return `基于你今天${mood} · ${party}`
}

export function quizSubtitleLine(quiz: Required<QuizAnswers>): string {
  const party =
    quiz.party === 'solo'
      ? '一个人'
      : quiz.party === 'pair'
        ? '两个人'
        : '多人'
  const mood =
    quiz.mood === 'relax'
      ? '想放松'
      : quiz.mood === 'fresh'
        ? '想新鲜感'
        : quiz.mood === 'food'
          ? '想吃好的'
          : '随便看看'
  const dist =
    quiz.distance === 'walk'
      ? '步行圈'
      : quiz.distance === 'metro'
        ? '地铁可达'
        : '打车也行'
  return `${party} · ${mood} · ${dist}`
}

export function venueMetaLine(venue: Venue, quiz: Required<QuizAnswers>): string {
  const parts: string[] = []
  if (venue.distanceKm != null) {
    if (quiz.distance === 'walk' && venue.distanceKm < 1.5) {
      parts.push(`步行约${Math.max(3, Math.round(venue.distanceKm * 10))}分钟`)
    } else if (venue.distanceKm < 4) {
      parts.push(`约${venue.distanceKm.toFixed(1)}km`)
    } else {
      parts.push(`稍远 · ${venue.distanceKm.toFixed(1)}km`)
    }
  }
  if (venue.tags.includes('budget')) parts.push('亲民')
  else if (venue.tags.includes('premium')) parts.push('值得吃好')
  else if (venue.tags.includes('mid')) parts.push('中等消费')
  return parts.join(' · ') || venue.categoryLine
}

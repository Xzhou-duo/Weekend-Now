import type { QuizAnswers, TasteTag, VisitOutcome, VisitPraiseTag, VisitReasonTag } from './types'

/** PRD §04 场景四：结合当日情境归因，而非简单否定品类 */
export function applyVisitFeedbackToPreference(
  base: Record<TasteTag, number>,
  input: {
    venueTags: TasteTag[]
    quiz: Required<QuizAnswers>
    outcome: VisitOutcome
    reasons: VisitReasonTag[]
  },
): Record<TasteTag, number> {
  const out = { ...base }
  const bump = (t: TasteTag, delta: number) => {
    out[t] = (out[t] ?? 0) + delta
  }
  const bumpVenueTags = (scale: number) => {
    for (const t of input.venueTags) bump(t, scale)
  }

  if (input.outcome === 'good') {
    bumpVenueTags(0.38)
    for (const r of input.reasons) {
      if (r === 'quiet_env') bump('quiet', 0.28)
      if (r === 'good_food') bump('food', 0.32)
      if (r === 'nice_vibe') bump('design', 0.22)
      if (r === 'worth_price') bump('budget', 0.15)
    }
    return out
  }

  if (input.outcome === 'ok') {
    bumpVenueTags(0.12)
    return out
  }

  /* bad：按情境降权，避免「不喜欢某店名=不喜欢某类」 */
  bumpVenueTags(-0.22)

  const { quiz } = input
  for (const r of input.reasons) {
    if (r === 'too_loud' || r === 'wrong_vibe') {
      bump('lively', -0.35)
      if (quiz.mood === 'relax' || quiz.party === 'solo') bump('quiet', 0.22)
    }
    if (r === 'too_quiet' && quiz.mood === 'fresh') bump('lively', 0.18)
    if (r === 'too_busy' && quiz.mood === 'relax') {
      bump('lively', -0.28)
      bump('quiet', 0.2)
    }
    if (r === 'too_far') {
      bump('taxi', -0.25)
      if (quiz.distance === 'walk') bump('walk', 0.2)
    }
    if (r === 'too_pricey') {
      bump('premium', -0.3)
      bump('budget', 0.2)
    }
    if (r === 'not_my_taste') {
      for (const t of input.venueTags) bump(t, -0.15)
    }
  }

  return out
}

export function applyVisitPraiseToPreference(
  base: Record<TasteTag, number>,
  praiseTags: VisitPraiseTag[],
): Record<TasteTag, number> {
  const out = { ...base }
  const bump = (t: TasteTag, delta: number) => {
    out[t] = (out[t] ?? 0) + delta
  }
  for (const p of praiseTags) {
    if (p === 'quiet_env') bump('quiet', 0.28)
    if (p === 'good_food') bump('food', 0.3)
    if (p === 'nice_vibe') bump('design', 0.24)
    if (p === 'worth_price') bump('budget', 0.18)
    if (p === 'would_return') bump('neighbor', 0.15)
    if (p === 'solo_friendly') bump('solo', 0.22)
  }
  return out
}

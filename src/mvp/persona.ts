import type { QuizAnswers, TasteTag } from './types'

/** PRD §05：新用户三题粗分 6 类人群兜底（简化版 6 组） */
const PERSONA_TABLE: Record<string, Partial<Record<TasteTag, number>>> = {
  'solo-relax-walk': {
    quiet: 2,
    cafe: 1.5,
    solo: 2,
    walk: 2,
    neighbor: 1,
  },
  'solo-fresh-metro': {
    design: 2,
    fresh: 2,
    solo: 1.5,
    metro: 1.5,
    market: 1,
  },
  'pair-food-metro': {
    food: 2.5,
    pair: 2,
    mid: 1.5,
    metro: 1.5,
    design: 0.8,
  },
  'group-whatever-metro': {
    lively: 2,
    group: 2.5,
    food: 1.5,
    metro: 1.5,
    mid: 1,
  },
  'solo-food-taxi': {
    food: 2.5,
    premium: 1.8,
    solo: 1.2,
    taxi: 2,
    quiet: 0.8,
  },
  'pair-relax-walk': {
    quiet: 1.8,
    outdoor: 1.2,
    pair: 2,
    walk: 2,
    cafe: 1.2,
  },
}

function personaKey(quiz: Required<QuizAnswers>): string {
  const { party, mood, distance } = quiz
  if (party === 'group') return 'group-whatever-metro'
  if (mood === 'food' && distance === 'taxi') return 'solo-food-taxi'
  if (party === 'pair' && mood === 'relax') return 'pair-relax-walk'
  if (party === 'solo' && mood === 'relax') return 'solo-relax-walk'
  if (mood === 'fresh') return 'solo-fresh-metro'
  if (party === 'pair') return 'pair-food-metro'
  return 'solo-fresh-metro'
}

export function personaVectorFromQuiz(
  quiz: Required<QuizAnswers>,
): Record<TasteTag, number> {
  const key = personaKey(quiz)
  const partial = PERSONA_TABLE[key] ?? PERSONA_TABLE['solo-fresh-metro']
  const out = {} as Record<TasteTag, number>
  for (const [t, v] of Object.entries(partial)) {
    out[t as TasteTag] = v
  }
  return out
}

export function blendPersonaFallback(
  longTerm: Record<TasteTag, number>,
  quiz: Required<QuizAnswers>,
  strength = 0.38,
): Record<TasteTag, number> {
  const signal = (Object.values(longTerm) as number[]).reduce(
    (a, b) => a + Math.abs(b),
    0,
  )
  if (signal > 4) return longTerm
  const persona = personaVectorFromQuiz(quiz)
  const out = { ...longTerm }
  for (const t of Object.keys(persona) as TasteTag[]) {
    out[t] = (out[t] ?? 0) + persona[t] * strength
  }
  return out
}

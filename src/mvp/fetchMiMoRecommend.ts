import type {
  QuizAnswers,
  Recommendation,
  SwipeAction,
  TasteTag,
  Venue,
} from './types'

type ApiOk = { ok: true; items: { id: string; reason: string }[] }
type ApiFail = { ok: false; error?: string; message?: string }

function normalizeId(id: unknown): string {
  if (id === undefined || id === null) return ''
  return String(id).trim()
}

function mergeToRecommendations(
  items: { id: string; reason: string }[],
  venues: Venue[],
): Recommendation[] | null {
  const map = new Map(venues.map((v) => [v.id, v]))
  const out: Recommendation[] = []
  const seen = new Set<string>()
  for (const row of items) {
    const id = normalizeId(row.id)
    if (!id || seen.has(id)) continue
    const v = map.get(id)
    const r =
      typeof row.reason === 'string'
        ? row.reason.trim()
        : row.reason != null
          ? String(row.reason).trim()
          : ''
    if (!v || !r) continue
    out.push({ venue: v, reason: r })
    seen.add(id)
    if (out.length >= 3) break
  }
  return out.length === 3 ? out : null
}

/**
 * POST /api/recommend（开发时由 Vite 代理到本地 Node 示例服务）
 * 成功且恰好 3 条则返回；否则返回 null，由前端调用 recommendTop3 兜底。
 */
export async function fetchMiMoRecommendations(params: {
  swipeRecords: { tags: TasteTag[]; action: SwipeAction }[]
  quiz: Required<QuizAnswers>
  venues: Venue[]
  signal?: AbortSignal
}): Promise<Recommendation[] | null> {
  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: params.signal,
    body: JSON.stringify({
      swipeRecords: params.swipeRecords,
      quiz: params.quiz,
      venues: params.venues,
    }),
  })

  if (!res.ok) return null

  let data: ApiOk | ApiFail
  try {
    data = (await res.json()) as ApiOk | ApiFail
  } catch {
    return null
  }

  if (!data.ok || !('items' in data) || !Array.isArray(data.items)) {
    if (import.meta.env.DEV) {
      const fail = data as ApiFail
      console.warn(
        '[fetchMiMoRecommend] API 未返回可用 items',
        fail.error,
        fail.message ?? '',
      )
    }
    return null
  }

  return mergeToRecommendations(data.items, params.venues)
}

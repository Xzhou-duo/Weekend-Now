import type {
  BookmarkEntry,
  FeedbackValue,
  QuizAnswers,
  SwipeAction,
  TasteTag,
  VenueFeedbackRecord,
} from './types'
import { buildPreferenceVector } from './recommend'
import { COLD_START_TARGET, isColdStartComplete } from './coldStart'

const STORAGE_KEY = 'paipaipai-mvp-state-v1'

const SESSION_LEARN_RATE = 0.42

export interface PendingFeedbackEntry {
  venueId: string
  venueName: string
  quizSnapshot: Required<QuizAnswers>
  decidedAt: number
}

export interface PersistedMvpStateV1 {
  version: 1
  preferenceVector: Record<TasteTag, number>
  coldStartSwipeCount: number
  coldStartCompletedAt?: number
  sessionCount: number
  bookmarks: BookmarkEntry[]
  venueFeedbackHistory: VenueFeedbackRecord[]
  completedFlows: number
  overallFeedback: Record<FeedbackValue, number>
  pendingFeedback: PendingFeedbackEntry | null
}

function emptyPreference(): Record<TasteTag, number> {
  return buildPreferenceVector([])
}

export function defaultPersistedState(): PersistedMvpStateV1 {
  return {
    version: 1,
    preferenceVector: emptyPreference(),
    coldStartSwipeCount: 0,
    sessionCount: 0,
    bookmarks: [],
    venueFeedbackHistory: [],
    completedFlows: 0,
    overallFeedback: { helpful: 0, ok: 0, 'not-helpful': 0 },
    pendingFeedback: null,
  }
}

function isTasteTag(k: string): k is TasteTag {
  return k in emptyPreference()
}

function normalizeVector(raw: unknown): Record<TasteTag, number> {
  const base = emptyPreference()
  if (!raw || typeof raw !== 'object') return base
  for (const [k, v] of Object.entries(raw)) {
    if (isTasteTag(k) && typeof v === 'number' && Number.isFinite(v)) {
      base[k] = v
    }
  }
  return base
}

function normalizeBookmarks(raw: unknown): BookmarkEntry[] {
  if (!Array.isArray(raw)) return []
  const out: BookmarkEntry[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const venueId = String((row as BookmarkEntry).venueId ?? '').trim()
    const savedAt = Number((row as BookmarkEntry).savedAt)
    if (!venueId || !Number.isFinite(savedAt)) continue
    const snap = (row as BookmarkEntry).quizSnapshot
    out.push({
      venueId,
      savedAt,
      quizSnapshot:
        snap?.party && snap.mood && snap.distance ? snap : undefined,
    })
  }
  return out
}

function normalizePendingFeedback(
  raw: unknown,
): PendingFeedbackEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as PendingFeedbackEntry
  const snap = r.quizSnapshot
  if (
    !r.venueId ||
    !r.venueName ||
    typeof r.decidedAt !== 'number' ||
    !snap?.party ||
    !snap.mood ||
    !snap.distance
  ) {
    return null
  }
  return {
    venueId: String(r.venueId),
    venueName: String(r.venueName),
    quizSnapshot: snap,
    decidedAt: r.decidedAt,
  }
}

function normalizeFeedbackHistory(raw: unknown): VenueFeedbackRecord[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((row): row is VenueFeedbackRecord => {
      if (!row || typeof row !== 'object') return false
      const r = row as VenueFeedbackRecord
      return Boolean(
        r.venueId &&
          r.outcome &&
          r.quiz?.party &&
          r.quiz?.mood &&
          r.quiz?.distance,
      )
    })
    .slice(-120)
}

export function loadMvpPersist(): PersistedMvpStateV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPersistedState()
    const parsed = JSON.parse(raw) as Partial<PersistedMvpStateV1>
    if (parsed.version !== 1) return defaultPersistedState()
    const coldStartSwipeCount = Math.max(
      0,
      Math.floor(Number(parsed.coldStartSwipeCount) || 0),
    )
    const fb = (parsed.overallFeedback ?? {}) as Partial<
      Record<FeedbackValue, number>
    >
    return {
      version: 1,
      preferenceVector: normalizeVector(parsed.preferenceVector),
      coldStartSwipeCount,
      coldStartCompletedAt:
        typeof parsed.coldStartCompletedAt === 'number'
          ? parsed.coldStartCompletedAt
          : isColdStartComplete(coldStartSwipeCount)
            ? Date.now()
            : undefined,
      sessionCount: Math.max(0, Math.floor(Number(parsed.sessionCount) || 0)),
      bookmarks: normalizeBookmarks(parsed.bookmarks),
      venueFeedbackHistory: normalizeFeedbackHistory(
        parsed.venueFeedbackHistory,
      ),
      completedFlows: Math.max(0, Math.floor(Number(parsed.completedFlows) || 0)),
      overallFeedback: {
        helpful: Math.max(0, Number(fb.helpful) || 0),
        ok: Math.max(0, Number(fb.ok) || 0),
        'not-helpful': Math.max(0, Number(fb['not-helpful']) || 0),
      },
      pendingFeedback: normalizePendingFeedback(parsed.pendingFeedback),
    }
  } catch {
    return defaultPersistedState()
  }
}

export function saveMvpPersist(state: PersistedMvpStateV1): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* 隐私模式或配额满 */
  }
}

export function accumulateSwipeSessionIntoProfile(
  base: Record<TasteTag, number>,
  session: { tags: TasteTag[]; action: SwipeAction }[],
): Record<TasteTag, number> {
  const delta = buildPreferenceVector(session)
  const out = { ...base }
  for (const t of Object.keys(out) as TasteTag[]) {
    out[t] = (out[t] ?? 0) + delta[t] * SESSION_LEARN_RATE
  }
  return out
}

export function hasUsableStoredProfile(
  vec: Record<TasteTag, number>,
): boolean {
  const positives = (Object.values(vec) as number[]).filter((v) => v > 0.35)
  return positives.length >= 3
}

export function canSkipColdStartSwipe(state: PersistedMvpStateV1): boolean {
  return (
    isColdStartComplete(state.coldStartSwipeCount) ||
    hasUsableStoredProfile(state.preferenceVector)
  )
}

export function applySwipeSessionToPersist(
  prev: PersistedMvpStateV1,
  session: { tags: TasteTag[]; action: SwipeAction }[],
): PersistedMvpStateV1 {
  const preferenceVector = accumulateSwipeSessionIntoProfile(
    prev.preferenceVector,
    session,
  )
  const coldStartSwipeCount = prev.coldStartSwipeCount + session.length
  const justCompleted =
    !isColdStartComplete(prev.coldStartSwipeCount) &&
    isColdStartComplete(coldStartSwipeCount)

  return {
    ...prev,
    preferenceVector,
    coldStartSwipeCount,
    coldStartCompletedAt:
      prev.coldStartCompletedAt ??
      (justCompleted ? Date.now() : undefined),
  }
}

export function bumpSessionCount(prev: PersistedMvpStateV1): PersistedMvpStateV1 {
  return { ...prev, sessionCount: prev.sessionCount + 1 }
}

export function bumpOverallFeedback(
  prev: PersistedMvpStateV1,
  value: FeedbackValue,
): PersistedMvpStateV1 {
  return {
    ...prev,
    overallFeedback: {
      ...prev.overallFeedback,
      [value]: prev.overallFeedback[value] + 1,
    },
  }
}

export { COLD_START_TARGET }

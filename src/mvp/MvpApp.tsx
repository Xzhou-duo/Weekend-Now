import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  QuizAnswers,
  Recommendation,
  Step,
  SwipeAction,
  TasteTag,
  VisitOutcome,
  VisitPraiseTag,
  VisitReasonTag,
} from './types'
import { DEFAULT_QUIZ_SELECTION } from './types'
import { DepartStep } from './components/DepartStep'
import { QuizStep } from './components/QuizStep'
import { ResultsStep } from './components/ResultsStep'
import { ResultsEmptyStep } from './components/ResultsEmptyStep'
import { RecoSwipeStep } from './components/RecoSwipeStep'
import { VenueDetailSheet } from './components/VenueDetailSheet'
import { SwipeStep } from './components/SwipeStep'
import { VisitFeedbackStep } from './components/VisitFeedbackStep'
import { TasteProfileView } from './components/TasteProfileView'
import { BookmarksView } from './components/BookmarksView'
import { PrototypeTabBar, type MainTab } from './components/PrototypeTabBar'
import { VENUE_POOL } from './mockData'
import {
  augmentMimoToRecoDeck,
  recommendDeck8,
  rerankRecommendationListByRecoSwipe,
} from './recommend'
import { fetchMiMoRecommendations } from './fetchMiMoRecommend'
import { trackMvp } from './analytics'
import { isColdStartComplete } from './coldStart'
import {
  applySwipeSessionToPersist,
  bumpSessionCount,
  canSkipColdStartSwipe,
  loadMvpPersist,
  saveMvpPersist,
  type PersistedMvpStateV1,
} from './persist'
import { effectiveSwipeRecordsForApi } from './preferenceMerge'
import {
  applyVisitFeedbackToPreference,
  applyVisitPraiseToPreference,
} from './visitFeedback'

function isQuizComplete(q: QuizAnswers): q is Required<QuizAnswers> {
  return Boolean(q.party && q.mood && q.distance)
}

function initialStep(persisted: PersistedMvpStateV1): Step {
  return canSkipColdStartSwipe(persisted) ? 'quiz' : 'swipe'
}

export function MvpApp() {
  const [mainTab, setMainTab] = useState<MainTab>('discover')
  const [persisted, setPersisted] = useState<PersistedMvpStateV1>(() =>
    loadMvpPersist(),
  )
  const [step, setStep] = useState<Step>(() => initialStep(loadMvpPersist()))
  const [quiz, setQuiz] = useState<QuizAnswers>(() => ({
    ...DEFAULT_QUIZ_SELECTION,
  }))
  const [swipeRecords, setSwipeRecords] = useState<
    { tags: TasteTag[]; action: SwipeAction }[]
  >([])
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(
    null,
  )
  const [recoSource, setRecoSource] = useState<'mimo' | 'rules' | null>(null)
  const [recoLoading, setRecoLoading] = useState(false)
  const [resultDetailId, setResultDetailId] = useState<string | null>(null)
  const [recoSwipeMountKey, setRecoSwipeMountKey] = useState(0)
  const [visitFeedbackTarget, setVisitFeedbackTarget] =
    useState<Recommendation | null>(null)
  const [bypassColdStartGate, setBypassColdStartGate] = useState(false)
  const [bookmarkDetailId, setBookmarkDetailId] = useState<string | null>(null)

  const resultsViewLogged = useRef(false)
  const mountedRef = useRef(true)
  const submitAbortRef = useRef<AbortController | null>(null)
  const sessionBumpedRef = useRef(false)
  const postVisitFeedbackStepRef = useRef<Step>('results')

  const canSkipSwipe = canSkipColdStartSwipe(persisted)

  const venuesById = useMemo(
    () => new Map(VENUE_POOL.map((v) => [v.id, v])),
    [],
  )

  const bookmarkedIds = useMemo(
    () => new Set(persisted.bookmarks.map((b) => b.venueId)),
    [persisted.bookmarks],
  )

  const detailRecommendation = useMemo(() => {
    if (
      !recommendations ||
      !resultDetailId ||
      (step !== 'results' && step !== 'reco-swipe')
    ) {
      return null
    }
    return recommendations.find((r) => r.venue.id === resultDetailId) ?? null
  }, [recommendations, resultDetailId, step])

  const showTabBar =
    mainTab !== 'discover' ||
    (step !== 'visit-feedback' &&
      step !== 'depart' &&
      !(
        (step === 'results' || step === 'reco-swipe') && resultDetailId !== null
      ))

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      submitAbortRef.current?.abort()
    }
  }, [])

  const closeResultDetail = useCallback(() => {
    setResultDetailId(null)
  }, [])

  const handleOpenResultVenue = useCallback((venueId: string) => {
    setResultDetailId(venueId)
  }, [])

  useEffect(() => {
    if (sessionBumpedRef.current) return
    sessionBumpedRef.current = true
    setPersisted((prev) => {
      const next = bumpSessionCount(prev)
      saveMvpPersist(next)
      trackMvp('mvp_app_session', {
        sessionCount: next.sessionCount,
        coldStartComplete: isColdStartComplete(next.coldStartSwipeCount),
      })
      return next
    })
  }, [])

  useEffect(() => {
    if (mainTab === 'profile') {
      trackMvp('mvp_profile_view', {})
    }
    if (mainTab === 'bookmarks') {
      trackMvp('mvp_bookmarks_view', { count: loadMvpPersist().bookmarks.length })
    }
  }, [mainTab])

  useEffect(() => {
    if (
      step === 'results' &&
      recommendations?.length &&
      !resultsViewLogged.current
    ) {
      resultsViewLogged.current = true
      trackMvp('mvp_results_view', {
        count: recommendations.length,
        ids: recommendations.map((r) => r.venue.id),
      })
    }
  }, [step, recommendations])

  const restart = () => {
    resultsViewLogged.current = false
    setMainTab('discover')
    setStep(canSkipColdStartSwipe(loadMvpPersist()) ? 'quiz' : 'swipe')
    setQuiz({ ...DEFAULT_QUIZ_SELECTION })
    setSwipeRecords([])
    setRecommendations(null)
    setRecoSource(null)
    setRecoLoading(false)
    setResultDetailId(null)
    setRecoSwipeMountKey(0)
    setVisitFeedbackTarget(null)
    setBypassColdStartGate(false)
    setBookmarkDetailId(null)
  }

  const bookmarkVenueEnsure = useCallback(
    (venueId: string) => {
      setPersisted((prev) => {
        if (prev.bookmarks.some((b) => b.venueId === venueId)) return prev
        trackMvp('mvp_bookmark_add', { venueId })
        const next: PersistedMvpStateV1 = {
          ...prev,
          bookmarks: [
            ...prev.bookmarks,
            {
              venueId,
              savedAt: Date.now(),
              quizSnapshot: isQuizComplete(quiz) ? quiz : undefined,
            },
          ],
        }
        saveMvpPersist(next)
        return next
      })
    },
    [quiz],
  )

  const onToggleBookmark = useCallback(
    (venueId: string) => {
      setPersisted((prev) => {
        const exists = prev.bookmarks.some((b) => b.venueId === venueId)
        if (exists) {
          trackMvp('mvp_bookmark_remove', { venueId })
          const next = {
            ...prev,
            bookmarks: prev.bookmarks.filter((b) => b.venueId !== venueId),
          }
          saveMvpPersist(next)
          return next
        }
        trackMvp('mvp_bookmark_add', { venueId })
        const next: PersistedMvpStateV1 = {
          ...prev,
          bookmarks: [
            ...prev.bookmarks,
            {
              venueId,
              savedAt: Date.now(),
              quizSnapshot: isQuizComplete(quiz) ? quiz : undefined,
            },
          ],
        }
        saveMvpPersist(next)
        return next
      })
    },
    [quiz],
  )

  const onVenueFeedback = useCallback(
    (payload: {
      venueId: string
      venueTags: TasteTag[]
      outcome: VisitOutcome
      reasons: VisitReasonTag[]
      praiseTags?: VisitPraiseTag[]
    }) => {
      if (!isQuizComplete(quiz)) return
      setPersisted((prev) => {
        let nextVec = applyVisitFeedbackToPreference(prev.preferenceVector, {
          venueTags: payload.venueTags,
          quiz,
          outcome: payload.outcome,
          reasons: payload.reasons,
        })
        if (payload.praiseTags?.length) {
          nextVec = applyVisitPraiseToPreference(nextVec, payload.praiseTags)
        }
        const next: PersistedMvpStateV1 = {
          ...prev,
          preferenceVector: nextVec,
          pendingFeedback: null,
          venueFeedbackHistory: [
            ...prev.venueFeedbackHistory,
            {
              venueId: payload.venueId,
              at: Date.now(),
              outcome: payload.outcome,
              reasons: payload.reasons,
              praiseTags: payload.praiseTags,
              quiz,
            },
          ].slice(-120),
        }
        saveMvpPersist(next)
        trackMvp('mvp_profile_updated', {
          venueId: payload.venueId,
          outcome: payload.outcome,
        })
        return next
      })
    },
    [quiz],
  )

  const onSwipeComplete = useCallback(
    (records: { tags: TasteTag[]; action: SwipeAction }[]) => {
      setSwipeRecords(records)
      setPersisted((prev) => {
        const next = applySwipeSessionToPersist(prev, records)
        saveMvpPersist(next)
        if (isColdStartComplete(next.coldStartSwipeCount)) {
          trackMvp('mvp_cold_start_complete', {
            total: next.coldStartSwipeCount,
          })
        }
        return next
      })
      setStep('quiz')
    },
    [],
  )

  const onSkipToQuiz = useCallback(() => {
    trackMvp('mvp_cold_start_skip', {
      coldStartSwipeCount: persisted.coldStartSwipeCount,
    })
    setSwipeRecords([])
    setStep('quiz')
  }, [persisted.coldStartSwipeCount])

  const rerankRecoRemaining = useCallback(
    (
      remaining: Recommendation[],
      recoSession: { tags: TasteTag[]; action: SwipeAction }[],
    ) => {
      if (!isQuizComplete(quiz)) return remaining
      const p = loadMvpPersist()
      return rerankRecommendationListByRecoSwipe(
        remaining,
        recoSession,
        swipeRecords,
        quiz,
        {
          longTermPreference: p.preferenceVector,
          sessionBlendWeight: swipeRecords.length > 0 ? 0 : undefined,
          bookmarkVenueIds: p.bookmarks.map((b) => b.venueId),
        },
      )
    },
    [quiz, swipeRecords],
  )

  const handleQuizSubmit = useCallback(() => {
    if (!isQuizComplete(quiz) || recoLoading) return

    const p = loadMvpPersist()
    const sessionBlendWeight = swipeRecords.length > 0 ? 0 : undefined
    const opts = {
      longTermPreference: p.preferenceVector,
      sessionBlendWeight,
      bookmarkVenueIds: p.bookmarks.map((b) => b.venueId),
    }

    void (async () => {
      setRecoLoading(true)
      trackMvp('mvp_quiz_done', { quiz })

      const apiSwipe = effectiveSwipeRecordsForApi(
        swipeRecords,
        p.preferenceVector,
      )

      let shouldShowResults = false
      try {
        submitAbortRef.current?.abort()
        const ctrl = new AbortController()
        submitAbortRef.current = ctrl
        const timer = window.setTimeout(() => ctrl.abort(), 90_000)
        try {
          const fromApi = await fetchMiMoRecommendations({
            swipeRecords: apiSwipe,
            quiz,
            venues: VENUE_POOL,
            longTermPreference: p.preferenceVector,
            signal: ctrl.signal,
          })
          if (!mountedRef.current) {
            /* 卸载 */
          } else if (fromApi?.length === 8) {
            const deck = augmentMimoToRecoDeck(fromApi)
            setRecommendations(deck)
            setRecoSource('mimo')
            trackMvp('mvp_recommend_source', {
              source: 'mimo',
              deckSize: deck.length,
            })
            shouldShowResults = true
          } else {
            throw new Error('mimo_fallback')
          }
        } finally {
          window.clearTimeout(timer)
          submitAbortRef.current = null
        }
      } catch {
        if (mountedRef.current) {
          const deck = recommendDeck8(swipeRecords, quiz, opts)
          setRecommendations(deck)
          setRecoSource('rules')
          trackMvp('mvp_recommend_source', {
            source: 'rules',
            deckSize: deck.length,
          })
          shouldShowResults = true
        }
      }
      if (mountedRef.current) {
        setRecoLoading(false)
        if (shouldShowResults) {
          setMainTab('discover')
          setRecoSwipeMountKey((k) => k + 1)
          setStep('reco-swipe')
        }
      }
    })()
  }, [quiz, recoLoading, swipeRecords])

  const showDetail =
    detailRecommendation &&
    (step === 'results' || step === 'reco-swipe') &&
    resultDetailId

  const headerRestartVisible =
    mainTab === 'discover' &&
    step !== 'swipe' &&
    !showDetail &&
    step !== 'visit-feedback' &&
    step !== 'depart'

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col overflow-x-hidden bg-surface-bg">
      <header className="flex shrink-0 items-center justify-between px-page-h pb-2 pt-4">
        <span className="text-caption font-medium text-brand-purple-deep">
          拍了拍 · PRD
        </span>
        {headerRestartVisible ? (
          <button
            type="button"
            onClick={restart}
            className="text-hint text-text-secondary underline underline-offset-2"
          >
            重新开始
          </button>
        ) : (
          <span className="w-14" aria-hidden />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden px-page-h">
        {mainTab === 'profile' && <TasteProfileView state={persisted} />}

        {mainTab === 'bookmarks' && (
          <>
            {bookmarkDetailId && venuesById.get(bookmarkDetailId) && (
              <VenueDetailSheet
                item={{ venue: venuesById.get(bookmarkDetailId)!, reason: '' }}
                quiz={
                  (persisted.bookmarks.find((b) => b.venueId === bookmarkDetailId)
                    ?.quizSnapshot ?? quiz) as Required<QuizAnswers>
                }
                recoSource="rules"
                bookmarked={bookmarkedIds.has(bookmarkDetailId)}
                onBack={() => setBookmarkDetailId(null)}
                onToggleBookmark={() => onToggleBookmark(bookmarkDetailId)}
                onDecideHere={() => {
                  const venue = venuesById.get(bookmarkDetailId)
                  if (!venue) return
                  const reco: Recommendation = { venue, reason: '' }
                  const usedQuiz = (
                    persisted.bookmarks.find((b) => b.venueId === bookmarkDetailId)
                      ?.quizSnapshot ?? quiz
                  ) as Required<QuizAnswers>
                  setVisitFeedbackTarget(reco)
                  setBookmarkDetailId(null)
                  setPersisted((prev) => {
                    const next = {
                      ...prev,
                      pendingFeedback: {
                        venueId: venue.id,
                        venueName: venue.name,
                        quizSnapshot: usedQuiz,
                        decidedAt: Date.now(),
                      },
                    }
                    saveMvpPersist(next)
                    return next
                  })
                  postVisitFeedbackStepRef.current = 'quiz'
                  setStep('depart')
                  setMainTab('discover')
                }}
              />
            )}

            {!bookmarkDetailId && (
              <BookmarksView
                bookmarks={persisted.bookmarks}
                venuesById={venuesById}
                onSelect={(venueId) => setBookmarkDetailId(venueId)}
                onRemove={(venueId) => {
                  setPersisted((prev) => {
                    const next = {
                      ...prev,
                      bookmarks: prev.bookmarks.filter((b) => b.venueId !== venueId),
                    }
                    saveMvpPersist(next)
                    trackMvp('mvp_bookmark_remove', { venueId })
                    return next
                  })
                }}
              />
            )}
          </>
        )}

        {mainTab === 'discover' && (
          <>
            {step === 'swipe' && (
              <SwipeStep
                priorSwipeCount={persisted.coldStartSwipeCount}
                canSkipUsingProfile={canSkipSwipe}
                onSkipToQuiz={onSkipToQuiz}
                onComplete={onSwipeComplete}
              />
            )}

            {step === 'quiz' && (
              <>
                {persisted.pendingFeedback && (
                  <button
                    type="button"
                    className="mb-3 w-full rounded-block border border-brand-purple bg-brand-purple-light px-4 py-3 text-left"
                    onClick={() => {
                      const pf = persisted.pendingFeedback!
                      const venue = venuesById.get(pf.venueId)
                      if (!venue) return
                      const fakeReco: Recommendation = { venue, reason: '' }
                      setVisitFeedbackTarget(fakeReco)
                      setQuiz(pf.quizSnapshot)
                      postVisitFeedbackStepRef.current = 'quiz'
                      setStep('visit-feedback')
                    }}
                  >
                    <p className="text-caption font-medium text-brand-purple-deep">
                      上次去了「{persisted.pendingFeedback.venueName}」
                    </p>
                    <p className="mt-0.5 text-hint text-text-secondary">
                      感觉怎么样？点这里告诉我 →
                    </p>
                  </button>
                )}
                <QuizStep
                  quiz={quiz}
                  onQuizChange={setQuiz}
                  pending={recoLoading}
                  onSubmit={handleQuizSubmit}
                />
              </>
            )}

            {step === 'visit-feedback' &&
              visitFeedbackTarget &&
              isQuizComplete(quiz) && (
                <VisitFeedbackStep
                  item={visitFeedbackTarget}
                  quiz={quiz}
                  onBack={() => {
                    setVisitFeedbackTarget(null)
                    setStep(postVisitFeedbackStepRef.current)
                  }}
                  onSubmit={(payload) => {
                    trackMvp('mvp_visit_feedback_submit', {
                      venueId: visitFeedbackTarget.venue.id,
                      outcome: payload.outcome,
                    })
                    onVenueFeedback({
                      venueId: visitFeedbackTarget.venue.id,
                      venueTags: visitFeedbackTarget.venue.tags,
                      outcome: payload.outcome,
                      reasons: payload.reasons,
                      praiseTags: payload.praiseTags,
                    })
                    setVisitFeedbackTarget(null)
                    setStep(postVisitFeedbackStepRef.current)
                  }}
                />
              )}

            {showDetail && isQuizComplete(quiz) && (
              <VenueDetailSheet
                item={detailRecommendation}
                quiz={quiz}
                recoSource={recoSource === 'mimo' ? 'mimo' : 'rules'}
                bookmarked={bookmarkedIds.has(detailRecommendation.venue.id)}
                onBack={closeResultDetail}
                onToggleBookmark={() =>
                  onToggleBookmark(detailRecommendation.venue.id)
                }
                onDecideHere={() => {
                  if (!bookmarkedIds.has(detailRecommendation.venue.id)) {
                    onToggleBookmark(detailRecommendation.venue.id)
                  }
                  if (isQuizComplete(quiz)) {
                    setPersisted((prev) => {
                      const next = {
                        ...prev,
                        pendingFeedback: {
                          venueId: detailRecommendation.venue.id,
                          venueName: detailRecommendation.venue.name,
                          quizSnapshot: quiz,
                          decidedAt: Date.now(),
                        },
                      }
                      saveMvpPersist(next)
                      return next
                    })
                  }
                  postVisitFeedbackStepRef.current = step
                  setVisitFeedbackTarget(detailRecommendation)
                  closeResultDetail()
                  setStep('depart')
                }}
              />
            )}

            {!showDetail &&
              step === 'results' &&
              recommendations &&
              isQuizComplete(quiz) &&
              !isColdStartComplete(persisted.coldStartSwipeCount) &&
              !bypassColdStartGate && (
                <ResultsEmptyStep
                  items={recommendations}
                  quiz={quiz}
                  swipeCount={persisted.coldStartSwipeCount}
                  onContinueSwipe={() => setStep('swipe')}
                  onBrowseAnyway={() => {
                    trackMvp('mvp_empty_browse_anyway', {})
                    setBypassColdStartGate(true)
                  }}
                />
              )}

            {!showDetail &&
              step === 'results' &&
              recommendations &&
              isQuizComplete(quiz) &&
              (isColdStartComplete(persisted.coldStartSwipeCount) ||
                bypassColdStartGate) && (
                <ResultsStep
                  items={recommendations}
                  quiz={quiz}
                  recoSource={recoSource === 'mimo' ? 'mimo' : 'rules'}
                  onEnterRecoSwipe={() => {
                    setRecoSwipeMountKey((k) => k + 1)
                    setStep('reco-swipe')
                  }}
                  onOpenVenue={handleOpenResultVenue}
                />
              )}

            {!showDetail &&
              step === 'reco-swipe' &&
              recommendations &&
              isQuizComplete(quiz) && (
                <RecoSwipeStep
                  key={recoSwipeMountKey}
                  initialDeck={recommendations}
                  quiz={quiz}
                  rerankRemaining={rerankRecoRemaining}
                  onBack={() => setStep('results')}
                  onOpenDetail={setResultDetailId}
                  onBookmarkVenue={bookmarkVenueEnsure}
                  onComplete={() => setStep('results')}
                />
              )}

            {step === 'depart' && visitFeedbackTarget && isQuizComplete(quiz) && (
              <DepartStep
                item={visitFeedbackTarget}
                quiz={quiz}
                onDone={() => {
                  setVisitFeedbackTarget(null)
                  restart()
                }}
              />
            )}
          </>
        )}
      </div>

      {showTabBar ? (
        <PrototypeTabBar active={mainTab} onChange={setMainTab} />
      ) : null}
    </div>
  )
}

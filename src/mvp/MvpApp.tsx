import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  QuizAnswers,
  Recommendation,
  Step,
  SwipeAction,
  TasteTag,
} from './types'
import { FeedbackStep } from './components/FeedbackStep'
import { SurveyPromptStep } from './components/SurveyPromptStep'
import { QuizStep } from './components/QuizStep'
import { ResultsStep } from './components/ResultsStep'
import { SwipeStep } from './components/SwipeStep'
import { VENUE_POOL } from './mockData'
import { recommendTop3 } from './recommend'
import { fetchMiMoRecommendations } from './fetchMiMoRecommend'
import { trackMvp } from './analytics'

function isQuizComplete(q: QuizAnswers): q is Required<QuizAnswers> {
  return Boolean(q.party && q.mood && q.distance)
}

export function MvpApp() {
  const [step, setStep] = useState<Step>('swipe')
  const [quiz, setQuiz] = useState<QuizAnswers>({})
  const [swipeRecords, setSwipeRecords] = useState<
    { tags: TasteTag[]; action: SwipeAction }[]
  >([])
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(
    null,
  )
  const [recoSource, setRecoSource] = useState<'mimo' | 'rules' | null>(null)
  const [recoLoading, setRecoLoading] = useState(false)

  const resultsViewLogged = useRef(false)
  const mountedRef = useRef(true)
  const submitAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      submitAbortRef.current?.abort()
    }
  }, [])

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
    setStep('swipe')
    setQuiz({})
    setSwipeRecords([])
    setRecommendations(null)
    setRecoSource(null)
    setRecoLoading(false)
  }

  const handleQuizSubmit = useCallback(() => {
    if (!isQuizComplete(quiz) || recoLoading) return

    void (async () => {
      setRecoLoading(true)
      trackMvp('mvp_quiz_done', { quiz })

      let shouldShowResults = false
      try {
        submitAbortRef.current?.abort()
        const ctrl = new AbortController()
        submitAbortRef.current = ctrl
        const timer = window.setTimeout(() => ctrl.abort(), 90_000)
        try {
          const fromApi = await fetchMiMoRecommendations({
            swipeRecords,
            quiz,
            venues: VENUE_POOL,
            signal: ctrl.signal,
          })
          if (!mountedRef.current) {
            /* 组件已卸载，不再写状态 */
          } else if (fromApi?.length === 3) {
            setRecommendations(fromApi)
            setRecoSource('mimo')
            trackMvp('mvp_recommend_source', { source: 'mimo' })
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
          const rules = recommendTop3(swipeRecords, quiz)
          setRecommendations(rules)
          setRecoSource('rules')
          trackMvp('mvp_recommend_source', { source: 'rules' })
          shouldShowResults = true
        }
      }
      if (mountedRef.current) {
        setRecoLoading(false)
        if (shouldShowResults) setStep('results')
      }
    })()
  }, [quiz, recoLoading, swipeRecords])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-surface-bg pb-10 pt-4">
      <header className="mb-4 flex items-center justify-between px-page-h">
        <span className="text-caption font-medium text-brand-purple-deep">
          拍了拍 MVP
        </span>
        {step !== 'swipe' && (
          <button
            type="button"
            onClick={restart}
            className="text-hint text-text-secondary underline underline-offset-2"
          >
            重新开始
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col px-page-h">
        {step === 'swipe' && (
          <SwipeStep
            onComplete={(records) => {
              setSwipeRecords(records)
              setStep('quiz')
            }}
          />
        )}

        {step === 'quiz' && (
          <QuizStep
            quiz={quiz}
            onQuizChange={setQuiz}
            pending={recoLoading}
            onSubmit={handleQuizSubmit}
          />
        )}

        {step === 'results' && recommendations && (
          <ResultsStep
            items={recommendations}
            recoSource={recoSource === 'mimo' ? 'mimo' : 'rules'}
            onNext={() => setStep('feedback')}
          />
        )}

        {step === 'feedback' && (
          <FeedbackStep
            onSubmit={() => {
              setStep('survey')
            }}
          />
        )}

        {step === 'survey' && (
          <SurveyPromptStep onFinish={() => setStep('done')} />
        )}

        {step === 'done' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-section pb-24 text-center">
            <div className="rounded-[24px] bg-brand-purple-light p-8">
              <span className="text-title-section text-brand-purple-darkest">
                谢谢反馈
              </span>
              <p className="mt-3 text-caption leading-[1.6] text-text-secondary">
                若你已填写腾讯问卷，非常感谢。产品内埋点见控制台事件
                <code className="mx-1 rounded-badge bg-brand-purple-light px-1 text-brand-purple-deep">
                  mvp-analytics
                </code>
                ；可随时「重新开始」再跑一遍。
              </p>
              <button
                type="button"
                className="mt-6 w-full rounded-block bg-brand-purple py-3 text-body font-medium text-white"
                onClick={restart}
              >
                再来一轮
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

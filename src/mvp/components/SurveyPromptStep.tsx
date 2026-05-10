import { useEffect } from 'react'
import { IconExternalLink } from '@tabler/icons-react'
import { getSurveyUrl } from '../surveyUrl'
import { trackMvp } from '../analytics'

export function SurveyPromptStep({ onFinish }: { onFinish: () => void }) {
  const url = getSurveyUrl()

  useEffect(() => {
    trackMvp('mvp_survey_prompt_view', { url })
  }, [url])

  return (
    <div className="flex flex-col gap-section pb-8">
      <header className="rounded-block bg-brand-purple px-card-inner py-5 text-center">
        <h2 className="text-title-section text-white">再帮一个小忙</h2>
        <p className="mt-2 text-caption leading-[1.5] text-text-on-purple">
          感谢刚才的整体反馈。若方便，请用约 1～2 分钟在问卷里勾几道题，方便我们做假设验证（匿名）。
        </p>
      </header>

      <div className="rounded-block border border-border-card bg-surface-card px-card-inner py-5 shadow-card">
        <p className="text-body leading-[1.5] text-text-primary">
          问卷由{' '}
          <span className="font-medium text-brand-purple-deep">腾讯问卷</span>{' '}
          托管，将在新标签页打开。
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackMvp('mvp_survey_open_click', { url })}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-block bg-teal py-3 text-body font-medium text-teal-light"
        >
          打开问卷（新标签）
          <IconExternalLink size={18} stroke={2} aria-hidden />
        </a>
        <button
          type="button"
          onClick={onFinish}
          className="mt-3 w-full rounded-block border-[1.5px] border-border-card bg-surface-card py-3 text-body text-text-secondary"
        >
          暂不填写 · 结束本轮
        </button>
      </div>

      <p className="text-center text-hint leading-[1.5] text-text-tertiary">
        填完后可关掉标签页回到此处，或直接结束。
      </p>
    </div>
  )
}

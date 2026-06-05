import type { QuizAnswers, Recommendation } from '../types'
import { PlaceIcon } from './PlaceIcon'

export function DepartStep({
  item,
  onDone,
}: {
  item: Recommendation
  quiz: Required<QuizAnswers>
  onDone: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-page-h py-8 text-center">
      <div className="w-full rounded-[24px] bg-brand-purple-light p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple">
          <PlaceIcon
            name={item.venue.iconName}
            size={28}
            className="text-white"
          />
        </div>
        <h2 className="text-title-section text-brand-purple-darkest">出发吧！</h2>
        <p className="mt-2 text-body font-medium text-brand-purple-deep">
          {item.venue.name}
        </p>
        <p className="mt-3 text-caption leading-[1.6] text-text-secondary">
          已帮你存好。回来后告诉我感觉怎么样，推荐会越来越懂你。
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-block bg-brand-purple py-3 text-body font-medium text-white"
          onClick={onDone}
        >
          好的，回来再说
        </button>
      </div>
    </div>
  )
}

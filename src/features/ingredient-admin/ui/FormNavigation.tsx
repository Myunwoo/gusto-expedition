import type { Step } from '../types'

interface FormNavigationProps {
  currentStep: Step
  isLoading: boolean
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
}

const FormNavigation = ({
  currentStep,
  isLoading,
  onPrevious,
  onNext,
  onComplete,
}: FormNavigationProps) => {
  return (
    <div className="mt-8 flex justify-between">
      <div>
        {currentStep > 1 && (
          <button
            onClick={onPrevious}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            이전
          </button>
        )}
      </div>
      <div className="flex gap-3">
        {currentStep < 3 ? (
          <button
            onClick={onNext}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '다음 (저장)'}
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            완료
          </button>
        )}
      </div>
    </div>
  )
}

export default FormNavigation
import CreateStepper from './CreateStepper'
import type { Step } from '../types'

interface FormHeaderProps {
  isEditMode: boolean
  currentStep: Step
  onCancel: () => void
}

const FormHeader = ({
  isEditMode,
  currentStep,
  onCancel,
}: FormHeaderProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {isEditMode ? '재료 수정' : '재료 등록'}
        </h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          취소
        </button>
      </div>

      <CreateStepper currentStep={currentStep} />
    </div>
  )
}

export default FormHeader
// Stepper Component
import type { Step } from '../types'

const CreateStepper = ({ currentStep }: { currentStep: Step }) => {
  const steps = [
    { number: 1, label: '기본정보' },
    { number: 2, label: '다국어 + 별칭' },
    { number: 3, label: '관계 조작' },
  ]

  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentStep >= step.number
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
            >
              {step.number}
            </div>
            <span
              className={`ml-3 font-medium ${currentStep >= step.number
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${currentStep > step.number
                ? 'bg-blue-500'
                : 'bg-gray-200 dark:bg-gray-700'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default CreateStepper
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Step } from '@/features/ingredient-admin/types'
import { useIngredientFormData } from '@/features/ingredient-admin/hooks/useIngredientFormData'
import { useIngredientFormActions } from '@/features/ingredient-admin/hooks/useIngredientFormActions'
import FormHeader from '@/features/ingredient-admin/ui/FormHeader'
import FormNavigation from '@/features/ingredient-admin/ui/FormNavigation'
import CreateBaseInfo from '@/features/ingredient-admin/ui/CreateBaseInfo'
import CreateI18nAliasInfo from '@/features/ingredient-admin/ui/CreateI18nAliasInfo'
import CreateEdgeInfo from '@/features/ingredient-admin/ui/CreateEdgeInfo'


const CreateIngredientPage = () => {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<Step>(1)

  // 수정 모드인지 확인
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  const isEditMode = editId !== null
  const [ingredientId, setIngredientId] = useState<number | null>(editId)

  // 폼 데이터 관리
  const {
    baseInfoData,
    i18nAliasInfoData,
    edgeInfoData,
    setBaseInfoData,
    setI18nAliasInfoData,
    setEdgeInfoData,
    isLoadingData,
    originalAliases,
  } = useIngredientFormData({ editId, isEditMode })

  // 폼 액션 관리
  const {
    isLoading,
    handleBaseInfoSave,
    handleI18nAliasInfoSave,
    handleEdgeInfoComplete,
    handleCancel,
  } = useIngredientFormActions({
    isEditMode,
    ingredientId,
    setIngredientId,
    baseInfoData,
    i18nAliasInfoData,
    originalAliases,
    currentStep,
    setCurrentStep,
  })

  // 네비게이션 핸들러
  const handlePrevious = () => setCurrentStep((prev) => (prev - 1) as Step)
  const handleNext = () => {
    if (currentStep === 1) {
      handleBaseInfoSave()
    } else if (currentStep === 2) {
      handleI18nAliasInfoSave()
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <FormHeader
          isEditMode={isEditMode}
          currentStep={currentStep}
          onCancel={handleCancel}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {isLoadingData ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <CreateBaseInfo data={baseInfoData} onChange={setBaseInfoData} />
              )}
              {currentStep === 2 && (
                <CreateI18nAliasInfo data={i18nAliasInfoData} onChange={setI18nAliasInfoData} />
              )}
              {currentStep === 3 && (
                <CreateEdgeInfo
                  ingredientId={ingredientId}
                  data={edgeInfoData}
                  onChange={setEdgeInfoData}
                />
              )}

              <FormNavigation
                currentStep={currentStep}
                isLoading={isLoading}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={handleEdgeInfoComplete}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateIngredientPage
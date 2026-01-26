'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRecipeFormData } from '@/features/recipe-admin/hooks/useRecipeFormData'
import {
  useCreateRecipe,
  useUpdateRecipe,
  useUpdateRecipeI18n,
  useCreateAlias,
  useUpdateAliasAll,
} from '@/entities/recipe_admin/api/recipeAdminQueries'
import type {
  CreateRecipeReqDto,
  UpdateRecipeReqDto,
  UpdateRecipeI18nReqDto,
  CreateAliasReqDto,
  UpdateAliasAllReqDto,
} from '@/entities/recipe_admin/model/types'
import CreateBaseInfo from '@/features/recipe-admin/ui/CreateBaseInfo'
import CreateI18nInfo from '@/features/recipe-admin/ui/CreateI18nInfo'
import CreateAliasInfo from '@/features/recipe-admin/ui/CreateAliasInfo'
import CreateIngredientInfo from '@/features/recipe-admin/ui/CreateIngredientInfo'
import IngredientSelectPopup from '@/features/ingredient-admin/ui/IngredientSelectPopup'

const RecipeFormPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 수정 모드인지 확인
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  const isEditMode = editId !== null
  const [recipeId, setRecipeId] = useState<number | null>(editId)

  // 폼 데이터 관리
  const {
    baseInfoData,
    i18nAliasInfoData,
    setBaseInfoData,
    setI18nAliasInfoData,
    isLoadingData,
    originalAliases,
  } = useRecipeFormData({ editId, isEditMode })

  // Mutations
  const createRecipeMutation = useCreateRecipe()
  const updateRecipeMutation = useUpdateRecipe()
  const updateI18nMutation = useUpdateRecipeI18n()
  const createAliasMutation = useCreateAlias()
  const updateAliasAllMutation = useUpdateAliasAll()

  const isLoadingBaseInfo = createRecipeMutation.isPending || updateRecipeMutation.isPending
  const isLoadingI18n = updateI18nMutation.isPending
  const isLoadingAlias = createAliasMutation.isPending || updateAliasAllMutation.isPending

  // 기본정보 저장 핸들러
  const handleSaveBaseInfo = async (data: CreateRecipeReqDto | UpdateRecipeReqDto) => {
    if ('recipeId' in data) {
      // Update
      await updateRecipeMutation.mutateAsync(data)
    } else {
      // Create
      const response = await createRecipeMutation.mutateAsync(data)
      setRecipeId(response.recipeId)
    }
  }

  // i18n 저장 핸들러 (upsert: 없으면 생성, 있으면 수정)
  const handleSaveI18n = async (data: UpdateRecipeI18nReqDto) => {
    await updateI18nMutation.mutateAsync(data)
  }

  // 별칭 저장 핸들러
  const handleSaveAlias = async (data: CreateAliasReqDto | UpdateAliasAllReqDto) => {
    if (isEditMode) {
      await updateAliasAllMutation.mutateAsync(data as UpdateAliasAllReqDto)
    } else {
      await createAliasMutation.mutateAsync(data as CreateAliasReqDto)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditMode ? '레시피 수정' : '레시피 등록'}
            </h1>
            <button
              onClick={() => router.push('/admin/recipe')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              목록으로
            </button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 기본정보 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <CreateBaseInfo
                data={baseInfoData}
                onChange={setBaseInfoData}
                isEditMode={isEditMode}
                recipeId={recipeId}
                onSave={handleSaveBaseInfo}
                isLoading={isLoadingBaseInfo}
              />
            </div>

            {/* 다국어 정보 섹션 */}
            {recipeId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <CreateI18nInfo
                  data={i18nAliasInfoData}
                  onChange={setI18nAliasInfoData}
                  isEditMode={isEditMode}
                  recipeId={recipeId}
                  onSave={handleSaveI18n}
                  isLoading={isLoadingI18n}
                />
              </div>
            )}

            {/* 별칭 섹션 */}
            {recipeId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <CreateAliasInfo
                  data={i18nAliasInfoData}
                  onChange={setI18nAliasInfoData}
                  isEditMode={isEditMode}
                  recipeId={recipeId}
                  originalAliases={originalAliases}
                  onSave={handleSaveAlias}
                  isLoading={isLoadingAlias}
                />
              </div>
            )}

            {/* 재료 섹션 */}
            {recipeId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <CreateIngredientInfo recipeId={recipeId} />
              </div>
            )}
          </div>
        )}
      </div>
      <IngredientSelectPopup />
    </div>
  )
}

export default RecipeFormPage


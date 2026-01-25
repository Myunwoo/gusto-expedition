'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useIngredientFormData } from '@/features/ingredient-admin/hooks/useIngredientFormData'
import {
  useCreateIngredient,
  useUpdateIngredient,
  useUpdateIngredientI18n,
  useCreateAlias,
  useUpdateAliasAll,
} from '@/entities/ingredient_admin/api/ingredientAdminQueries'
import type {
  CreateIngredientBasicReqDto,
  UpdateIngredientBasicReqDto,
  UpdateIngredientI18nReqDto,
  CreateAliasReqDto,
  UpdateAliasAllReqDto,
} from '@/entities/ingredient_admin/model/types'
import CreateBaseInfo from '@/features/ingredient-admin/ui/CreateBaseInfo'
import CreateI18nInfo from '@/features/ingredient-admin/ui/CreateI18nInfo'
import CreateAliasInfo from '@/features/ingredient-admin/ui/CreateAliasInfo'
import CreateEdgeInfo from '@/features/ingredient-admin/ui/CreateEdgeInfo'
import IngredientSelectPopup from '@/features/ingredient-admin/ui/IngredientSelectPopup'

const IngredientFormPage = () => {
  const searchParams = useSearchParams()

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

  // Mutations
  const createIngredientMutation = useCreateIngredient()
  const updateIngredientMutation = useUpdateIngredient()
  const updateI18nMutation = useUpdateIngredientI18n()
  const createAliasMutation = useCreateAlias()
  const updateAliasAllMutation = useUpdateAliasAll()

  const isLoadingBaseInfo = createIngredientMutation.isPending || updateIngredientMutation.isPending
  const isLoadingI18n = updateI18nMutation.isPending
  const isLoadingAlias = createAliasMutation.isPending || updateAliasAllMutation.isPending

  // 기본정보 저장 핸들러
  const handleSaveBaseInfo = async (data: CreateIngredientBasicReqDto | UpdateIngredientBasicReqDto) => {
    if ('ingredientId' in data) {
      // Update
      await updateIngredientMutation.mutateAsync(data)
    } else {
      // Create
      const response = await createIngredientMutation.mutateAsync(data)
      setIngredientId(response.ingredientId)
    }
  }

  // i18n 저장 핸들러 (upsert: 없으면 생성, 있으면 수정)
  const handleSaveI18n = async (data: UpdateIngredientI18nReqDto) => {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isEditMode ? '재료 수정' : '재료 등록'}
          </h1>
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
                ingredientId={ingredientId}
                onSave={handleSaveBaseInfo}
                isLoading={isLoadingBaseInfo}
              />
            </div>

            {/* 다국어 정보 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <CreateI18nInfo
                data={i18nAliasInfoData}
                onChange={setI18nAliasInfoData}
                isEditMode={isEditMode}
                ingredientId={ingredientId}
                onSave={handleSaveI18n}
                isLoading={isLoadingI18n}
              />
            </div>

            {/* 별칭 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <CreateAliasInfo
                data={i18nAliasInfoData}
                onChange={setI18nAliasInfoData}
                isEditMode={isEditMode}
                ingredientId={ingredientId}
                originalAliases={originalAliases}
                onSave={handleSaveAlias}
                isLoading={isLoadingAlias}
              />
            </div>

            {/* 관계 정보 섹션 - 수정 모드에서만 표시 및 조작 가능 */}
            {isEditMode && ingredientId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <CreateEdgeInfo
                  ingredientId={ingredientId}
                  data={edgeInfoData}
                  onChange={setEdgeInfoData}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <IngredientSelectPopup />
    </div>
  )
}

export default IngredientFormPage

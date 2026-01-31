'use client'

import { useState, Suspense } from 'react'
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

const RecipeFormContent = () => {
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
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--base-off-white)' }}>
      <div className="max-w-5xl mx-auto" style={{ padding: 'var(--spacing-section) 24px' }}>
        {/* 헤더 */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--spacing-card)',
            marginBottom: '32px',
            boxShadow: '0 1px 2px var(--shadow-soft)'
          }}
        >
          <div className="flex items-center justify-between">
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 500,
                color: 'var(--ink-primary)',
                letterSpacing: '-0.01em',
                lineHeight: 1.4
              }}
            >
              {isEditMode ? '레시피 수정' : '레시피 등록'}
            </h1>
            <button
              onClick={() => router.push('/admin/recipe')}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: 'var(--ink-secondary)',
                borderRadius: 'var(--radius-button)',
                fontSize: '14px',
                fontWeight: 500,
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'all 180ms ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                e.currentTarget.style.borderColor = 'var(--brass)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = 'var(--focus-ring)'
                e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none'
              }}
            >
              목록으로
            </button>
          </div>
        </div>

        {isLoadingData ? (
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-card)',
              padding: '48px 24px',
              boxShadow: '0 1px 2px var(--shadow-soft)'
            }}
          >
            <div className="text-center">
              <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                데이터를 불러오는 중...
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 기본정보 섹션 */}
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--spacing-card)',
                boxShadow: '0 1px 2px var(--shadow-soft)'
              }}
            >
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
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'var(--spacing-card)',
                  boxShadow: '0 1px 2px var(--shadow-soft)'
                }}
              >
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
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'var(--spacing-card)',
                  boxShadow: '0 1px 2px var(--shadow-soft)'
                }}
              >
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
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'var(--spacing-card)',
                  boxShadow: '0 1px 2px var(--shadow-soft)'
                }}
              >
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

const RecipeFormPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh" style={{ backgroundColor: 'var(--base-off-white)' }}>
          <div className="max-w-5xl mx-auto" style={{ padding: 'var(--spacing-section) 24px' }}>
            <div className="text-center" style={{ padding: '48px 0' }}>
              <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                로딩 중...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <RecipeFormContent />
    </Suspense>
  )
}

export default RecipeFormPage


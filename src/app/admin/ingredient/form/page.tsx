'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

const IngredientFormContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

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
              {isEditMode ? '재료 수정' : '재료 등록'}
            </h1>
            <button
              onClick={() => router.push('/admin/ingredient')}
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
                ingredientId={ingredientId}
                onSave={handleSaveBaseInfo}
                isLoading={isLoadingBaseInfo}
              />
            </div>

            {/* 다국어 정보 섹션 */}
            {(isEditMode || ingredientId) && (
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
                  ingredientId={ingredientId}
                  onSave={handleSaveI18n}
                  isLoading={isLoadingI18n}
                />
              </div>
            )}

            {/* 별칭 섹션 */}
            {(isEditMode || ingredientId) && (
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
                  ingredientId={ingredientId}
                  originalAliases={originalAliases}
                  onSave={handleSaveAlias}
                  isLoading={isLoadingAlias}
                />
              </div>
            )}

            {/* 관계 정보 섹션 - 수정 모드에서만 표시 및 조작 가능 */}
            {isEditMode && ingredientId && (
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'var(--spacing-card)',
                  boxShadow: '0 1px 2px var(--shadow-soft)'
                }}
              >
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

const IngredientFormPage = () => {
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
      <IngredientFormContent />
    </Suspense>
  )
}

export default IngredientFormPage

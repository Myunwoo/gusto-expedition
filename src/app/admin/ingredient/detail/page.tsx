'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
// import { usePopupStore } from '@/shared/hooks/store/popupStore'
import { useIngredientAdmin } from '@/entities/ingredient_admin/api/ingredientAdminQueries'
import type { SelectIngredientResDto } from '@/entities/ingredient_admin/model/types'
import { DEFAULT_LOCALE } from '@/shared/config/locales'

export default function IngredientDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ingredientId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  // const [isEditMode, setIsEditMode] = useState(false)
  // const [isDirty, setIsDirty] = useState(false)
  // const popupStore = usePopupStore()

  const { data: ingredient, isLoading } = useIngredientAdmin(ingredientId ?? 0)

  useEffect(() => {
    if (!ingredientId) {
      // id가 없으면 리스트로 리다이렉트
      router.push('/admin/ingredients')
      return
    }
  }, [ingredientId, router])

  // 편집 관련 함수들 - 주석 처리
  // const handleEdit = () => {
  //   if (ingredient) {
  //     setFormData(JSON.parse(JSON.stringify(ingredient))) // Deep copy
  //     setIsEditMode(true)
  //   }
  // }

  // const handleCancel = () => {
  //   if (isDirty) {
  //     popupStore.open({
  //       id: 'commonConfirmPopup',
  //       data: {
  //         title: '변경사항 취소',
  //         content: '저장되지 않은 변경사항이 있습니다. 정말 취소하시겠습니까?',
  //         buttonOneText: '계속 편집',
  //         buttonTwoText: '취소',
  //         onCancel: () => {
  //           // 계속 편집 - 아무것도 안 함
  //         },
  //         onConfirm: () => {
  //           setIsEditMode(false)
  //           setIsDirty(false)
  //           setFormData(null)
  //         },
  //       },
  //     })
  //   } else {
  //     setIsEditMode(false)
  //     setFormData(null)
  //   }
  // }

  // const handleSave = async () => {
  //   if (!ingredientId || !formData) return
  //   // TODO: API 호출
  //   // await ingredientApi.updateIngredient(ingredientId, formData)
  //   setIsEditMode(false)
  //   setIsDirty(false)
  //   // TODO: 데이터 새로고침
  // }

  // const handleDelete = () => {
  //   if (!ingredientId) return
  //   popupStore.open({
  //     id: 'commonConfirmPopup',
  //     data: {
  //       title: '재료 삭제',
  //       content: '이 재료를 삭제하시겠습니까?\n삭제된 재료는 복구할 수 없습니다.',
  //       buttonOneText: '취소',
  //       buttonTwoText: '삭제',
  //       onCancel: () => {
  //         // 취소
  //       },
  //       onConfirm: async () => {
  //         // TODO: API 호출
  //         // await ingredientApi.deleteIngredient(ingredientId)
  //         router.push('/admin/ingredients')
  //       },
  //     },
  //   })
  // }

  if (!ingredientId) {
    return null
  }

  if (isLoading || !ingredient) {
    return (
      <div className="min-h-dvh p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <a href="/admin/ingredients" className="hover:text-gray-700 dark:hover:text-gray-300">
                  Ingredients
                </a>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {Object.values(ingredient.localeInfo)[0]?.name || '재료 상세'}
                </span>
              </nav>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {Object.values(ingredient.localeInfo)[0]?.name || '재료 상세'}
              </h1>
            </div>
            {/* 편집/삭제 버튼 - 주석 처리 */}
            {/* <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div> */}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* 기본정보 섹션 */}
          <BasicInfoSection ingredient={ingredient} />

          {/* i18n 섹션 */}
          <I18nSection ingredient={ingredient} />

          {/* 관계 섹션 */}
          <RelationsSection
            relatedIngredients={ingredient.relatedIngredients || []}
          />
        </div>
      </div>
    </div>
  )
}

// 기본정보 섹션 컴포넌트
function BasicInfoSection({
  ingredient,
}: {
  ingredient: SelectIngredientResDto
}) {
  const defaultLocaleInfo = Object.values(ingredient.localeInfo)[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        기본정보
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            기본명
          </label>
          <p className="text-gray-900 dark:text-gray-100">
            {defaultLocaleInfo?.name || '-'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            썸네일
          </label>
          {ingredient.thumbnailUrl ? (
            <img
              src={ingredient.thumbnailUrl}
              alt={defaultLocaleInfo?.name || '재료 이미지'}
              className="w-32 h-32 object-cover rounded-lg"
            />
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">썸네일 없음</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            활성화 여부
          </label>
          <p className="text-gray-900 dark:text-gray-100">
            {ingredient.isActive ? '활성' : '비활성'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">생성일</span>
            <p className="text-gray-900 dark:text-gray-100 mt-1">
              {new Date(ingredient.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">수정일</span>
            <p className="text-gray-900 dark:text-gray-100 mt-1">
              {new Date(ingredient.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// i18n 섹션 컴포넌트
function I18nSection({
  ingredient,
}: {
  ingredient: SelectIngredientResDto
}) {
  const locales = Object.keys(ingredient.localeInfo)
  const [selectedLocale, setSelectedLocale] = useState<string>(
    locales.length > 0 ? locales[0] : DEFAULT_LOCALE
  )
  const currentLocaleInfo = ingredient.localeInfo[selectedLocale]
  const currentAliases = ingredient.aliases[selectedLocale] || []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        다국어 정보
      </h2>

      {/* 언어 탭 */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => setSelectedLocale(locale)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${selectedLocale === locale
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            {locale}
          </button>
        ))}
      </div>

      {/* 선택된 언어의 정보 */}
      {currentLocaleInfo ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이름
            </label>
            <p className="text-gray-900 dark:text-gray-100">{currentLocaleInfo.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              설명
            </label>
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
              {currentLocaleInfo.description || '설명 없음'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              별칭 (Alias)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentAliases.length > 0 ? (
                currentAliases.map((alias) => (
                  <span
                    key={alias.aliasId}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                  >
                    {alias.alias}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 dark:text-gray-500 text-sm">별칭 없음</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>등록된 정보가 없습니다.</p>
        </div>
      )}
    </div>
  )
}

// i18n 폼 컴포넌트 - 주석 처리 (편집 기능 제거)
// function I18nForm({
//   i18n,
//   isEditMode,
//   onDataChange,
// }: {
//   i18n: IngredientI18nDetail
//   isEditMode: boolean
//   onDataChange: (data: Partial<IngredientI18nDetail>) => void
// }) {
//   const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
//   ...
// }

// 관계 섹션 컴포넌트
function RelationsSection({
  relatedIngredients,
}: {
  relatedIngredients: Array<{
    ingredientId: number
    name: string
    relationType: 'PAIR_WELL' | 'AVOID' | 'NEUTRAL'
    score: number
    confidence: number
    reasonSummary: string
  }>
}) {
  const [selectedType, setSelectedType] = useState<'PAIR_WELL' | 'AVOID' | 'NEUTRAL'>('PAIR_WELL')
  const filteredRelations = relatedIngredients.filter((r) => r.relationType === selectedType)

  const typeLabels = {
    PAIR_WELL: '궁합',
    AVOID: '비궁합',
    NEUTRAL: '중립',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        관계
      </h2>

      {/* 관계 타입 탭 */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {(['PAIR_WELL', 'AVOID', 'NEUTRAL'] as const).map((type) => {
          const count = relatedIngredients.filter((r) => r.relationType === type).length
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${selectedType === type
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {typeLabels[type]} ({count})
            </button>
          )
        })}
      </div>

      {/* 관계 리스트 */}
      <div className="space-y-2">
        {filteredRelations.length > 0 ? (
          filteredRelations.map((relation) => (
            <div
              key={relation.ingredientId}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {relation.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    점수: {relation.score} | 신뢰도: {relation.confidence}
                  </p>
                  {relation.reasonSummary && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {relation.reasonSummary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            등록된 {typeLabels[selectedType]} 관계가 없습니다.
          </div>
        )}
      </div>

      {/* 관계 추가 버튼 - 주석 처리 (편집 기능 제거) */}
      {/* {isEditMode && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            console.log('관계 추가')
          }}
        >
          관계 추가
        </button>
      )} */}
    </div>
  )
}

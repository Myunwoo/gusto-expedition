'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePopupStore } from '@/shared/hooks/store/popupStore'

// TODO: 실제 API 타입으로 교체
type IngredientDetail = {
  id: number
  name: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  i18n: IngredientI18nDetail[]
  relations: IngredientRelation[]
}

type IngredientI18nDetail = {
  id: number
  locale: string
  name: string
  description?: string
  aliases?: string[]
}

type IngredientRelation = {
  id: number
  toIngredientId: number
  toIngredientName: string
  type: 'GOOD' | 'BAD' | 'NEUTRAL'
  strength?: number
  evidence?: string
  updatedAt: string
}

export default function IngredientDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ingredientId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const popupStore = usePopupStore()

  // TODO: 실제 API 호출로 교체
  const [ingredient, setIngredient] = useState<IngredientDetail | null>(null)
  const [formData, setFormData] = useState<IngredientDetail | null>(null)

  useEffect(() => {
    if (!ingredientId) {
      // id가 없으면 리스트로 리다이렉트
      router.push('/admin/ingredients')
      return
    }
    // TODO: API 호출
    // const { data } = useQuery(...)
  }, [ingredientId, router])

  const handleEdit = () => {
    if (ingredient) {
      setFormData(JSON.parse(JSON.stringify(ingredient))) // Deep copy
      setIsEditMode(true)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      popupStore.open({
        id: 'commonConfirmPopup',
        data: {
          title: '변경사항 취소',
          content: '저장되지 않은 변경사항이 있습니다. 정말 취소하시겠습니까?',
          buttonOneText: '계속 편집',
          buttonTwoText: '취소',
          onCancel: () => {
            // 계속 편집 - 아무것도 안 함
          },
          onConfirm: () => {
            setIsEditMode(false)
            setIsDirty(false)
            setFormData(null)
          },
        },
      })
    } else {
      setIsEditMode(false)
      setFormData(null)
    }
  }

  const handleSave = async () => {
    if (!ingredientId || !formData) return
    // TODO: API 호출
    // await ingredientApi.updateIngredient(ingredientId, formData)
    setIsEditMode(false)
    setIsDirty(false)
    // TODO: 데이터 새로고침
  }

  const handleDelete = () => {
    if (!ingredientId) return
    popupStore.open({
      id: 'commonConfirmPopup',
      data: {
        title: '재료 삭제',
        content: '이 재료를 삭제하시겠습니까?\n삭제된 재료는 복구할 수 없습니다.',
        buttonOneText: '취소',
        buttonTwoText: '삭제',
        onCancel: () => {
          // 취소
        },
        onConfirm: async () => {
          // TODO: API 호출
          // await ingredientApi.deleteIngredient(ingredientId)
          router.push('/admin/ingredients')
        },
      },
    })
  }

  if (!ingredientId) {
    return null
  }

  if (!ingredient) {
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

  const displayData = isEditMode ? formData : ingredient

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
                  {displayData?.name || '재료 상세'}
                </span>
              </nav>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {displayData?.name || '재료 상세'}
              </h1>
            </div>
            <div className="flex gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    저장
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* 기본정보 섹션 */}
          <BasicInfoSection
            ingredient={displayData}
            isEditMode={isEditMode}
            onDataChange={(data) => {
              if (formData) {
                setFormData({ ...formData, ...data })
                setIsDirty(true)
              }
            }}
          />

          {/* i18n 섹션 */}
          <I18nSection
            i18nData={displayData?.i18n || []}
            isEditMode={isEditMode}
            onDataChange={(i18n) => {
              if (formData) {
                setFormData({ ...formData, i18n })
                setIsDirty(true)
              }
            }}
          />

          {/* 관계 섹션 */}
          <RelationsSection
            relations={displayData?.relations || []}
            ingredientId={ingredientId}
            isEditMode={isEditMode}
          />
        </div>
      </div>
    </div>
  )
}

// 기본정보 섹션 컴포넌트
function BasicInfoSection({
  ingredient,
  isEditMode,
  onDataChange,
}: {
  ingredient: IngredientDetail | null
  isEditMode: boolean
  onDataChange: (data: Partial<IngredientDetail>) => void
}) {
  if (!ingredient) return null

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
          {isEditMode ? (
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) => onDataChange({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100">{ingredient.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            태그
          </label>
          {isEditMode ? (
            <input
              type="text"
              value={ingredient.tags?.join(', ') || ''}
              onChange={(e) =>
                onDataChange({
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })
              }
              placeholder="태그를 쉼표로 구분하여 입력"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {ingredient.tags && ingredient.tags.length > 0 ? (
                ingredient.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 dark:text-gray-500 text-sm">태그 없음</span>
              )}
            </div>
          )}
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
  i18nData,
  isEditMode,
  onDataChange,
}: {
  i18nData: IngredientI18nDetail[]
  isEditMode: boolean
  onDataChange: (i18n: IngredientI18nDetail[]) => void
}) {
  const [selectedLocale, setSelectedLocale] = useState<string>(
    i18nData.length > 0 ? i18nData[0].locale : 'ko'
  )
  const currentI18n = i18nData.find((item) => item.locale === selectedLocale)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        다국어 정보
      </h2>

      {/* 언어 탭 */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {['ko', 'en', 'it'].map((locale) => {
          const exists = i18nData.some((item) => item.locale === locale)
          return (
            <button
              key={locale}
              onClick={() => setSelectedLocale(locale)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedLocale === locale
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {locale.toUpperCase()}
              {!exists && isEditMode && (
                <span className="ml-1 text-xs text-gray-400">(신규)</span>
              )}
            </button>
          )
        })}
      </div>

      {/* 선택된 언어의 정보 */}
      {currentI18n ? (
        <I18nForm
          i18n={currentI18n}
          isEditMode={isEditMode}
          onDataChange={(updated) => {
            const newI18n = i18nData.map((item) =>
              item.locale === selectedLocale ? { ...item, ...updated } : item
            )
            onDataChange(newI18n)
          }}
        />
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {isEditMode ? (
            <button
              onClick={() => {
                const newI18n: IngredientI18nDetail = {
                  id: 0,
                  locale: selectedLocale,
                  name: '',
                  description: '',
                  aliases: [],
                }
                onDataChange([...i18nData, newI18n])
                setSelectedLocale(selectedLocale)
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {selectedLocale.toUpperCase()} 언어 정보 추가
            </button>
          ) : (
            <p>등록된 정보가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}

// i18n 폼 컴포넌트
function I18nForm({
  i18n,
  isEditMode,
  onDataChange,
}: {
  i18n: IngredientI18nDetail
  isEditMode: boolean
  onDataChange: (data: Partial<IngredientI18nDetail>) => void
}) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          이름
        </label>
        {isEditMode ? (
          <input
            type="text"
            value={i18n.name}
            onChange={(e) => onDataChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-gray-900 dark:text-gray-100">{i18n.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          설명
        </label>
        {isEditMode ? (
          <textarea
            value={i18n.description || ''}
            onChange={(e) => onDataChange({ description: e.target.value })}
            rows={isDescriptionExpanded ? 10 : 4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        ) : (
          <div>
            {i18n.description ? (
              <>
                <p
                  className={`text-gray-900 dark:text-gray-100 whitespace-pre-line ${
                    !isDescriptionExpanded && 'line-clamp-3'
                  }`}
                >
                  {i18n.description}
                </p>
                {i18n.description.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    {isDescriptionExpanded ? '접기' : '펼치기'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">설명 없음</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          별칭 (Alias)
        </label>
        {isEditMode ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="별칭을 입력하고 Enter를 누르세요"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const newAliases = [...(i18n.aliases || []), e.currentTarget.value.trim()]
                  onDataChange({ aliases: newAliases })
                  e.currentTarget.value = ''
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-2">
              {i18n.aliases?.map((alias, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm"
                >
                  {alias}
                  <button
                    onClick={() => {
                      const newAliases = i18n.aliases?.filter((_, i) => i !== idx) || []
                      onDataChange({ aliases: newAliases })
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {i18n.aliases && i18n.aliases.length > 0 ? (
              i18n.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                >
                  {alias}
                </span>
              ))
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-sm">별칭 없음</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 관계 섹션 컴포넌트
function RelationsSection({
  relations,
  ingredientId,
  isEditMode,
}: {
  relations: IngredientRelation[]
  ingredientId: number
  isEditMode: boolean
}) {
  const [selectedType, setSelectedType] = useState<'GOOD' | 'BAD' | 'NEUTRAL'>('GOOD')
  const filteredRelations = relations.filter((r) => r.type === selectedType)

  const typeLabels = {
    GOOD: '궁합',
    BAD: '비궁합',
    NEUTRAL: '중립',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        관계
      </h2>

      {/* 관계 타입 탭 */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {(['GOOD', 'BAD', 'NEUTRAL'] as const).map((type) => {
          const count = relations.filter((r) => r.type === type).length
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedType === type
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
              key={relation.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => {
                // TODO: Drawer로 상세 보기
                console.log('관계 상세:', relation)
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {relation.toIngredientName}
                  </p>
                  {relation.strength && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      강도: {relation.strength}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(relation.updatedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            등록된 {typeLabels[selectedType]} 관계가 없습니다.
          </div>
        )}
      </div>

      {/* 관계 추가 버튼 (Edit 모드일 때만) */}
      {isEditMode && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            // TODO: 관계 추가 UI (Drawer 또는 인라인)
            console.log('관계 추가')
          }}
        >
          관계 추가
        </button>
      )}
    </div>
  )
}

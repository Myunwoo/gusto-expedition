import { useState } from "react"
import { CreateEdgeInfoData } from "../types"
import { CreateEdgeReqDto, IngredientRelationType } from "@/entities/ingredient_admin/model/types"
import { ingredientAdminApi } from '@/entities/ingredient_admin/api/ingredientAdminApi'
import { usePopupStore } from '@/shared/hooks/store/popupStore'

// Step 3: 관계 조작
const CreateEdgeInfo = ({
  ingredientId,
  data,
  onChange,
}: {
  ingredientId: number
  data: CreateEdgeInfoData
  onChange: (data: CreateEdgeInfoData) => void
}) => {
  const popupStore = usePopupStore()
  const [showAddRelation, setShowAddRelation] = useState(false)
  const [newRelation, setNewRelation] = useState({
    toIngredientId: null as number | null,
    toIngredientName: '',
    relationType: 'PAIR_WELL' as IngredientRelationType,
    score: 5,
    reasonSummary: '',
  })

  const handleOpenIngredientSelect = () => {
    popupStore.open({
      id: 'ingredientSelectPopup',
      data: {
        onSelect: (ingredient) => {
          setNewRelation({
            ...newRelation,
            toIngredientId: ingredient.ingredientId,
            toIngredientName: ingredient.name,
          })
        },
      },
    })
  }

  const handleAddRelation = async () => {
    // 수정 모드에서만 호출되므로 ingredientId는 항상 존재함
    if (!newRelation.toIngredientId || !newRelation.toIngredientName.trim()) {
      return
    }

    // PAIR_WELL 또는 AVOID일 때는 점수 필수
    if (
      (newRelation.relationType === 'PAIR_WELL' || newRelation.relationType === 'AVOID') &&
      (!newRelation.score || newRelation.score < 1 || newRelation.score > 10)
    ) {
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '입력 오류',
          content: '궁합/비궁합 관계는 점수(1-10)를 입력해주세요.',
        },
      })
      return
    }

    try {
      const edgeData: CreateEdgeReqDto = {
        fromIngredientId: ingredientId,
        toIngredientId: newRelation.toIngredientId,
        relationType: newRelation.relationType,
        score: newRelation.relationType === 'NEUTRAL' ? undefined : newRelation.score,
        reasonSummary: newRelation.reasonSummary || undefined,
      }

      await ingredientAdminApi.createEdge(edgeData)

      onChange({
        relations: [
          ...data.relations,
          {
            toIngredientId: newRelation.toIngredientId,
            toIngredientName: newRelation.toIngredientName,
            relationType: newRelation.relationType,
            score: newRelation.score,
            reasonSummary: newRelation.reasonSummary,
          },
        ],
      })

      setNewRelation({
        toIngredientId: null,
        toIngredientName: '',
        relationType: 'PAIR_WELL',
        score: 5,
        reasonSummary: '',
      })
      setShowAddRelation(false)
    } catch (error) {
      console.error('관계 추가 실패:', error)
    }
  }

  const relationTypes: { value: IngredientRelationType; label: string }[] = [
    { value: 'PAIR_WELL', label: '궁합' },
    { value: 'AVOID', label: '비궁합' },
    { value: 'NEUTRAL', label: '중립' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          관계 조작
        </h2>
        <button
          onClick={() => setShowAddRelation(!showAddRelation)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          {showAddRelation ? '취소' : '관계 추가'}
        </button>
      </div>

      {/* 관계 추가 폼 */}
      {showAddRelation && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              대상 재료 (to)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRelation.toIngredientName}
                readOnly
                placeholder="재료를 선택하세요"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer"
                onClick={handleOpenIngredientSelect}
              />
              <button
                type="button"
                onClick={handleOpenIngredientSelect}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                선택
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              관계 타입
            </label>
            <select
              value={newRelation.relationType}
              onChange={(e) =>
                setNewRelation({
                  ...newRelation,
                  relationType: e.target.value as IngredientRelationType,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {relationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 점수 입력 필드: NEUTRAL이 아닐 때만 표시 */}
          {newRelation.relationType !== 'NEUTRAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                점수 (1-10) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newRelation.score || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  if (value === '') {
                    setNewRelation({
                      ...newRelation,
                      score: 0,
                    })
                  } else {
                    const numValue = parseInt(value, 10)
                    if (numValue >= 1 && numValue <= 10) {
                      setNewRelation({
                        ...newRelation,
                        score: numValue,
                      })
                    }
                  }
                }}
                placeholder="1-10 사이의 숫자를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              근거 메모
            </label>
            <textarea
              value={newRelation.reasonSummary}
              onChange={(e) =>
                setNewRelation({ ...newRelation, reasonSummary: e.target.value })
              }
              placeholder="관계의 근거를 입력하세요"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          <button
            onClick={handleAddRelation}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            관계 추가
          </button>
        </div>
      )}

      {/* 관계 리스트 */}
      <div className="space-y-4">
        {data.relations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            등록된 관계가 없습니다.
          </div>
        ) : (
          data.relations.map((relation, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {relation.toIngredientName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    타입: {relation.relationType === 'PAIR_WELL' ? '궁합' : relation.relationType === 'AVOID' ? '비궁합' : '중립'} | 점수: {relation.score}
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
        )}
      </div>
    </div>
  )
}

export default CreateEdgeInfo
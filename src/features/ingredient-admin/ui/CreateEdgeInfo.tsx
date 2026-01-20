import { useState } from "react"
import { CreateEdgeInfoData } from "../types"
import { CreateEdgeReqDto, IngredientRelationType } from "@/entities/ingredient_admin/model/types"
import { ingredientAdminApi } from '@/entities/ingredient_admin/api/ingredientAdminApi'

// Step 3: 관계 조작
const CreateEdgeInfo = ({
  ingredientId,
  data,
  onChange,
}: {
  ingredientId: number | null
  data: CreateEdgeInfoData
  onChange: (data: CreateEdgeInfoData) => void
}) => {
  const [showAddRelation, setShowAddRelation] = useState(false)
  const [newRelation, setNewRelation] = useState({
    toIngredientName: '',
    relationType: 'PAIR_WELL' as IngredientRelationType,
    score: 5,
    reasonSummary: '',
  })

  const handleAddRelation = async () => {
    // TODO: 실제로는 toIngredientId를 검색해서 찾아야 함
    // 여기서는 데모용으로 간단히 처리
    if (!ingredientId || !newRelation.toIngredientName.trim()) {
      return
    }

    // 실제 구현에서는 ingredient 검색 API를 호출해야 함
    const mockToIngredientId = 999 // 임시 값

    try {
      const edgeData: CreateEdgeReqDto = {
        fromIngredientId: ingredientId,
        toIngredientId: mockToIngredientId,
        relationType: newRelation.relationType,
        score: newRelation.score,
        reasonSummary: newRelation.reasonSummary || undefined,
      }

      await ingredientAdminApi.createEdge(edgeData)

      onChange({
        relations: [
          ...data.relations,
          {
            toIngredientId: mockToIngredientId,
            toIngredientName: newRelation.toIngredientName,
            relationType: newRelation.relationType,
            score: newRelation.score,
            reasonSummary: newRelation.reasonSummary,
          },
        ],
      })

      setNewRelation({
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
            <input
              type="text"
              value={newRelation.toIngredientName}
              onChange={(e) =>
                setNewRelation({ ...newRelation, toIngredientName: e.target.value })
              }
              placeholder="재료명을 입력하세요 (검색 기능은 추후 구현)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              점수 (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={newRelation.score}
              onChange={(e) =>
                setNewRelation({
                  ...newRelation,
                  score: parseInt(e.target.value) || 5,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
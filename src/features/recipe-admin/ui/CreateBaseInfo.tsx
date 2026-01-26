import { CreateBaseInfoData } from "../types"
import type { CreateRecipeReqDto, UpdateRecipeReqDto } from "@/entities/recipe_admin/model/types"

interface CreateBaseInfoProps {
  data: CreateBaseInfoData
  onChange: (data: CreateBaseInfoData) => void
  isEditMode: boolean
  recipeId: number | null
  onSave: (data: CreateRecipeReqDto | UpdateRecipeReqDto) => Promise<void>
  isLoading: boolean
}

// Step 1: 기본정보
const CreateBaseInfo = ({
  data,
  onChange,
  isEditMode,
  recipeId,
  onSave,
  isLoading,
}: CreateBaseInfoProps) => {
  const handleSave = async () => {
    if (!data.title.trim()) {
      return
    }

    if (isEditMode && recipeId) {
      const updateData: UpdateRecipeReqDto = {
        recipeId,
        title: data.title,
        source: data.source || undefined,
      }
      await onSave(updateData)
    } else {
      const createData: CreateRecipeReqDto = {
        title: data.title,
        source: data.source || undefined,
      }
      await onSave(createData)
    }
  }
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        기본정보
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          레시피 제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="레시피 제목을 입력하세요"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          출처
        </label>
        <input
          type="text"
          value={data.source}
          onChange={(e) => onChange({ ...data, source: e.target.value })}
          placeholder="레시피 출처를 입력하세요 (예: https://example.com/recipe)"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isLoading || !data.title.trim()}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {isLoading ? '저장 중...' : isEditMode ? '수정' : '등록'}
        </button>
      </div>
    </div>
  )
}

export default CreateBaseInfo


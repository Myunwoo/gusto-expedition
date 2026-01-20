import { CreateBaseInfoData } from "../types"

// Step 1: 기본정보
const CreateBaseInfo = ({
  data,
  onChange,
}: {
  data: CreateBaseInfoData
  onChange: (data: CreateBaseInfoData) => void
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        기본정보
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          기본명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="재료 이름을 입력하세요"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          썸네일 URL
        </label>
        <input
          type="url"
          value={data.thumbnailUrl}
          onChange={(e) => onChange({ ...data, thumbnailUrl: e.target.value })}
          placeholder="https://..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.isActive}
            onChange={(e) => onChange({ ...data, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            활성화
          </span>
        </label>
      </div>
    </div>
  )
}

export default CreateBaseInfo
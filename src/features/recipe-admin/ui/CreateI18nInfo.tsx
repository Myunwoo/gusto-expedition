import { useState } from "react"
import { CreateI18nAliasInfoData, CreateI18nAliasInfoLocaleData } from "../types"
import { SUPPORTED_LOCALE_CODES, DEFAULT_LOCALE } from "@/shared/config/locales"
import type { UpdateRecipeI18nReqDto } from "@/entities/recipe_admin/model/types"

interface CreateI18nInfoProps {
  data: CreateI18nAliasInfoData
  onChange: (data: CreateI18nAliasInfoData) => void
  isEditMode: boolean
  recipeId: number | null
  onSave: (data: UpdateRecipeI18nReqDto) => Promise<void>
  isLoading: boolean
}

const CreateI18nInfo = ({
  data,
  onChange,
  isEditMode,
  recipeId,
  onSave,
  isLoading,
}: CreateI18nInfoProps) => {
  const [selectedLocale, setSelectedLocale] = useState<string>(DEFAULT_LOCALE)
  const availableLocales = SUPPORTED_LOCALE_CODES

  const currentLocaleData = data.locales[selectedLocale] || {
    description: '',
    instructions: '',
    aliases: [],
  }

  const updateLocaleData = (locale: string, updates: Partial<CreateI18nAliasInfoLocaleData>) => {
    onChange({
      locales: {
        ...data.locales,
        [locale]: {
          ...(data.locales[locale] || { description: '', instructions: '', aliases: [] }),
          ...updates,
        },
      },
    })
  }

  const handleSave = async () => {
    if (!recipeId) {
      return
    }

    const localeData = currentLocaleData

    // i18n 저장 (upsert: 없으면 생성, 있으면 수정)
    const i18nData: UpdateRecipeI18nReqDto = {
      recipeId,
      locale: selectedLocale,
      description: localeData.description || undefined,
      instructions: localeData.instructions || undefined,
    }
    await onSave(i18nData)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        다국어 정보
      </h2>

      {/* 언어 탭 */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {availableLocales.map((locale) => (
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

      {/* 선택된 언어의 입력 폼 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            설명
          </label>
          <textarea
            value={currentLocaleData.description}
            onChange={(e) =>
              updateLocaleData(selectedLocale, { description: e.target.value })
            }
            placeholder="레시피에 대한 설명을 입력하세요"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            조리 방법
          </label>
          <textarea
            value={currentLocaleData.instructions}
            onChange={(e) =>
              updateLocaleData(selectedLocale, { instructions: e.target.value })
            }
            placeholder="조리 방법을 입력하세요"
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isLoading || !recipeId}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {isLoading ? '저장 중...' : isEditMode ? '수정' : '등록'} ({selectedLocale})
        </button>
      </div>
    </div>
  )
}

export default CreateI18nInfo


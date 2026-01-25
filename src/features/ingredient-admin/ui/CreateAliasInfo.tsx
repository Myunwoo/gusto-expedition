import { useState } from "react"
import { CreateI18nAliasInfoData, CreateI18nAliasInfoLocaleData } from "../types"
import { SUPPORTED_LOCALE_CODES, DEFAULT_LOCALE } from "@/shared/config/locales"
import type { CreateAliasReqDto, UpdateAliasAllReqDto } from "@/entities/ingredient_admin/model/types"

interface CreateAliasInfoProps {
  data: CreateI18nAliasInfoData
  onChange: (data: CreateI18nAliasInfoData) => void
  isEditMode: boolean
  ingredientId: number | null
  originalAliases: Record<string, string[]>
  onSave: (data: CreateAliasReqDto | UpdateAliasAllReqDto) => Promise<void>
  isLoading: boolean
}

const CreateAliasInfo = ({
  data,
  onChange,
  isEditMode,
  ingredientId,
  originalAliases,
  onSave,
  isLoading,
}: CreateAliasInfoProps) => {
  const [selectedLocale, setSelectedLocale] = useState<string>(DEFAULT_LOCALE)
  const [isComposing, setIsComposing] = useState(false)
  const availableLocales = SUPPORTED_LOCALE_CODES
  
  const currentLocaleData = data.locales[selectedLocale] || {
    name: '',
    description: '',
    aliases: [],
  }

  const updateLocaleData = (locale: string, updates: Partial<CreateI18nAliasInfoLocaleData>) => {
    onChange({
      locales: {
        ...data.locales,
        [locale]: {
          ...(data.locales[locale] || { name: '', description: '', aliases: [] }),
          ...updates,
        },
      },
    })
  }

  const addAlias = (alias: string) => {
    const trimmedAlias = alias.trim()
    if (!trimmedAlias) return

    // 최신 상태를 직접 참조
    const latestLocaleData = data.locales[selectedLocale] || {
      name: '',
      description: '',
      aliases: [],
    }

    if (!latestLocaleData.aliases.includes(trimmedAlias)) {
      updateLocaleData(selectedLocale, {
        aliases: [...latestLocaleData.aliases, trimmedAlias],
      })
    }
  }

  const removeAlias = (index: number) => {
    updateLocaleData(selectedLocale, {
      aliases: currentLocaleData.aliases.filter((_, i) => i !== index),
    })
  }

  const handleAliasKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중에는 Enter 키 이벤트를 무시
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      const value = e.currentTarget.value
      if (value.trim()) {
        addAlias(value)
        e.currentTarget.value = ''
      }
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const handleSave = async () => {
    if (!ingredientId) {
      return
    }

    const localeData = currentLocaleData

    // 별칭 저장 (변경이 있는 경우만)
    if (isEditMode) {
      const currentAliases = localeData.aliases.filter((a) => a.trim() !== '').sort()
      const originalAliasList = (originalAliases[selectedLocale] || []).sort()

      const hasAliasChanged =
        currentAliases.length !== originalAliasList.length ||
        !currentAliases.every((alias, index) => alias === originalAliasList[index])

      if (hasAliasChanged) {
        const aliasData: UpdateAliasAllReqDto = {
          ingredientId,
          locale: selectedLocale,
          aliases: currentAliases,
        }
        await onSave(aliasData)
      }
    } else {
      // 등록 모드: 별칭이 있으면 저장
      const filteredAliases = localeData.aliases.filter((a) => a.trim() !== '')
      if (filteredAliases.length > 0) {
        const aliasData: CreateAliasReqDto = {
          ingredientId,
          locale: selectedLocale,
          aliases: filteredAliases,
        }
        await onSave(aliasData)
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        별칭
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

      {/* 선택된 언어의 별칭 입력 폼 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            별칭 추가
          </label>
          <input
            type="text"
            onKeyDown={handleAliasKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="별칭을 입력하고 Enter를 누르세요"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 별칭 리스트 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            등록된 별칭 목록
          </label>
          {currentLocaleData.aliases.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
              등록된 별칭이 없습니다.
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {currentLocaleData.aliases.map((alias, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm text-gray-900 dark:text-gray-100">{alias}</span>
                  <button
                    onClick={() => removeAlias(index)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isLoading || !ingredientId}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {isLoading ? '저장 중...' : isEditMode ? '수정' : '등록'} ({selectedLocale})
        </button>
      </div>
    </div>
  )
}

export default CreateAliasInfo


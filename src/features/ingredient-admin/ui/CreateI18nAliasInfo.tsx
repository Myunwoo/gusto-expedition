import { useState } from "react"
import { CreateI18nAliasInfoData, CreateI18nAliasInfoLocaleData } from "../types"
import { SUPPORTED_LOCALE_CODES, DEFAULT_LOCALE } from "@/shared/config/locales"

// Step 2: i18n + alias
const CreateI18nAliasInfo = ({
  data,
  onChange,
}: {
  data: CreateI18nAliasInfoData
  onChange: (data: CreateI18nAliasInfoData) => void
}) => {
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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        다국어 정보 + 별칭
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
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={currentLocaleData.name}
            onChange={(e) =>
              updateLocaleData(selectedLocale, { name: e.target.value })
            }
            placeholder={`${selectedLocale} 이름을 입력하세요`}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            설명
          </label>
          <textarea
            value={currentLocaleData.description}
            onChange={(e) =>
              updateLocaleData(selectedLocale, { description: e.target.value })
            }
            placeholder="재료에 대한 설명을 입력하세요"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            별칭 (Alias)
          </label>
          <input
            type="text"
            onKeyDown={handleAliasKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="별칭을 입력하고 Enter를 누르세요"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {currentLocaleData.aliases.map((alias, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {alias}
                <button
                  onClick={() => removeAlias(index)}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateI18nAliasInfo
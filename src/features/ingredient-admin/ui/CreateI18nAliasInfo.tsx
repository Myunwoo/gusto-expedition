import { useState } from "react"
import { CreateI18nAliasInfoData, CreateI18nAliasInfoLocaleData } from "../types"

// Step 2: i18n + alias
const CreateI18nAliasInfo = ({
  data,
  onChange,
}: {
  data: CreateI18nAliasInfoData
  onChange: (data: CreateI18nAliasInfoData) => void
}) => {
  const [selectedLocale, setSelectedLocale] = useState<string>('ko-KR')
  const availableLocales = ['ko-KR', 'en-US', 'it-IT']
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
    if (alias.trim() && !currentLocaleData.aliases.includes(alias.trim())) {
      updateLocaleData(selectedLocale, {
        aliases: [...currentLocaleData.aliases, alias.trim()],
      })
    }
  }

  const removeAlias = (index: number) => {
    updateLocaleData(selectedLocale, {
      aliases: currentLocaleData.aliases.filter((_, i) => i !== index),
    })
  }

  const handleAliasKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = e.currentTarget.value
      if (value.trim()) {
        addAlias(value)
        e.currentTarget.value = ''
      }
    }
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
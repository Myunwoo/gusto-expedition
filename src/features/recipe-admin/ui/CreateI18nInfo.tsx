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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--ink-primary)',
          letterSpacing: '-0.01em',
          lineHeight: 1.4
        }}
      >
        다국어 정보
      </h2>

      {/* 언어 탭 */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--divider-default)'
        }}
      >
        {availableLocales.map((locale) => {
          const isActive = selectedLocale === locale
          return (
            <button
              key={locale}
              onClick={() => setSelectedLocale(locale)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                color: isActive ? 'var(--brass)' : 'var(--ink-secondary)',
                borderBottom: isActive ? '2px solid var(--brass)' : '2px solid transparent',
                backgroundColor: 'transparent',
                border: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                transition: 'all 180ms ease-out',
                marginBottom: '-1px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--ink-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--ink-secondary)'
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = 'var(--focus-ring)'
                e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none'
              }}
            >
              {locale}
            </button>
          )
        })}
      </div>

      {/* 선택된 언어의 입력 폼 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label 
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--ink-secondary)',
              marginBottom: '6px',
              lineHeight: 1.6
            }}
          >
            설명
          </label>
          <textarea
            value={currentLocaleData.description}
            onChange={(e) =>
              updateLocaleData(selectedLocale, { description: e.target.value })
            }
            placeholder="레시피에 대한 설명을 입력하세요"
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-button)',
              backgroundColor: 'var(--white)',
              color: 'var(--ink-primary)',
              fontSize: '14px',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical',
              transition: 'all 180ms ease-out'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--brass)'
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.outline = 'none'
            }}
          />
        </div>

        <div>
          <label 
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--ink-secondary)',
              marginBottom: '6px',
              lineHeight: 1.6
            }}
          >
            조리 방법
          </label>
          <textarea
            value={currentLocaleData.instructions}
            onChange={(e) =>
              updateLocaleData(selectedLocale, { instructions: e.target.value })
            }
            placeholder="조리 방법을 입력하세요"
            rows={8}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-button)',
              backgroundColor: 'var(--white)',
              color: 'var(--ink-primary)',
              fontSize: '14px',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical',
              transition: 'all 180ms ease-out'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--brass)'
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.outline = 'none'
            }}
          />
        </div>
      </div>

      <div 
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid var(--divider-default)'
        }}
      >
        <button
          onClick={handleSave}
          disabled={isLoading || !recipeId}
          style={{
            padding: '12px 24px',
            backgroundColor: (isLoading || !recipeId) ? 'var(--ink-muted)' : 'var(--brass)',
            color: '#ffffff',
            borderRadius: 'var(--radius-button)',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: (isLoading || !recipeId) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !recipeId) ? 0.6 : 1,
            transition: 'all 180ms ease-out'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && recipeId) {
              e.currentTarget.style.backgroundColor = 'var(--brass-light)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && recipeId) {
              e.currentTarget.style.backgroundColor = 'var(--brass)'
            }
          }}
          onFocus={(e) => {
            if (!isLoading && recipeId) {
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none'
          }}
        >
          {isLoading ? '저장 중...' : isEditMode ? '수정' : '등록'} ({selectedLocale})
        </button>
      </div>
    </div>
  )
}

export default CreateI18nInfo


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
        별칭
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

      {/* 선택된 언어의 별칭 입력 폼 */}
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
            별칭 추가
          </label>
          <input
            type="text"
            onKeyDown={handleAliasKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="별칭을 입력하고 Enter를 누르세요"
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

        {/* 별칭 리스트 */}
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
            등록된 별칭 목록
          </label>
          {currentLocaleData.aliases.length === 0 ? (
            <div 
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: 'var(--ink-muted)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-card)',
                fontSize: '13px',
                lineHeight: 1.6
              }}
            >
              등록된 별칭이 없습니다.
            </div>
          ) : (
            <div 
              style={{
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden'
              }}
            >
              {currentLocaleData.aliases.map((alias, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: index < currentLocaleData.aliases.length - 1 
                      ? '1px solid var(--divider-default)' 
                      : 'none',
                    transition: 'background-color 180ms ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span 
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink-primary)',
                      lineHeight: 1.6
                    }}
                  >
                    {alias}
                  </span>
                  <button
                    onClick={() => removeAlias(index)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--terracotta)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--terracotta)',
                      borderRadius: 'var(--radius-button)',
                      cursor: 'pointer',
                      transition: 'all 180ms ease-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(180, 87, 58, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = 'var(--focus-ring)'
                      e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none'
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
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
          disabled={isLoading || !ingredientId}
          style={{
            padding: '12px 24px',
            backgroundColor: (isLoading || !ingredientId) ? 'var(--ink-muted)' : 'var(--brass)',
            color: '#ffffff',
            borderRadius: 'var(--radius-button)',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: (isLoading || !ingredientId) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !ingredientId) ? 0.6 : 1,
            transition: 'all 180ms ease-out'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && ingredientId) {
              e.currentTarget.style.backgroundColor = 'var(--brass-light)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && ingredientId) {
              e.currentTarget.style.backgroundColor = 'var(--brass)'
            }
          }}
          onFocus={(e) => {
            if (!isLoading && ingredientId) {
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

export default CreateAliasInfo


'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePopupStore } from '@/shared/hooks/store/popupStore'
import { useIngredientAdmin, useDeleteIngredient } from '@/entities/ingredient_admin/api/ingredientAdminQueries'
import type { SelectIngredientResDto } from '@/entities/ingredient_admin/model/types'
import { DEFAULT_LOCALE } from '@/shared/config/locales'

export default function IngredientDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ingredientId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  const popupStore = usePopupStore()

  const { data: ingredient, isLoading } = useIngredientAdmin(ingredientId ?? 0)
  const deleteIngredientMutation = useDeleteIngredient()

  useEffect(() => {
    if (!ingredientId) {
      // id가 없으면 리스트로 리다이렉트
      router.push('/admin/ingredient')
      return
    }
  }, [ingredientId, router])

  const handleEdit = () => {
    if (ingredientId) {
      router.push(`/admin/ingredient/form?id=${ingredientId}`)
    }
  }

  const deleteIngredient = async (ingredientId: number) => {
    try {
      await deleteIngredientMutation.mutateAsync(ingredientId)
      popupStore.close()
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '삭제 완료',
          content: '재료가 성공적으로 삭제되었습니다.',
          onConfirm: () => {
            router.push('/admin/ingredient')
          },
        },
      })
    } catch {
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '삭제 실패',
          content: '재료 삭제 중 오류가 발생했습니다.',
        },
      })
    }
  }

  const handleDelete = () => {
    if (!ingredientId) return
    popupStore.open({
      id: 'commonConfirmPopup',
      data: {
        title: '재료 삭제',
        content: '이 재료를 삭제하시겠습니까?\n삭제된 재료는 복구할 수 없습니다.',
        buttonOneText: '취소',
        buttonTwoText: '삭제',
        onConfirm: async () => {
          popupStore.close()
          deleteIngredient(ingredientId)
        },
      },
    })
  }

  if (!ingredientId) {
    return null
  }

  if (isLoading || !ingredient) {
    return (
      <div className="min-h-dvh" style={{ backgroundColor: 'var(--base-off-white)' }}>
        <div className="max-w-5xl mx-auto" style={{ padding: 'var(--spacing-section) 24px' }}>
          <div 
            className="text-center"
            style={{ 
              padding: '48px 0',
              color: 'var(--ink-muted)',
              fontSize: '14px',
              lineHeight: 1.6
            }}
          >
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const defaultLocaleInfo = Object.values(ingredient.localeInfo)[0]
  const displayName = defaultLocaleInfo?.name || ingredient.name || '재료 상세'

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--base-off-white)' }}>
      <div className="max-w-5xl mx-auto" style={{ padding: 'var(--spacing-section) 24px' }}>
        {/* Header */}
        <div 
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--spacing-card)',
            marginBottom: '32px',
            boxShadow: '0 1px 2px var(--shadow-soft)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <nav 
                style={{
                  fontSize: '13px',
                  color: 'var(--ink-muted)',
                  marginBottom: '8px',
                  lineHeight: 1.6
                }}
              >
                <Link 
                  href="/admin/ingredient" 
                  style={{
                    color: 'var(--ink-muted)',
                    textDecoration: 'none',
                    transition: 'color 180ms ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--ink-secondary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--ink-muted)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'var(--focus-ring)'
                    e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                    e.currentTarget.style.borderRadius = '2px'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none'
                  }}
                >
                  Ingredients
                </Link>
                <span style={{ margin: '0 8px', color: 'var(--ink-muted)' }}>/</span>
                <span style={{ color: 'var(--ink-primary)' }}>
                  {displayName}
                </span>
              </nav>
              <h1 
                style={{
                  fontSize: '28px',
                  fontWeight: 500,
                  color: 'var(--ink-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.4
                }}
              >
                {displayName}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/admin/ingredient')}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: 'var(--ink-secondary)',
                  borderRadius: 'var(--radius-button)',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                  e.currentTarget.style.borderColor = 'var(--brass)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                목록으로
              </button>
              <button
                onClick={handleEdit}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--brass)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-button)',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 180ms ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brass-light)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brass)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteIngredientMutation.isPending}
                style={{
                  padding: '12px 20px',
                  backgroundColor: deleteIngredientMutation.isPending ? 'var(--ink-muted)' : 'var(--terracotta)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-button)',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: deleteIngredientMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: deleteIngredientMutation.isPending ? 0.6 : 1,
                  transition: 'all 180ms ease-out'
                }}
                onMouseEnter={(e) => {
                  if (!deleteIngredientMutation.isPending) {
                    e.currentTarget.style.backgroundColor = 'var(--terracotta-light)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleteIngredientMutation.isPending) {
                    e.currentTarget.style.backgroundColor = 'var(--terracotta)'
                  }
                }}
                onFocus={(e) => {
                  if (!deleteIngredientMutation.isPending) {
                    e.currentTarget.style.outline = 'var(--focus-ring)'
                    e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                {deleteIngredientMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* 기본정보 섹션 */}
          <BasicInfoSection ingredient={ingredient} />

          {/* i18n 섹션 */}
          <I18nSection ingredient={ingredient} />

          {/* 관계 섹션 */}
          <RelationsSection
            relatedIngredients={ingredient.relatedIngredients || []}
          />
        </div>
      </div>
    </div>
  )
}

// 기본정보 섹션 컴포넌트
function BasicInfoSection({
  ingredient,
}: {
  ingredient: SelectIngredientResDto
}) {
  return (
    <div 
      style={{
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-card)',
        padding: 0,
        boxShadow: '0 1px 2px var(--shadow-soft)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--sand-layer)',
          padding: 'var(--spacing-card)',
          borderBottom: '1px solid var(--divider-default)'
        }}
      >
        <h2 
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--ink-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.4
          }}
        >
          기본정보
        </h2>
      </div>
      <div style={{ padding: 'var(--spacing-card)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            기본명
          </label>
          <p style={{ color: 'var(--ink-primary)', fontSize: '15px', lineHeight: 1.6 }}>
            {ingredient.name || '-'}
          </p>
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
            썸네일
          </label>
          {ingredient.thumbnailUrl ? (
            <img
              src={ingredient.thumbnailUrl}
              alt={ingredient.name || '재료 이미지'}
              style={{
                width: '128px',
                height: '128px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-button)',
                border: '1px solid var(--border-default)'
              }}
            />
          ) : (
            <p style={{ color: 'var(--ink-muted)', fontSize: '13px', lineHeight: 1.6 }}>
              썸네일 없음
            </p>
          )}
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
            활성화 여부
          </label>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: ingredient.isActive 
                ? 'rgba(176, 141, 87, 0.12)' 
                : 'rgba(123, 115, 104, 0.08)',
              color: ingredient.isActive 
                ? 'var(--brass)' 
                : 'var(--ink-muted)'
            }}
          >
            {ingredient.isActive ? '활성' : '비활성'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '13px' }}>
          <div>
            <span style={{ color: 'var(--ink-muted)', lineHeight: 1.6 }}>생성일</span>
            <p style={{ color: 'var(--ink-primary)', marginTop: '4px', lineHeight: 1.6 }}>
              {new Date(ingredient.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--ink-muted)', lineHeight: 1.6 }}>수정일</span>
            <p style={{ color: 'var(--ink-primary)', marginTop: '4px', lineHeight: 1.6 }}>
              {new Date(ingredient.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

// i18n 섹션 컴포넌트
function I18nSection({
  ingredient,
}: {
  ingredient: SelectIngredientResDto
}) {
  const locales = Object.keys(ingredient.localeInfo)
  const [selectedLocale, setSelectedLocale] = useState<string>(
    locales.length > 0 ? locales[0] : DEFAULT_LOCALE
  )
  const currentLocaleInfo = ingredient.localeInfo[selectedLocale]
  const currentAliases = ingredient.aliases[selectedLocale] || []

  return (
    <div 
      style={{
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-card)',
        padding: 0,
        boxShadow: '0 1px 2px var(--shadow-soft)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--sand-layer)',
          padding: 'var(--spacing-card)',
          borderBottom: '1px solid var(--divider-default)'
        }}
      >
        <h2 
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--ink-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.4
          }}
        >
          다국어 정보
        </h2>
      </div>
      <div style={{ padding: 'var(--spacing-card)' }}>
      {/* 언어 탭 */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--divider-default)'
        }}
      >
        {locales.map((locale) => {
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

      {/* 선택된 언어의 정보 */}
      {currentLocaleInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              이름
            </label>
            <p style={{ color: 'var(--ink-primary)', fontSize: '15px', lineHeight: 1.6 }}>
              {currentLocaleInfo.name}
            </p>
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
              설명
            </label>
            <p 
              style={{ 
                color: 'var(--ink-primary)', 
                fontSize: '15px',
                lineHeight: 1.7,
                whiteSpace: 'pre-line'
              }}
            >
              {currentLocaleInfo.description || '설명 없음'}
            </p>
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
              별칭 (Alias)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentAliases.length > 0 ? (
                currentAliases.map((alias) => (
                  <span
                    key={alias.aliasId}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: 'rgba(176, 141, 87, 0.08)',
                      color: 'var(--ink-secondary)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      lineHeight: 1.5
                    }}
                  >
                    {alias.alias}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--ink-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                  별칭 없음
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            등록된 정보가 없습니다.
          </p>
        </div>
      )}
      </div>
    </div>
  )
}

// 관계 섹션 컴포넌트
function RelationsSection({
  relatedIngredients,
}: {
  relatedIngredients: Array<{
    ingredientId: number
    name: string
    relationType: 'PAIR_WELL' | 'AVOID' | 'NEUTRAL'
    score: number
    confidence: number
    reasonSummary: string
  }>
}) {
  const [selectedType, setSelectedType] = useState<'PAIR_WELL' | 'AVOID' | 'NEUTRAL'>('PAIR_WELL')
  const filteredRelations = relatedIngredients.filter((r) => r.relationType === selectedType)

  const typeLabels = {
    PAIR_WELL: '궁합',
    AVOID: '비궁합',
    NEUTRAL: '중립',
  }

  // 백엔드 점수(-1.0~1.0)를 UI 점수(1-10)로 변환
  const convertScoreToDisplay = (score: number, relationType: 'PAIR_WELL' | 'AVOID' | 'NEUTRAL'): number | null => {
    if (relationType === 'NEUTRAL') {
      return null // 중립은 점수 없음
    }
    if (relationType === 'PAIR_WELL') {
      // 0.1~1.0 -> 1~10
      return Math.round(score * 10)
    } else { // AVOID
      // -1.0~-0.1 -> 1~10 (절댓값 사용)
      return Math.round(Math.abs(score) * 10)
    }
  }

  return (
    <div 
      style={{
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-card)',
        padding: 0,
        boxShadow: '0 1px 2px var(--shadow-soft)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--sand-layer)',
          padding: 'var(--spacing-card)',
          borderBottom: '1px solid var(--divider-default)'
        }}
      >
        <h2 
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--ink-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.4
          }}
        >
          관계
        </h2>
      </div>
      <div style={{ padding: 'var(--spacing-card)' }}>
      {/* 관계 타입 탭 */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--divider-default)'
        }}
      >
        {(['PAIR_WELL', 'AVOID', 'NEUTRAL'] as const).map((type) => {
          const count = relatedIngredients.filter((r) => r.relationType === type).length
          const isActive = selectedType === type
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
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
              {typeLabels[type]} ({count})
            </button>
          )
        })}
      </div>

      {/* 관계 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredRelations.length > 0 ? (
          filteredRelations.map((relation) => (
            <div
              key={relation.ingredientId}
              style={{
                padding: '16px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-button)',
                backgroundColor: 'var(--white)',
                transition: 'all 180ms ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                e.currentTarget.style.borderColor = 'var(--brass)'
              }}
              onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--white)'
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
            >
              <div>
                <p 
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'var(--ink-primary)',
                    lineHeight: 1.6,
                    marginBottom: '6px'
                  }}
                >
                  {relation.name}
                </p>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'var(--ink-muted)',
                    lineHeight: 1.6
                  }}
                >
                  {convertScoreToDisplay(relation.score, relation.relationType) !== null
                    ? `점수: ${convertScoreToDisplay(relation.score, relation.relationType)}/10`
                    : '점수: -'}
                  {' | '}신뢰도: {Math.round(relation.confidence * 100)}%
                </p>
                {relation.reasonSummary && (
                  <p 
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink-muted)',
                      marginTop: '6px',
                      lineHeight: 1.6
                    }}
                  >
                    {relation.reasonSummary}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              등록된 {typeLabels[selectedType]} 관계가 없습니다.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

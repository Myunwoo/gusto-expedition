'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useIngredientList } from '@/entities/ingredient_admin/api/ingredientAdminQueries'

export default function IngredientListPage() {
  const router = useRouter()
  const { data: ingredients, isLoading, error } = useIngredientList()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  // 검색 및 필터링
  const filteredIngredients = useMemo(() => {
    if (!ingredients) return []

    let filtered = ingredients

    // 활성화 상태 필터
    if (filterActive === 'active') {
      filtered = filtered.filter((ingredient) => ingredient.isActive)
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter((ingredient) => !ingredient.isActive)
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (ingredient) =>
          ingredient.name.toLowerCase().includes(query) ||
          ingredient.ingredientId.toString().includes(query)
      )
    }

    return filtered
  }, [ingredients, searchQuery, filterActive])

  const handleIngredientClick = (ingredientId: number) => {
    router.push(`/admin/ingredient/detail?id=${ingredientId}`)
  }

  const handleCreateClick = () => {
    router.push('/admin/ingredient/form')
  }

  if (isLoading) {
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
            <p>재료 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh" style={{ backgroundColor: 'var(--base-off-white)' }}>
        <div className="max-w-5xl mx-auto" style={{ padding: 'var(--spacing-section) 24px' }}>
          <div 
            className="text-center"
            style={{ 
              padding: '48px 0',
              color: 'var(--terracotta)',
              fontSize: '14px',
              lineHeight: 1.6
            }}
          >
            <p>재료 목록을 불러오는 중 오류가 발생했습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--base-off-white)' }}>
      <div className="max-w-5xl mx-auto" style={{ padding: 'var(--spacing-section) 24px' }}>
        {/* 헤더 */}
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
              <h1 
                style={{
                  fontSize: '28px',
                  fontWeight: 500,
                  color: 'var(--ink-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.4,
                  marginBottom: '4px'
                }}
              >
                재료 관리
              </h1>
              <p 
                style={{
                  fontSize: '14px',
                  color: 'var(--ink-muted)',
                  lineHeight: 1.6
                }}
              >
                총 {ingredients?.length || 0}개의 재료
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              style={{
                padding: '12px 24px',
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
              재료 등록
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
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
          <div className="flex gap-3">
            {/* 검색 입력 */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="재료명 또는 ID로 검색..."
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

            {/* 활성화 상태 필터 */}
            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as const).map((filter) => {
                const labels = { all: '전체', active: '활성', inactive: '비활성' }
                const isActive = filterActive === filter
                return (
                  <button
                    key={filter}
                    onClick={() => setFilterActive(filter)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 'var(--radius-button)',
                      fontSize: '14px',
                      fontWeight: 500,
                      border: isActive ? 'none' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 180ms ease-out',
                      backgroundColor: isActive ? 'var(--brass)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--ink-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                        e.currentTarget.style.borderColor = 'var(--brass)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = 'var(--border-default)'
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
                    {labels[filter]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 재료 리스트 */}
        <div 
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
            boxShadow: '0 1px 2px var(--shadow-soft)',
            overflow: 'hidden'
          }}
        >
          {filteredIngredients.length === 0 ? (
            <div style={{ padding: '72px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                {searchQuery || filterActive !== 'all'
                  ? '검색 결과가 없습니다.'
                  : '등록된 재료가 없습니다.'}
              </p>
            </div>
          ) : (
            <div>
              {filteredIngredients.map((ingredient, index) => (
                <div
                  key={ingredient.ingredientId}
                  onClick={() => handleIngredientClick(ingredient.ingredientId)}
                  tabIndex={0}
                  style={{
                    padding: '20px var(--spacing-card)',
                    borderTop: index > 0 ? '1px solid var(--divider-default)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 180ms ease-out',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                    e.currentTarget.style.borderLeft = '2px solid var(--brass)'
                    e.currentTarget.style.paddingLeft = 'calc(var(--spacing-card) - 2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderLeft = 'none'
                    e.currentTarget.style.paddingLeft = 'var(--spacing-card)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'var(--focus-ring)'
                    e.currentTarget.style.outlineOffset = '-2px'
                    e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleIngredientClick(ingredient.ingredientId)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p 
                        style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: 'var(--ink-primary)',
                          lineHeight: 1.6,
                          marginBottom: '4px'
                        }}
                      >
                        {ingredient.name}
                      </p>
                      <p 
                        style={{
                          fontSize: '13px',
                          color: 'var(--ink-muted)',
                          lineHeight: 1.6
                        }}
                      >
                        ID: {ingredient.ingredientId}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
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
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


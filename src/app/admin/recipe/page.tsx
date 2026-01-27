'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useRecipeList } from '@/entities/recipe_admin/api/recipeAdminQueries'

export default function RecipeListPage() {
  const router = useRouter()
  const { data: recipes, isLoading, error } = useRecipeList()
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 필터링
  const filteredRecipes = useMemo(() => {
    if (!recipes) return []

    let filtered = recipes

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query) ||
          recipe.recipeId.toString().includes(query)
      )
    }

    return filtered
  }, [recipes, searchQuery])

  const handleRecipeClick = (recipeId: number) => {
    router.push(`/admin/recipe/detail?id=${recipeId}`)
  }

  const handleCreateClick = () => {
    router.push('/admin/recipe/form')
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
            <p>레시피 목록을 불러오는 중...</p>
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
            <p>레시피 목록을 불러오는 중 오류가 발생했습니다.</p>
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
                레시피 관리
              </h1>
              <p 
                style={{
                  fontSize: '14px',
                  color: 'var(--ink-muted)',
                  lineHeight: 1.6
                }}
              >
                총 {recipes?.length || 0}개의 레시피
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
              레시피 등록
            </button>
          </div>
        </div>

        {/* 검색 */}
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
                placeholder="레시피명, 설명 또는 ID로 검색..."
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
          </div>
        </div>

        {/* 레시피 리스트 */}
        <div 
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
            boxShadow: '0 1px 2px var(--shadow-soft)',
            overflow: 'hidden'
          }}
        >
          {filteredRecipes.length === 0 ? (
            <div style={{ padding: '72px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                {searchQuery
                  ? '검색 결과가 없습니다.'
                  : '등록된 레시피가 없습니다.'}
              </p>
            </div>
          ) : (
            <div>
              {filteredRecipes.map((recipe, index) => (
                <div
                  key={recipe.recipeId}
                  onClick={() => handleRecipeClick(recipe.recipeId)}
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
                      handleRecipeClick(recipe.recipeId)
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
                        {recipe.title}
                      </p>
                      {recipe.description && (
                        <p 
                          style={{
                            fontSize: '13px',
                            color: 'var(--ink-muted)',
                            marginTop: '4px',
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {recipe.description}
                        </p>
                      )}
                      <div 
                        style={{
                          display: 'flex',
                          gap: '16px',
                          marginTop: '8px',
                          fontSize: '12px',
                          color: 'var(--ink-muted)',
                          lineHeight: 1.6
                        }}
                      >
                        <span>ID: {recipe.recipeId}</span>
                        {recipe.servings && <span>인분: {recipe.servings}</span>}
                        {recipe.cookTimeMinutes && <span>조리시간: {recipe.cookTimeMinutes}분</span>}
                      </div>
                    </div>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

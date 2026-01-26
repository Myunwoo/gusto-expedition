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
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">레시피 목록을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400">레시피 목록을 불러오는 중 오류가 발생했습니다.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">레시피 관리</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                총 {recipes?.length || 0}개의 레시피
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              레시피 등록
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            {/* 검색 입력 */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="레시피명, 설명 또는 ID로 검색..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 레시피 리스트 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {filteredRecipes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? '검색 결과가 없습니다.'
                  : '등록된 레시피가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.recipeId}
                  onClick={() => handleRecipeClick(recipe.recipeId)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {recipe.title}
                        </p>
                        {recipe.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {recipe.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>ID: {recipe.recipeId}</span>
                          {recipe.servings && <span>인분: {recipe.servings}</span>}
                          {recipe.cookTimeMinutes && <span>조리시간: {recipe.cookTimeMinutes}분</span>}
                        </div>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
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

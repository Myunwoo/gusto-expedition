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
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">재료 목록을 불러오는 중...</p>
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
              <p className="text-red-500 dark:text-red-400">재료 목록을 불러오는 중 오류가 발생했습니다.</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">재료 관리</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                총 {ingredients?.length || 0}개의 재료
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              재료 등록
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            {/* 검색 입력 */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="재료명 또는 ID로 검색..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 활성화 상태 필터 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                활성
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === 'inactive'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                비활성
              </button>
            </div>
          </div>
        </div>

        {/* 재료 리스트 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {filteredIngredients.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || filterActive !== 'all'
                  ? '검색 결과가 없습니다.'
                  : '등록된 재료가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.ingredientId}
                  onClick={() => handleIngredientClick(ingredient.ingredientId)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {ingredient.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ID: {ingredient.ingredientId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${ingredient.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {ingredient.isActive ? '활성' : '비활성'}
                      </span>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


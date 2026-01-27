'use client'

import { useState } from 'react'
import type { ReactElement } from 'react'
import PopupContainer from '@/shared/components/popup/common/PopupContainer'
import { usePopupStore, type IngredientSelectPopupData } from '@/shared/hooks/store/popupStore'
import { useIngredientList } from '@/entities/ingredient_admin/api/ingredientAdminQueries'
import type { SelectIngredientListItemDto } from '@/entities/ingredient_admin/model/types'

export default function IngredientSelectPopup() {
  const [data, setData] = useState<IngredientSelectPopupData>()
  const popupStore = usePopupStore()
  const { data: ingredients, isLoading } = useIngredientList()
  const [searchTerm, setSearchTerm] = useState('')

  // 검색 필터링
  const filteredIngredients = ingredients?.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleSelect = (ingredient: SelectIngredientListItemDto) => {
    if (data?.onSelect) {
      data.onSelect(ingredient)
    }
    popupStore.close()
  }

  let popupBody: ReactElement | null = null
  if (data) {
    popupBody = (
      <>
        <div className="popup-background"></div>
        <div className="popup-container">
          <div className="popup-inner bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* 헤더 */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                재료 선택
              </h2>
              {/* 검색 입력 */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="재료명으로 검색..."
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

            {/* 재료 목록 */}
            <div className="flex-1 overflow-y-auto mb-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  로딩 중...
                </div>
              ) : filteredIngredients.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 재료가 없습니다.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredIngredients.map((ingredient) => (
                    <button
                      key={ingredient.ingredientId}
                      onClick={() => handleSelect(ingredient)}
                      className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {ingredient.name}
                        </span>
                        {!ingredient.isActive && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            비활성
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={() => popupStore.close()}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <PopupContainer
      popupId="ingredientSelectPopup"
      setData={(data) => setData(data as IngredientSelectPopupData)}
    >
      {popupBody}
    </PopupContainer>
  )
}


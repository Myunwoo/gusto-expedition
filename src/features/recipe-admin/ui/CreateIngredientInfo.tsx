'use client'

import { useState, useEffect } from 'react'
import { useRecipeIngredients } from '@/entities/recipe_admin/api/recipeAdminQueries'
import {
  useCreateRecipeIngredient,
  useUpdateRecipeIngredient,
  useDeleteRecipeIngredient,
} from '@/entities/recipe_admin/api/recipeAdminQueries'
import { recipeAdminApi } from '@/entities/recipe_admin/api/recipeAdminApi'
import type {
  RecipeIngredientRole,
  CreateRecipeIngredientReqDto,
  UpdateRecipeIngredientReqDto,
  SelectRecipeIngredientListItemDto,
} from '@/entities/recipe_admin/model/types'
import { usePopupStore } from '@/shared/hooks/store/popupStore'
import type { IngredientSelectPopupData } from '@/shared/hooks/store/popupStore'
import type { SelectIngredientListItemDto } from '@/entities/ingredient_admin/model/types'

interface CreateIngredientInfoProps {
  recipeId: number
}

const CreateIngredientInfo = ({ recipeId }: CreateIngredientInfoProps) => {
  const popupStore = usePopupStore()
  const { data: ingredients, refetch } = useRecipeIngredients(recipeId)
  const createMutation = useCreateRecipeIngredient()
  const updateMutation = useUpdateRecipeIngredient()
  const deleteMutation = useDeleteRecipeIngredient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newIngredient, setNewIngredient] = useState({
    ingredientId: null as number | null,
    ingredientName: '',
    role: 'REQUIRED' as RecipeIngredientRole,
    amount: '',
    unit: '',
    note: '',
  })
  const [editIngredient, setEditIngredient] = useState({
    role: 'REQUIRED' as RecipeIngredientRole,
    amount: '',
    unit: '',
    note: '',
  })

  useEffect(() => {
    if (ingredients && editingId) {
      const ingredient = ingredients.find((ing) => ing.recipeIngredientId === editingId)
      if (ingredient) {
        setEditIngredient({
          role: ingredient.role,
          amount: ingredient.amount?.toString() || '',
          unit: ingredient.unit || '',
          note: ingredient.note || '',
        })
      }
    }
  }, [ingredients, editingId])

  const handleOpenIngredientSelect = () => {
    popupStore.open({
      id: 'ingredientSelectPopup',
      data: {
        onSelect: (ingredient: SelectIngredientListItemDto) => {
          setNewIngredient({
            ...newIngredient,
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.name,
          })
        },
      } as IngredientSelectPopupData,
    })
  }

  const handleAddIngredient = async () => {
    if (!newIngredient.ingredientId || !newIngredient.ingredientName.trim()) {
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '입력 오류',
          content: '재료를 선택해주세요.',
        },
      })
      return
    }

    try {
      const data: CreateRecipeIngredientReqDto = {
        recipeId,
        ingredientId: newIngredient.ingredientId,
        role: newIngredient.role,
        amount: newIngredient.amount ? parseFloat(newIngredient.amount) : undefined,
        unit: newIngredient.unit || undefined,
        note: newIngredient.note || undefined,
      }

      await createMutation.mutateAsync(data)
      await refetch()

      setNewIngredient({
        ingredientId: null,
        ingredientName: '',
        role: 'REQUIRED',
        amount: '',
        unit: '',
        note: '',
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('재료 추가 실패:', error)
    }
  }

  const handleUpdateIngredient = async (recipeIngredientId: number) => {
    try {
      const data: UpdateRecipeIngredientReqDto = {
        recipeIngredientId,
        role: editIngredient.role,
        amount: editIngredient.amount ? parseFloat(editIngredient.amount) : undefined,
        unit: editIngredient.unit || undefined,
        note: editIngredient.note || undefined,
      }

      await updateMutation.mutateAsync(data)
      await refetch()

      setEditingId(null)
    } catch (error) {
      console.error('재료 수정 실패:', error)
    }
  }

  const handleDeleteIngredient = async (recipeIngredientId: number) => {
    if (!confirm('정말 이 재료를 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteMutation.mutateAsync(recipeIngredientId)
      await refetch()
    } catch (error) {
      console.error('재료 삭제 실패:', error)
    }
  }

  const requiredIngredients = ingredients?.filter((ing) => ing.role === 'REQUIRED') || []
  const optionalIngredients = ingredients?.filter((ing) => ing.role === 'OPTIONAL') || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">레시피 재료</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
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
            재료 추가
          </button>
        )}
      </div>

      {/* 재료 추가 폼 */}
      {showAddForm && (
        <div 
          style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--spacing-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: 'var(--white)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleOpenIngredientSelect}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-button)',
                backgroundColor: 'var(--base-off-white)',
                color: 'var(--ink-primary)',
                fontSize: '14px',
                lineHeight: 1.6,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 180ms ease-out',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                e.currentTarget.style.borderColor = 'var(--brass)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--base-off-white)'
                e.currentTarget.style.borderColor = 'var(--border-default)'
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
            >
              {newIngredient.ingredientName || '재료 선택'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                역할
              </label>
              <select
                value={newIngredient.role}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, role: e.target.value as RecipeIngredientRole })
                }
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
              >
                <option value="REQUIRED">필수</option>
                <option value="OPTIONAL">선택</option>
              </select>
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
                양
              </label>
              <input
                type="text"
                value={newIngredient.amount}
                onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                placeholder="예: 120"
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
                단위
              </label>
              <input
                type="text"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                placeholder="예: g"
                maxLength={30}
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
                비고
              </label>
              <input
                type="text"
                value={newIngredient.note}
                onChange={(e) => setNewIngredient({ ...newIngredient, note: e.target.value })}
                placeholder="예: 얇게 썬 것"
                maxLength={255}
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddIngredient}
              disabled={createMutation.isPending}
              style={{
                padding: '12px 20px',
                backgroundColor: createMutation.isPending ? 'var(--ink-muted)' : 'var(--brass)',
                color: '#ffffff',
                borderRadius: 'var(--radius-button)',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: createMutation.isPending ? 0.6 : 1,
                transition: 'all 180ms ease-out'
              }}
              onMouseEnter={(e) => {
                if (!createMutation.isPending) {
                  e.currentTarget.style.backgroundColor = 'var(--brass-light)'
                }
              }}
              onMouseLeave={(e) => {
                if (!createMutation.isPending) {
                  e.currentTarget.style.backgroundColor = 'var(--brass)'
                }
              }}
              onFocus={(e) => {
                if (!createMutation.isPending) {
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none'
              }}
            >
              추가
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewIngredient({
                  ingredientId: null,
                  ingredientName: '',
                  role: 'REQUIRED',
                  amount: '',
                  unit: '',
                  note: '',
                })
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 필수 재료 목록 */}
      {requiredIngredients.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">필수 재료</h4>
          <div className="space-y-2">
            {requiredIngredients.map((ingredient) => (
              <IngredientItem
                key={ingredient.recipeIngredientId}
                ingredient={ingredient}
                editingId={editingId}
                editIngredient={editIngredient}
                setEditingId={setEditingId}
                setEditIngredient={setEditIngredient}
                onUpdate={handleUpdateIngredient}
                onDelete={handleDeleteIngredient}
                isUpdating={updateMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* 선택 재료 목록 */}
      {optionalIngredients.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">선택 재료</h4>
          <div className="space-y-2">
            {optionalIngredients.map((ingredient) => (
              <IngredientItem
                key={ingredient.recipeIngredientId}
                ingredient={ingredient}
                editingId={editingId}
                editIngredient={editIngredient}
                setEditingId={setEditingId}
                setEditIngredient={setEditIngredient}
                onUpdate={handleUpdateIngredient}
                onDelete={handleDeleteIngredient}
                isUpdating={updateMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {ingredients && ingredients.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          등록된 재료가 없습니다.
        </div>
      )}
    </div>
  )
}

interface IngredientItemProps {
  ingredient: SelectRecipeIngredientListItemDto
  editingId: number | null
  editIngredient: {
    role: RecipeIngredientRole
    amount: string
    unit: string
    note: string
  }
  setEditingId: (id: number | null) => void
  setEditIngredient: (data: {
    role: RecipeIngredientRole
    amount: string
    unit: string
    note: string
  }) => void
  onUpdate: (recipeIngredientId: number) => void
  onDelete: (recipeIngredientId: number) => void
  isUpdating: boolean
}

const IngredientItem = ({
  ingredient,
  editingId,
  editIngredient,
  setEditingId,
  setEditIngredient,
  onUpdate,
  onDelete,
  isUpdating,
}: IngredientItemProps) => {
  const isEditing = editingId === ingredient.recipeIngredientId

  if (isEditing) {
    return (
      <div 
        style={{
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--spacing-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: 'var(--white)'
        }}
      >
        <div 
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--ink-primary)',
            lineHeight: 1.6
          }}
        >
          {ingredient.ingredientName}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
              역할
            </label>
            <select
              value={editIngredient.role}
              onChange={(e) =>
                setEditIngredient({ ...editIngredient, role: e.target.value as RecipeIngredientRole })
              }
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
            >
              <option value="REQUIRED">필수</option>
              <option value="OPTIONAL">선택</option>
            </select>
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
              양
            </label>
            <input
              type="text"
              value={editIngredient.amount}
              onChange={(e) => setEditIngredient({ ...editIngredient, amount: e.target.value })}
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
              단위
            </label>
            <input
              type="text"
              value={editIngredient.unit}
              onChange={(e) => setEditIngredient({ ...editIngredient, unit: e.target.value })}
              maxLength={30}
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
              비고
            </label>
            <input
              type="text"
              value={editIngredient.note}
              onChange={(e) => setEditIngredient({ ...editIngredient, note: e.target.value })}
              maxLength={255}
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onUpdate(ingredient.recipeIngredientId)}
            disabled={isUpdating}
            style={{
              padding: '12px 20px',
              backgroundColor: isUpdating ? 'var(--ink-muted)' : 'var(--brass)',
              color: '#ffffff',
              borderRadius: 'var(--radius-button)',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.6 : 1,
              transition: 'all 180ms ease-out'
            }}
            onMouseEnter={(e) => {
              if (!isUpdating) {
                e.currentTarget.style.backgroundColor = 'var(--brass-light)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdating) {
                e.currentTarget.style.backgroundColor = 'var(--brass)'
              }
            }}
            onFocus={(e) => {
              if (!isUpdating) {
                e.currentTarget.style.outline = 'var(--focus-ring)'
                e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
          >
            저장
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-gray-100">{ingredient.ingredientName}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {ingredient.amount && `${ingredient.amount}${ingredient.unit ? ` ${ingredient.unit}` : ''}`}
          {ingredient.note && ` (${ingredient.note})`}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setEditingId(ingredient.recipeIngredientId)}
          className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(ingredient.recipeIngredientId)}
          className="px-3 py-1.5 text-sm bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-300 dark:hover:bg-red-800 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  )
}

export default CreateIngredientInfo


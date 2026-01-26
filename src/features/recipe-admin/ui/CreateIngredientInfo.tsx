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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            재료 추가
          </button>
        )}
      </div>

      {/* 재료 추가 폼 */}
      {showAddForm && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenIngredientSelect}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {newIngredient.ingredientName || '재료 선택'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                역할
              </label>
              <select
                value={newIngredient.role}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, role: e.target.value as RecipeIngredientRole })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="REQUIRED">필수</option>
                <option value="OPTIONAL">선택</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                양
              </label>
              <input
                type="text"
                value={newIngredient.amount}
                onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                placeholder="예: 120"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                단위
              </label>
              <input
                type="text"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                placeholder="예: g"
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비고
              </label>
              <input
                type="text"
                value={newIngredient.note}
                onChange={(e) => setNewIngredient({ ...newIngredient, note: e.target.value })}
                placeholder="예: 얇게 썬 것"
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddIngredient}
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <div className="font-medium text-gray-900 dark:text-gray-100">{ingredient.ingredientName}</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">역할</label>
            <select
              value={editIngredient.role}
              onChange={(e) =>
                setEditIngredient({ ...editIngredient, role: e.target.value as RecipeIngredientRole })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="REQUIRED">필수</option>
              <option value="OPTIONAL">선택</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">양</label>
            <input
              type="text"
              value={editIngredient.amount}
              onChange={(e) => setEditIngredient({ ...editIngredient, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">단위</label>
            <input
              type="text"
              value={editIngredient.unit}
              onChange={(e) => setEditIngredient({ ...editIngredient, unit: e.target.value })}
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비고</label>
            <input
              type="text"
              value={editIngredient.note}
              onChange={(e) => setEditIngredient({ ...editIngredient, note: e.target.value })}
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(ingredient.recipeIngredientId)}
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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


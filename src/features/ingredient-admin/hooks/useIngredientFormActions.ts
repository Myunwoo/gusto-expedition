import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePopupStore } from '@/shared/hooks/store/popupStore'
import { ingredientAdminApi } from '@/entities/ingredient_admin/api/ingredientAdminApi'
import type {
  CreateIngredientBasicReqDto,
  UpdateIngredientBasicReqDto,
  CreateIngredientI18nReqDto,
  UpdateIngredientI18nReqDto,
  CreateAliasReqDto,
  UpdateAliasAllReqDto,
} from '@/entities/ingredient_admin/model/types'
import type {
  CreateBaseInfoData,
  CreateI18nAliasInfoData,
  Step,
} from '../types'

interface UseIngredientFormActionsParams {
  isEditMode: boolean
  ingredientId: number | null
  setIngredientId: (id: number | null) => void
  baseInfoData: CreateBaseInfoData
  i18nAliasInfoData: CreateI18nAliasInfoData
  currentStep: Step
  setCurrentStep: (step: Step) => void
}

interface UseIngredientFormActionsReturn {
  isLoading: boolean
  handleBaseInfoSave: () => Promise<void>
  handleI18nAliasInfoSave: () => Promise<void>
  handleEdgeInfoComplete: () => void
  handleCancel: () => void
}

/**
 * 재료 폼 액션 관리 Hook
 * Step별 저장 로직 및 네비게이션 처리
 */
export const useIngredientFormActions = ({
  isEditMode,
  ingredientId,
  setIngredientId,
  baseInfoData,
  i18nAliasInfoData,
  currentStep,
  setCurrentStep,
}: UseIngredientFormActionsParams): UseIngredientFormActionsReturn => {
  const router = useRouter()
  const popupStore = usePopupStore()
  const [isLoading, setIsLoading] = useState(false)

  // 기본정보 저장
  const handleBaseInfoSave = async () => {
    if (!baseInfoData.name.trim()) {
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '입력 오류',
          content: '기본명을 입력해주세요.',
        },
      })
      return
    }

    setIsLoading(true)
    try {
      if (isEditMode && ingredientId) {
        // 수정 모드
        const data: UpdateIngredientBasicReqDto = {
          ingredientId,
          name: baseInfoData.name,
          thumbnailUrl: baseInfoData.thumbnailUrl || undefined,
          isActive: baseInfoData.isActive,
        }
        await ingredientAdminApi.updateIngredient(data)
      } else {
        // 등록 모드
        const data: CreateIngredientBasicReqDto = {
          name: baseInfoData.name,
          thumbnailUrl: baseInfoData.thumbnailUrl || undefined,
          isActive: baseInfoData.isActive,
        }
        const response = await ingredientAdminApi.createIngredient(data)
        setIngredientId(response.ingredientId)
      }
      setCurrentStep(2)
    } catch (error) {
      console.error('기본정보 저장 실패:', error)
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '저장 실패',
          content: '기본정보 저장에 실패했습니다.',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 다국어 + 별칭 저장
  const handleI18nAliasInfoSave = async () => {
    if (!ingredientId) {
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '오류',
          content: '재료 ID가 없습니다. 기본정보부터 다시 진행해주세요.',
        },
      })
      return
    }

    const hasValidLocale = Object.values(i18nAliasInfoData.locales).some(
      (locale) => locale.name.trim() !== ''
    )

    if (!hasValidLocale) {
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '입력 오류',
          content: '최소 한 언어의 이름을 입력해주세요.',
        },
      })
      return
    }

    setIsLoading(true)
    try {
      if (isEditMode) {
        await saveI18nDataUpdate(ingredientId, i18nAliasInfoData)
      } else {
        await saveI18nDataCreate(ingredientId, i18nAliasInfoData)
      }

      setCurrentStep(3)
    } catch (error) {
      console.error('다국어 정보 저장 실패:', error)
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '저장 실패',
          content: '다국어 정보 저장에 실패했습니다.',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 관계 정보 완료
  const handleEdgeInfoComplete = () => {
    if (!ingredientId) return
    router.push(`/admin/ingredient/detail?id=${ingredientId}`)
  }

  // 취소 확인
  const handleCancel = () => {
    popupStore.open({
      id: 'commonConfirmPopup',
      data: {
        title: '작업 취소',
        content: '작업을 중단하시겠습니까? 저장되지 않은 내용은 사라집니다.',
        buttonOneText: '계속 작성',
        buttonTwoText: '취소',
        onConfirm: () => {
          if (isEditMode && ingredientId) {
            router.push(`/admin/ingredient/detail?id=${ingredientId}`)
          } else {
            router.push('/admin/ingredient')
          }
        },
      },
    })
  }

  return {
    isLoading,
    handleBaseInfoSave,
    handleI18nAliasInfoSave,
    handleEdgeInfoComplete,
    handleCancel,
  }
}

/**
 * i18n 데이터 등록
 */
const saveI18nDataCreate = async (
  ingredientId: number,
  i18nAliasInfoData: CreateI18nAliasInfoData
) => {
  for (const [locale, data] of Object.entries(i18nAliasInfoData.locales)) {
    if (data.name.trim()) {
      const i18nData: CreateIngredientI18nReqDto = {
        ingredientId,
        locale,
        name: data.name,
        description: data.description || undefined,
      }
      await ingredientAdminApi.createIngredientI18n(i18nData)

      // Alias 생성
      if (data.aliases.length > 0) {
        const aliasData: CreateAliasReqDto = {
          ingredientId,
          locale,
          aliases: data.aliases.filter((a) => a.trim() !== ''),
        }
        if (aliasData.aliases.length > 0) {
          await ingredientAdminApi.createAlias(aliasData)
        }
      }
    }
  }
}

/**
 * i18n 데이터 수정
 */
const saveI18nDataUpdate = async (
  ingredientId: number,
  i18nAliasInfoData: CreateI18nAliasInfoData
) => {
  for (const [locale, data] of Object.entries(i18nAliasInfoData.locales)) {
    if (data.name.trim()) {
      const i18nData: UpdateIngredientI18nReqDto = {
        ingredientId,
        locale,
        name: data.name,
        description: data.description || undefined,
      }
      await ingredientAdminApi.updateIngredientI18n(i18nData)

      // Alias 일괄 수정
      const aliasData: UpdateAliasAllReqDto = {
        ingredientId,
        locale,
        aliases: data.aliases.filter((a) => a.trim() !== ''),
      }
      await ingredientAdminApi.updateAliasAll(aliasData)
    }
  }
}


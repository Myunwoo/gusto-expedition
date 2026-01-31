import { useRouter } from 'next/navigation'
import { usePopupStore } from '@/shared/hooks/store/popupStore'
import {
  useCreateIngredient,
  useUpdateIngredient,
  useUpdateIngredientI18n,
  useCreateAlias,
  useUpdateAliasAll,
} from '@/entities/ingredient_admin/api/ingredientAdminQueries'
import type {
  CreateIngredientBasicReqDto,
  UpdateIngredientBasicReqDto,
  UpdateIngredientI18nReqDto,
  CreateAliasReqDto,
  UpdateAliasAllReqDto,
  CreateIngredientI18nReqDto,
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
  originalAliases: Record<string, string[]> // locale별 원본 별칭 목록
  currentStep: Step
  setCurrentStep: (step: Step) => void
}

interface UseIngredientFormActionsReturn {
  isLoading: boolean
  handleBaseInfoSave: () => void
  handleI18nAliasInfoSave: () => void
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
  originalAliases,
  currentStep,
  setCurrentStep,
}: UseIngredientFormActionsParams): UseIngredientFormActionsReturn => {
  const router = useRouter()
  const popupStore = usePopupStore()

  // Mutations
  const createIngredientMutation = useCreateIngredient()
  const updateIngredientMutation = useUpdateIngredient()
  const updateI18nMutation = useUpdateIngredientI18n()
  const createAliasMutation = useCreateAlias()
  const updateAliasAllMutation = useUpdateAliasAll()

  const isLoading =
    createIngredientMutation.isPending ||
    updateIngredientMutation.isPending ||
    updateI18nMutation.isPending ||
    createAliasMutation.isPending ||
    updateAliasAllMutation.isPending

  // 기본정보 저장
  const handleBaseInfoSave = () => {
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

    if (isEditMode && ingredientId) {
      // 수정 모드
      const data: UpdateIngredientBasicReqDto = {
        ingredientId,
        name: baseInfoData.name,
        thumbnailUrl: baseInfoData.thumbnailUrl || undefined,
        isActive: baseInfoData.isActive,
      }
      updateIngredientMutation.mutate(data, {
        onSuccess: () => {
          setCurrentStep(2)
        },
      })
    } else {
      // 등록 모드
      const data: CreateIngredientBasicReqDto = {
        name: baseInfoData.name,
        thumbnailUrl: baseInfoData.thumbnailUrl || undefined,
        isActive: baseInfoData.isActive,
      }
      createIngredientMutation.mutate(data, {
        onSuccess: (response) => {
          setIngredientId(response.ingredientId)
          setCurrentStep(2)
        },
      })
    }
  }

  // 다국어 + 별칭 저장
  const handleI18nAliasInfoSave = () => {
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

    // 여러 locale에 대해 순차적으로 처리
    const processLocale = async (locale: string, data: typeof i18nAliasInfoData.locales[string]) => {
      if (!data.name.trim()) return

      if (isEditMode) {
        // 수정 모드
        const i18nData: UpdateIngredientI18nReqDto = {
          ingredientId,
          locale,
          name: data.name,
          description: data.description || undefined,
        }
        await updateI18nMutation.mutateAsync(i18nData)

        // 별칭 변경 감지: 원본과 현재 별칭 비교
        const currentAliases = data.aliases.filter((a) => a.trim() !== '').sort()
        const originalAliasList = (originalAliases[locale] || []).sort()

        // 별칭이 변경된 경우에만 API 호출
        const hasAliasChanged =
          currentAliases.length !== originalAliasList.length ||
          !currentAliases.every((alias, index) => alias === originalAliasList[index])

        if (hasAliasChanged) {
          const aliasData: UpdateAliasAllReqDto = {
            ingredientId,
            locale,
            aliases: currentAliases,
          }
          await updateAliasAllMutation.mutateAsync(aliasData)
        }
      } else {
        // 등록 모드
        const i18nData: CreateIngredientI18nReqDto = {
          ingredientId,
          locale,
          name: data.name,
          description: data.description || undefined,
        }
        await updateI18nMutation.mutateAsync(i18nData)

        if (data.aliases.length > 0) {
          const aliasData: CreateAliasReqDto = {
            ingredientId,
            locale,
            aliases: data.aliases.filter((a) => a.trim() !== ''),
          }
          if (aliasData.aliases.length > 0) {
            await createAliasMutation.mutateAsync(aliasData)
          }
        }
      }
    }

    // 모든 locale 처리
    Promise.all(
      Object.entries(i18nAliasInfoData.locales).map(([locale, data]) =>
        processLocale(locale, data)
      )
    )
      .then(() => {
        setCurrentStep(3)
      })
      .catch((error) => {
        console.error('다국어 정보 저장 실패:', error)
      })
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


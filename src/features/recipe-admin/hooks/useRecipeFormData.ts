import { useState, useEffect } from 'react'
import { useRecipeAdmin } from '@/entities/recipe_admin/api/recipeAdminQueries'
import type { SelectRecipeResDto } from '@/entities/recipe_admin/model/types'
import type {
  CreateBaseInfoData,
  CreateI18nAliasInfoData,
  CreateI18nAliasInfoLocaleData,
} from '../types'
import { DEFAULT_LOCALE } from '@/shared/config/locales'

interface UseRecipeFormDataParams {
  editId: number | null
  isEditMode: boolean
}

interface UseRecipeFormDataReturn {
  baseInfoData: CreateBaseInfoData
  i18nAliasInfoData: CreateI18nAliasInfoData
  setBaseInfoData: (data: CreateBaseInfoData) => void
  setI18nAliasInfoData: (data: CreateI18nAliasInfoData) => void
  isLoadingData: boolean
  originalAliases: Record<string, string[]> // locale별 원본 별칭 목록
}

/**
 * 레시피 폼 데이터 관리 Hook
 */
export const useRecipeFormData = ({
  editId,
  isEditMode,
}: UseRecipeFormDataParams): UseRecipeFormDataReturn => {
  // 수정 모드일 때 기존 데이터 로드
  const { data: existingData, isLoading: isLoadingData } = useRecipeAdmin(editId ?? 0)

  // Step별 데이터
  const [baseInfoData, setBaseInfoData] = useState<CreateBaseInfoData>({
    title: '',
  })

  const [i18nAliasInfoData, setI18nAliasInfoData] = useState<CreateI18nAliasInfoData>({
    locales: {
      [DEFAULT_LOCALE]: { description: '', instructions: '', aliases: [] },
    },
  })

  // 원본 별칭 데이터 저장
  const [originalAliases, setOriginalAliases] = useState<Record<string, string[]>>({})

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && existingData) {
      initializeFormData(
        existingData,
        setBaseInfoData,
        setI18nAliasInfoData,
        setOriginalAliases
      )
    }
  }, [isEditMode, existingData])

  return {
    baseInfoData,
    i18nAliasInfoData,
    setBaseInfoData,
    setI18nAliasInfoData,
    isLoadingData,
    originalAliases,
  }
}

/**
 * 기존 데이터로 폼 초기화
 */
const initializeFormData = (
  existingData: SelectRecipeResDto,
  setBaseInfoData: (data: CreateBaseInfoData) => void,
  setI18nAliasInfoData: (data: CreateI18nAliasInfoData) => void,
  setOriginalAliases: (aliases: Record<string, string[]>) => void
) => {
  // 기본정보 데이터 초기화
  setBaseInfoData({
    title: existingData.title || '',
  })

  // 다국어 + 별칭 데이터 초기화
  const locales: Record<string, CreateI18nAliasInfoLocaleData> = {}
  const originalAliasesMap: Record<string, string[]> = {}

  Object.entries(existingData.localeInfo || {}).forEach(([locale, info]) => {
    const aliases = existingData.aliases[locale]?.map((a) => a.alias) || []
    locales[locale] = {
      description: info.description || '',
      instructions: info.instructions || '',
      aliases: [...aliases],
    }
    originalAliasesMap[locale] = [...aliases] // 원본 별칭 저장
  })

  setI18nAliasInfoData({ locales })
  setOriginalAliases(originalAliasesMap) // 원본 별칭 저장
}


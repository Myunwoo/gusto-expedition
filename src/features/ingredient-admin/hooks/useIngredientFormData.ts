import { useState, useEffect } from 'react'
import { useIngredientAdmin } from '@/entities/ingredient_admin/api/ingredientAdminQueries'
import type { SelectIngredientResDto } from '@/entities/ingredient_admin/model/types'
import type {
  CreateBaseInfoData,
  CreateI18nAliasInfoData,
  CreateI18nAliasInfoLocaleData,
  CreateEdgeInfoData,
} from '../types'

interface UseIngredientFormDataParams {
  editId: number | null
  isEditMode: boolean
}

interface UseIngredientFormDataReturn {
  baseInfoData: CreateBaseInfoData
  i18nAliasInfoData: CreateI18nAliasInfoData
  edgeInfoData: CreateEdgeInfoData
  setBaseInfoData: (data: CreateBaseInfoData) => void
  setI18nAliasInfoData: (data: CreateI18nAliasInfoData) => void
  setEdgeInfoData: (data: CreateEdgeInfoData) => void
  isLoadingData: boolean
}

/**
 * 재료 폼 데이터 관리 Hook
 */
export const useIngredientFormData = ({
  editId,
  isEditMode,
}: UseIngredientFormDataParams): UseIngredientFormDataReturn => {
  // 수정 모드일 때 기존 데이터 로드
  const { data: existingData, isLoading: isLoadingData } = useIngredientAdmin(editId ?? 0)

  // Step별 데이터
  const [baseInfoData, setBaseInfoData] = useState<CreateBaseInfoData>({
    name: '',
    thumbnailUrl: '',
    isActive: true,
  })

  const [i18nAliasInfoData, setI18nAliasInfoData] = useState<CreateI18nAliasInfoData>({
    locales: {
      'ko-KR': { name: '', description: '', aliases: [] },
    },
  })

  const [edgeInfoData, setEdgeInfoData] = useState<CreateEdgeInfoData>({
    relations: [],
  })

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && existingData) {
      initializeFormData(existingData, setBaseInfoData, setI18nAliasInfoData, setEdgeInfoData)
    }
  }, [isEditMode, existingData])

  return {
    baseInfoData,
    i18nAliasInfoData,
    edgeInfoData,
    setBaseInfoData,
    setI18nAliasInfoData,
    setEdgeInfoData,
    isLoadingData,
  }
}

/**
 * 기존 데이터로 폼 초기화
 */
const initializeFormData = (
  existingData: SelectIngredientResDto,
  setBaseInfoData: (data: CreateBaseInfoData) => void,
  setI18nAliasInfoData: (data: CreateI18nAliasInfoData) => void,
  setEdgeInfoData: (data: CreateEdgeInfoData) => void
) => {
  // 기본정보 데이터 초기화
  const firstLocale = Object.keys(existingData.localeInfo)[0]
  setBaseInfoData({
    name: existingData.localeInfo[firstLocale]?.name || '',
    thumbnailUrl: existingData.thumbnailUrl || '',
    isActive: existingData.isActive,
  })

  // 다국어 + 별칭 데이터 초기화
  const locales: Record<string, CreateI18nAliasInfoLocaleData> = {}
  Object.entries(existingData.localeInfo).forEach(([locale, info]) => {
    locales[locale] = {
      name: info.name,
      description: info.description || '',
      aliases: existingData.aliases[locale]?.map((a) => a.alias) || [],
    }
  })
  setI18nAliasInfoData({ locales })

  // 관계 데이터 초기화
  if (existingData.relatedIngredients) {
    setEdgeInfoData({
      relations: existingData.relatedIngredients.map((rel) => ({
        toIngredientId: rel.ingredientId,
        toIngredientName: rel.name,
        relationType: rel.relationType,
        score: rel.score,
        reasonSummary: rel.reasonSummary || '',
      })),
    })
  }
}


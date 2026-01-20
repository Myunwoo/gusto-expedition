import type {
  IngredientRelationType,
} from '@/entities/ingredient_admin/model/types'

export type Step = 1 | 2 | 3

// 기본 정보 입력
export interface CreateBaseInfoData {
  name: string
  thumbnailUrl: string
  isActive: boolean
}

// Step 2 데이터 (언어별)
export interface CreateI18nAliasInfoLocaleData {
  name: string
  description: string
  aliases: string[]
}

export interface CreateI18nAliasInfoData {
  locales: Record<string, CreateI18nAliasInfoLocaleData>
}

// Step 3 데이터
export interface CreateEdgeInfoRelation {
  toIngredientId: number
  toIngredientName: string
  relationType: IngredientRelationType
  score: number
  reasonSummary: string
}

export interface CreateEdgeInfoData {
  relations: CreateEdgeInfoRelation[]
}
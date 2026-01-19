/**
 * Ingredient Admin Entity 타입 정의
 */

// 재료 조회 응답 DTO
export interface SelectIngredientResDto {
  ingredientId: number;
  localeInfo: Record<string, IngredientLocaleInfoDto>;
  thumbnailUrl: string;
  isActive: boolean;
  aliases: Record<string, IngredientAliasDto[]>;
  relatedIngredients: RelatedIngredientDto[];
  createdAt: string;
  updatedAt: string;
}

// 재료의 locale별 정보
export interface IngredientLocaleInfoDto {
  name: string;
  description: string;
}

// 재료 별칭 정보
export interface IngredientAliasDto {
  aliasId: number;
  alias: string;
}

// 관련 재료 정보
export interface RelatedIngredientDto {
  ingredientId: number;
  name: string;
  relationType: string;
  score: number;
  confidence: number;
  reasonSummary: string;
}

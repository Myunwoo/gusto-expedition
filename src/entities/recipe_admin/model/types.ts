/**
 * Recipe Admin Entity 타입 정의
 */

// 레시피 목록 항목
export interface SelectRecipeListItemDto {
  recipeId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}


// 레시피 생성 요청
export interface CreateRecipeReqDto {
  title: string;
  source?: string;
}

// 레시피 생성 응답
export interface CreateRecipeResDto {
  recipeId: number;
  title: string;
  source?: string;
  createdAt: string;
}

// 레시피 수정 요청
export interface UpdateRecipeReqDto {
  recipeId: number;
  title: string;
  source?: string;
}

// 레시피 수정 응답
export interface UpdateRecipeResDto {
  recipeId: number;
  title: string;
  source?: string;
  updatedAt: string;
}

// 레시피 삭제 응답
export interface DeleteRecipeResDto {
  recipeId: number;
  message: string;
}

// 레시피 Locale별 정보
export interface RecipeLocaleInfoDto {
  description?: string;
  instructions?: string;
}

// 레시피 별칭 정보
export interface RecipeAliasDto {
  aliasId: number;
  alias: string;
}

// 레시피 Locale별 정보 수정 요청
export interface UpdateRecipeI18nReqDto {
  recipeId: number;
  locale: string;
  description?: string;
  instructions?: string;
}

// 레시피 Locale별 정보 수정 응답
export interface UpdateRecipeI18nResDto {
  recipeId: number;
  locale: string;
  description?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

// 레시피 별칭 생성 요청
export interface CreateAliasReqDto {
  recipeId: number;
  locale: string;
  aliases: string[];
}

// 레시피 별칭 생성 응답
export interface CreateAliasResDto {
  recipeId: number;
  locale: string;
  aliases: string[];
  createdAt: string;
}

// 레시피 별칭 일괄 수정 요청
export interface UpdateAliasAllReqDto {
  recipeId: number;
  locale: string;
  aliases: string[];
}

// 레시피 별칭 일괄 수정 응답
export interface UpdateAliasAllResDto {
  recipeId: number;
  locale: string;
  aliases: string[];
  createdAt: string;
}

// 레시피 조회 응답 (SelectRecipeResDto 업데이트)
export interface SelectRecipeResDto {
  recipeId: number;
  title: string;
  source?: string;
  localeInfo: Record<string, RecipeLocaleInfoDto>;
  aliases: Record<string, RecipeAliasDto[]>;
  requiredIngredientIds: number[];
  optionalIngredientIds: number[];
  createdAt: string;
  updatedAt: string;
}

// 레시피 재료 역할
export type RecipeIngredientRole = 'REQUIRED' | 'OPTIONAL';

// 레시피 재료 목록 항목
export interface SelectRecipeIngredientListItemDto {
  recipeIngredientId: number;
  ingredientId: number;
  ingredientName: string;
  role: RecipeIngredientRole;
  amount?: number;
  unit?: string;
  note?: string;
}

// 레시피 재료 추가 요청
export interface CreateRecipeIngredientReqDto {
  recipeId: number;
  ingredientId: number;
  role?: RecipeIngredientRole;
  amount?: number;
  unit?: string;
  note?: string;
}

// 레시피 재료 추가 응답
export interface CreateRecipeIngredientResDto {
  recipeIngredientId: number;
  recipeId: number;
  ingredientId: number;
  role: RecipeIngredientRole;
  amount?: number;
  unit?: string;
  note?: string;
  createdAt: string;
}

// 레시피 재료 수정 요청
export interface UpdateRecipeIngredientReqDto {
  recipeIngredientId: number;
  role?: RecipeIngredientRole;
  amount?: number;
  unit?: string;
  note?: string;
}

// 레시피 재료 수정 응답
export interface UpdateRecipeIngredientResDto {
  recipeIngredientId: number;
  recipeId: number;
  ingredientId: number;
  role: RecipeIngredientRole;
  amount?: number;
  unit?: string;
  note?: string;
}

// 레시피 재료 삭제 응답
export interface DeleteRecipeIngredientResDto {
  recipeIngredientId: number;
  message: string;
}


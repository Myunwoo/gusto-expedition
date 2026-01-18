/**
 * Recipe Entity 타입 정의
 */

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  requiredIngredientIds: number[];
  optionalIngredientIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  required: boolean;
  amount?: string;
  unit?: string;
}

export interface RecipeRecommendRequest {
  ingredientIds: number[];
}

export interface RecipeRecommendResponse {
  recipes: RecommendedRecipe[];
}

export interface RecommendedRecipe extends Recipe {
  missingIngredientIds: number[];
  missingIngredientNames: string[];
  matchRate: number;
  priorityScore: number;
}


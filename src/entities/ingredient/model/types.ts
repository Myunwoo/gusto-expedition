/**
 * Ingredient Entity 타입 정의
 */

export interface Ingredient {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientI18n {
  id: number;
  ingredientId: number;
  locale: string;
  name: string;
  description?: string;
}

export interface IngredientCollection {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientCollectionItem {
  id: number;
  collectionId: number;
  ingredientId: number;
  order: number;
  ingredient?: Ingredient;
}

export interface CreateCollectionRequest {
  name: string;
}

export type CreateCollectionResponse = IngredientCollection

export interface UpdateCollectionRequest {
  name: string;
}

export interface AddCollectionItemRequest {
  ingredientId: number;
}

export interface UpdateCollectionItemOrderRequest {
  itemId: number;
  order: number;
}


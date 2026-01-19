/**
 * Ingredient Admin Entity 타입 정의
 */

// ========== Enum Types ==========
export type IngredientRelationType = 'PAIR_WELL' | 'AVOID' | 'NEUTRAL';
export type EdgeEvidenceType = 'NOTE' | 'BOOK' | 'VIDEO' | 'EXPERIMENT' | 'RECIPE_REFERENCE' | 'LINK';

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
  relationType: IngredientRelationType;
  score: number;
  confidence: number;
  reasonSummary: string;
}

// 증거 정보
export interface EvidenceDto {
  evidenceId: number;
  evidenceType: EdgeEvidenceType;
  title: string;
  content: string;
  sourceRef: string;
  createdAt: string;
}

// 재료 기본정보 생성 요청
export interface CreateIngredientBasicReqDto {
  name: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}

// 재료 기본정보 생성 응답
export interface CreateIngredientBasicResDto {
  ingredientId: number;
  name: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: string;
}

// 재료 기본정보 수정 요청
export interface UpdateIngredientBasicReqDto {
  ingredientId: number;
  name: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}

// 재료 기본정보 수정 응답
export interface UpdateIngredientBasicResDto {
  ingredientId: number;
  name: string;
  thumbnailUrl: string;
  isActive: boolean;
  updatedAt: string;
}

// 재료 삭제 응답
export interface DeleteIngredientResDto {
  ingredientId: number;
  message: string;
}

// 재료 locale별 기본정보 생성 요청
export interface CreateIngredientI18nReqDto {
  ingredientId: number;
  locale: string;
  name: string;
  description?: string;
}

// 재료 locale별 기본정보 생성 응답
export interface CreateIngredientI18nResDto {
  ingredientId: number;
  locale: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 재료 locale별 기본정보 수정 요청
export interface UpdateIngredientI18nReqDto {
  ingredientId: number;
  locale: string;
  name: string;
  description?: string;
}

// 재료 locale별 기본정보 수정 응답
export interface UpdateIngredientI18nResDto {
  ingredientId: number;
  locale: string;
  name: string;
  description: string;
  updatedAt: string;
}

// 재료 locale별 정보 삭제 응답
export interface DeleteIngredientI18nResDto {
  ingredientId: number;
  locale: string;
  message: string;
}

// 재료 별칭 생성 요청
export interface CreateAliasReqDto {
  ingredientId: number;
  locale: string;
  aliases: string[];
}

// 재료 별칭 생성 응답
export interface CreateAliasResDto {
  ingredientId: number;
  locale: string;
  aliases: string[];
  createdAt: string;
}

// 재료 별칭 일괄 수정 요청
export interface UpdateAliasAllReqDto {
  ingredientId: number;
  locale: string;
  aliases: string[];
}

// 재료 별칭 일괄 수정 응답
export interface UpdateAliasAllResDto {
  ingredientId: number;
  locale: string;
  aliases: string[];
  createdAt: string;
}

// 재료 별칭 개별 수정 요청
export interface UpdateAliasReqDto {
  aliasId: number;
  alias: string;
}

// 재료 별칭 개별 수정 응답
export interface UpdateAliasResDto {
  aliasId: number;
  ingredientId: number;
  locale: string;
  alias: string;
  createdAt: string;
}

// 재료 별칭 일괄 삭제 응답
export interface DeleteAliasAllResDto {
  ingredientId: number;
  locale: string;
  message: string;
}

// 재료 별칭 개별 삭제 응답
export interface DeleteAliasResDto {
  aliasId: number;
  ingredientId: number;
  locale: string;
  alias: string;
  message: string;
}

// 재료 조회 응답 DTO
export interface SelectIngredientResDto {
  ingredientId: number;
  localeInfo: Record<string, IngredientLocaleInfoDto>;
  thumbnailUrl: string;
  isActive: boolean;
  aliases: Record<string, IngredientAliasDto[]>;
  relatedIngredients?: RelatedIngredientDto[];
  createdAt: string;
  updatedAt: string;
}

// 재료 간 관계 생성 요청
export interface CreateEdgeReqDto {
  fromIngredientId: number;
  toIngredientId: number;
  relationType: IngredientRelationType;
  score: number;
  confidence?: number;
  reasonSummary?: string;
}

// 재료 간 관계 생성 응답
export interface CreateEdgeResDto {
  edgeId: number;
  fromIngredientId: number;
  toIngredientId: number;
  relationType: IngredientRelationType;
  score: number;
  confidence: number;
  reasonSummary: string;
  createdAt: string;
}

// 재료 간 관계 조회 응답
export interface SelectEdgeResDto {
  edgeId: number;
  fromIngredientId: number;
  toIngredientId: number;
  relationType: IngredientRelationType;
  score: number;
  confidence: number;
  reasonSummary: string;
  evidences: EvidenceDto[];
  createdAt: string;
  updatedAt: string;
}

// 재료 간 관계 수정 요청
export interface UpdateEdgeReqDto {
  edgeId: number;
  relationType: IngredientRelationType;
  score: number;
  confidence?: number;
  reasonSummary?: string;
}

// 재료 간 관계 수정 응답
export interface UpdateEdgeResDto {
  edgeId: number;
  fromIngredientId: number;
  toIngredientId: number;
  relationType: IngredientRelationType;
  score: number;
  confidence: number;
  reasonSummary: string;
  updatedAt: string;
}

// 재료 간 관계 삭제 응답
export interface DeleteEdgeResDto {
  edgeId: number;
  message: string;
}

// 재료 간 관계 증거 생성 요청
export interface CreateEvidenceReqDto {
  edgeId: number;
  evidenceType: EdgeEvidenceType;
  title?: string;
  content?: string;
  sourceRef?: string;
}

// 재료 간 관계 증거 생성 응답
export interface CreateEvidenceResDto {
  evidenceId: number;
  edgeId: number;
  evidenceType: EdgeEvidenceType;
  title: string;
  content: string;
  sourceRef: string;
  createdAt: string;
}

// 재료 간 관계 증거 수정 요청
export interface UpdateEvidenceReqDto {
  evidenceId: number;
  evidenceType: EdgeEvidenceType;
  title?: string;
  content?: string;
  sourceRef?: string;
}

// 재료 간 관계 증거 수정 응답
export interface UpdateEvidenceResDto {
  evidenceId: number;
  edgeId: number;
  evidenceType: EdgeEvidenceType;
  title: string;
  content: string;
  sourceRef: string;
  createdAt: string;
}

// 재료 간 관계 증거 삭제 응답
export interface DeleteEvidenceResDto {
  evidenceId: number;
  message: string;
}

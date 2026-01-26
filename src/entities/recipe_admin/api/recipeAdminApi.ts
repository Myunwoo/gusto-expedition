import { apiClient } from '@/shared/lib/api/client';
import type {
  SelectRecipeResDto,
  SelectRecipeListItemDto,
  CreateRecipeReqDto,
  CreateRecipeResDto,
  UpdateRecipeReqDto,
  UpdateRecipeResDto,
  DeleteRecipeResDto,
  UpdateRecipeI18nReqDto,
  UpdateRecipeI18nResDto,
  CreateAliasReqDto,
  CreateAliasResDto,
  UpdateAliasAllReqDto,
  UpdateAliasAllResDto,
} from '../model/types';

/**
 * Recipe Admin Entity API
 */

export const recipeAdminApi = {
  /**
   * 레시피 목록 조회
   */
  selectAll: (): Promise<SelectRecipeListItemDto[]> => {
    return apiClient.get('/admin/recipe/selectAll');
  },

  /**
   * 레시피 조회
   */
  selectRecipe: (id: number): Promise<SelectRecipeResDto> => {
    return apiClient.get(`/admin/recipe/selectRecipeById?recipeId=${id}`);
  },

  /**
   * 레시피 생성
   */
  createRecipe: (data: CreateRecipeReqDto): Promise<CreateRecipeResDto> => {
    return apiClient.post('/admin/recipe/createRecipe', data);
  },

  /**
   * 레시피 수정
   */
  updateRecipe: (data: UpdateRecipeReqDto): Promise<UpdateRecipeResDto> => {
    return apiClient.post('/admin/recipe/updateRecipe', data);
  },

  /**
   * 레시피 삭제
   */
  deleteRecipe: (id: number): Promise<DeleteRecipeResDto> => {
    return apiClient.post(`/admin/recipe/deleteRecipe?recipeId=${id}`);
  },

  /**
   * 레시피 Locale별 정보 수정
   */
  updateRecipeI18n: (data: UpdateRecipeI18nReqDto): Promise<UpdateRecipeI18nResDto> => {
    return apiClient.post('/admin/recipe/updateRecipeI18n', data);
  },

  /**
   * 레시피 별칭 생성
   */
  createAlias: (data: CreateAliasReqDto): Promise<CreateAliasResDto> => {
    return apiClient.post('/admin/recipe/createAlias', data);
  },

  /**
   * 레시피 별칭 일괄 수정
   */
  updateAliasAll: (data: UpdateAliasAllReqDto): Promise<UpdateAliasAllResDto> => {
    return apiClient.post('/admin/recipe/updateAliasAll', data);
  },
};


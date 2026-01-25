import { apiClient } from '@/shared/lib/api/client';
import type {
  CreateIngredientBasicReqDto,
  CreateIngredientBasicResDto,
  CreateAliasReqDto,
  CreateAliasResDto,
  SelectIngredientResDto,
  SelectIngredientListItemDto,
  UpdateIngredientBasicReqDto,
  UpdateIngredientBasicResDto,
  UpdateIngredientI18nReqDto,
  UpdateIngredientI18nResDto,
  UpdateAliasAllReqDto,
  UpdateAliasAllResDto,
  UpdateAliasReqDto,
  UpdateAliasResDto,
  DeleteIngredientResDto,
  DeleteIngredientI18nResDto,
  DeleteAliasAllResDto,
  DeleteAliasResDto,
  CreateEdgeReqDto,
  CreateEdgeResDto,
  SelectEdgeResDto,
  UpdateEdgeReqDto,
  UpdateEdgeResDto,
  DeleteEdgeResDto,
  CreateEvidenceReqDto,
  CreateEvidenceResDto,
  UpdateEvidenceReqDto,
  UpdateEvidenceResDto,
  DeleteEvidenceResDto,
} from '../model/types';

/**
 * Ingredient Admin Entity API
 */

export const ingredientAdminApi = {
  /**
   * 재료 기본정보 생성
   */
  createIngredient: (data: CreateIngredientBasicReqDto): Promise<CreateIngredientBasicResDto> => {
    return apiClient.post('/admin/ingredient/createIngredient', data);
  },

  /**
   * 재료 조회
   */
  selectIngredient: (
    id: number,
    locale?: string,
    includeRelationYn?: boolean
  ): Promise<SelectIngredientResDto> => {
    const params = new URLSearchParams({ id: id.toString() });
    if (locale) params.append('locale', locale);
    if (includeRelationYn !== undefined) params.append('includeRelationYn', includeRelationYn.toString());
    return apiClient.get(`/admin/ingredient/selectById?${params.toString()}`);
  },

  /**
   * 재료 목록 조회
   */
  selectAll: (): Promise<SelectIngredientListItemDto[]> => {
    return apiClient.get('/admin/ingredient/selectAll');
  },

  /**
   * 재료 기본정보 수정
   */
  updateIngredient: (data: UpdateIngredientBasicReqDto): Promise<UpdateIngredientBasicResDto> => {
    return apiClient.post('/admin/ingredient/updateIngredient', data);
  },

  /**
   * 재료 삭제
   */
  deleteIngredient: (id: number): Promise<DeleteIngredientResDto> => {
    return apiClient.post(`/admin/ingredient/deleteIngredient?id=${id}`);
  },

  /**
   * 재료 locale별 기본정보 저장 (upsert: 없으면 생성, 있으면 수정)
   */
  updateIngredientI18n: (data: UpdateIngredientI18nReqDto): Promise<UpdateIngredientI18nResDto> => {
    return apiClient.post('/admin/ingredient/updateIngredientI18n', data);
  },

  /**
   * 재료 locale별 정보 삭제
   */
  deleteIngredientI18n: (id: number, locale: string): Promise<DeleteIngredientI18nResDto> => {
    return apiClient.post(`/admin/ingredient/deleteIngredientI18n?id=${id}&locale=${locale}`);
  },

  /**
   * 재료 별칭 생성
   */
  createAlias: (data: CreateAliasReqDto): Promise<CreateAliasResDto> => {
    return apiClient.post('/admin/ingredient/createAlias', data);
  },

  /**
   * 재료 별칭 일괄 수정
   */
  updateAliasAll: (data: UpdateAliasAllReqDto): Promise<UpdateAliasAllResDto> => {
    return apiClient.post('/admin/ingredient/updateAliasAll', data);
  },

  /**
   * 재료 별칭 개별 수정
   */
  updateAlias: (data: UpdateAliasReqDto): Promise<UpdateAliasResDto> => {
    return apiClient.post('/admin/ingredient/updateAlias', data);
  },

  /**
   * 재료 별칭 일괄 삭제
   */
  deleteAliasAll: (id: number, locale: string): Promise<DeleteAliasAllResDto> => {
    return apiClient.post(`/admin/ingredient/deleteAliasAll?id=${id}&locale=${locale}`);
  },

  /**
   * 재료 별칭 개별 삭제
   */
  deleteAlias: (aliasId: number): Promise<DeleteAliasResDto> => {
    return apiClient.post(`/admin/ingredient/deleteAlias?aliasId=${aliasId}`);
  },

  /**
   * 재료 간 관계 생성
   */
  createEdge: (data: CreateEdgeReqDto): Promise<CreateEdgeResDto> => {
    return apiClient.post('/admin/ingredient/createEdge', data);
  },

  /**
   * 재료 간 관계 조회
   */
  selectEdgeById: (edgeId: number): Promise<SelectEdgeResDto> => {
    return apiClient.get(`/admin/ingredient/selectEdgeById?edgeId=${edgeId}`);
  },

  /**
   * 재료 간 관계 수정
   */
  updateEdge: (data: UpdateEdgeReqDto): Promise<UpdateEdgeResDto> => {
    return apiClient.post('/admin/ingredient/updateEdge', data);
  },

  /**
   * 재료 간 관계 삭제
   */
  deleteEdge: (edgeId: number): Promise<DeleteEdgeResDto> => {
    return apiClient.post(`/admin/ingredient/deleteEdge?edgeId=${edgeId}`);
  },

  /**
   * 재료 간 관계 증거 생성
   */
  createEvidence: (data: CreateEvidenceReqDto): Promise<CreateEvidenceResDto> => {
    return apiClient.post('/admin/ingredient/createEvidence', data);
  },

  /**
   * 재료 간 관계 증거 수정
   */
  updateEvidence: (data: UpdateEvidenceReqDto): Promise<UpdateEvidenceResDto> => {
    return apiClient.post('/admin/ingredient/updateEvidence', data);
  },

  /**
   * 재료 간 관계 증거 삭제
   */
  deleteEvidence: (evidenceId: number): Promise<DeleteEvidenceResDto> => {
    return apiClient.post(`/admin/ingredient/deleteEvidence?evidenceId=${evidenceId}`);
  },
};
import { apiClient } from '@/shared/lib/api/client';
import type { 
    SelectIngredientResDto
} from '../model/types';

/**
 * Ingredient Admin Entity API
 */

export const ingredientAdminApi = {
  /**
   * 재료 조회
   */
  selectIngredient: (id: number, locale?: string): Promise<SelectIngredientResDto> => {
    return apiClient.get(`/admin/ingredient/selectById?id=${id}${locale ? `&local=${locale}` : ''}`);
  },
};
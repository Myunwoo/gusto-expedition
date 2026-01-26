/**
 * Recipe Admin Query Keys
 */

export const recipeAdminKeys = {
  all: ['recipeAdmin'] as const,
  lists: () => [...recipeAdminKeys.all, 'list'] as const,
  list: (filters: string) => [...recipeAdminKeys.lists(), { filters }] as const,
  details: () => [...recipeAdminKeys.all, 'detail'] as const,
  detail: (id: number) => [...recipeAdminKeys.details(), id] as const,
};


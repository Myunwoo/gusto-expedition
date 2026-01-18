/**
 * Query Key Factory
 * 예시:
 * const userKeys = createQueryKeyFactory('user');
 * userKeys.all() // ['user']
 * userKeys.detail(1) // ['user', 'detail', 1]
 * userKeys.lists() // ['user', 'list']
 */

export type QueryKeyFactory<T extends string> = {
  /**
   * 모든 쿼리 키의 루트
   * 예: ['user']
   */
  all: () => readonly [T];

  /**
   * 특정 ID의 상세 조회 키
   * 예: ['user', 'detail', 1]
   */
  detail: (id: number | string) => readonly [T, 'detail', number | string];

  /**
   * 목록 조회 키
   * 예: ['user', 'list']
   */
  lists: () => readonly [T, 'list'];

  /**
   * 필터가 있는 목록 조회 키
   * 예: ['user', 'list', { role: 'ADMIN' }]
   */
  list: (filters?: Record<string, unknown>) => readonly [T, 'list', ...unknown[]];
};

/**
 * Query Key Factory 생성
 * @param rootKey 루트 키 (예: 'user', 'recipe', 'ingredient')
 */
export const createQueryKeyFactory = <T extends string>(
  rootKey: T
): QueryKeyFactory<T> => {
  return {
    all: () => [rootKey] as const,
    detail: (id: number | string) => [rootKey, 'detail', id] as const,
    lists: () => [rootKey, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters
        ? ([rootKey, 'list', filters] as const)
        : ([rootKey, 'list'] as const),
  };
};


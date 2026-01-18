import { cookies } from 'next/headers';
import { createTokenStorage } from '../auth/token-storage';
import { ApiClient } from './client';

/**
 * 서버 사이드 API 클라이언트
 */
export const createServerApiClient = async () => {
  const cookieStore = await cookies();
  
  // 읽기 전용 토큰 저장소 생성
  const tokenStorage = createTokenStorage(() => ({
    get: (name: string) => cookieStore.get(name),
    set: () => {},
    delete: () => {},
  }));

  return new ApiClient(undefined, tokenStorage);
};

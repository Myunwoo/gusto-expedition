const ACCESS_TOKEN_KEY = 'GEAT';
const REFRESH_TOKEN_KEY = 'GERT';

export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}

/**
 * 서버 사이드 토큰 저장소 - Next.js의 cookies 사용
 * 
 */
export class ServerTokenStorage implements TokenStorage {
  private cookies: () => {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: { httpOnly?: boolean; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none'; maxAge?: number }) => void;
    delete: (name: string) => void;
  };

  constructor(cookies: () => {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: { httpOnly?: boolean; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none'; maxAge?: number }) => void;
    delete: (name: string) => void;
  }) {
    this.cookies = cookies;
  }

  async getAccessToken(): Promise<string | null> {
    const cookieStore = this.cookies();
    return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
  }

  async getRefreshToken(): Promise<string | null> {
    const cookieStore = this.cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value ?? null;
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    const cookieStore = this.cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const, // CSRF 보호
      maxAge: 60 * 60 * 24 * 7, // 7일 (Refresh Token과 동일)
      path: '/', // 모든 경로에서 접근 가능
    };
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, cookieOptions);
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, cookieOptions);
  }

  async clearTokens(): Promise<void> {
    const cookieStore = this.cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
  }
}

export const createTokenStorage = (
  cookies: () => {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: { httpOnly?: boolean; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none'; maxAge?: number; path?: string }) => void;
    delete: (name: string) => void;
  }
): TokenStorage => {
  if (typeof window !== 'undefined') {
    throw new Error('TokenStorage Server Side Only');
  }
  return new ServerTokenStorage(cookies);
};

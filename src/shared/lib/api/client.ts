import type { TokenStorage } from '../auth/token-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export class ApiClient {
  private baseURL: string;
  private tokenStorage: TokenStorage | null = null;

  constructor(baseURL: string = API_BASE_URL, tokenStorage?: TokenStorage) {
    this.baseURL = baseURL;
    this.tokenStorage = tokenStorage || null;
  }

  /**
   * 토큰 저장소 설정
   */
  setTokenStorage(tokenStorage: TokenStorage): void {
    if (typeof window !== 'undefined') {
      console.warn('클라이언트 사이드에서는 TokenStorage를 설정불가');
      return;
    }
    this.tokenStorage = tokenStorage;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.tokenStorage && typeof window === 'undefined') {
      const accessToken = await this.tokenStorage.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers: headers as HeadersInit,
      credentials: 'include',
    };

    const response = await fetch(url, fetchOptions);

    // 401 에러 - API Route를 통해 토큰 갱신 시도
    if (response.status === 401 && retryCount === 0) {
      try {

        // CSR: 상대 URL 사용 가능
        // SSR: 같은 서버이므로 상대 URL도 작동하지만, 명확성을 위해 절대 URL 사용
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // httpOnly 쿠키 자동 전송
        });

        if (refreshResponse.ok) {
          return this.request<T>(endpoint, options, retryCount + 1);
        }
      } catch (error) {
        // 토큰 갱신 실패
        console.error('Token refresh failed:', error);
      }
      // 갱신 실패 시 에러 발생
      throw new ApiError(401, 'AUTH001', '인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, error.errorCode || 'UNKNOWN', error.message || 'Request failed');
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();

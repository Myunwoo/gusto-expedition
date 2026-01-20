'use client';

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { redirectToLogin } from '@/shared/lib/auth/auth-redirect';

/**
 * 401 에러 체크 및 리다이렉트
 */
const checkAndRedirect401 = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
    redirectToLogin()
    return true
  }
  return false
}

/**
 * 401 에러 처리 (retry 로직용)
 * Proview까지 401에러가 전파되었다는 것은 apiclient에서 갱신이 실패했음을 의미
 * 로그인 페이지 리다이렉트 필요
 */
const handle401Error = (error: unknown, failureCount: number) => {
  if (checkAndRedirect401(error)) {
    return false // 재시도하지 않음
  }
  return failureCount < 3
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => handle401Error(error, failureCount),
          },
          mutations: {
            retry: (failureCount, error) => handle401Error(error, failureCount),
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => {
            checkAndRedirect401(error)
          },
        }),
        queryCache: new QueryCache({
          onError: (error) => {
            checkAndRedirect401(error)
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};


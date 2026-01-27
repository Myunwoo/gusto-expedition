'use client';

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { redirectToLogin } from '@/shared/lib/auth/auth-redirect';
import { usePopupStore } from '@/shared/hooks/store/popupStore';
import type { ApiError } from '@/shared/lib/api/client';
import { ThemeProvider } from './ThemeProvider';

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
 * ApiError인지 확인
 */
const isApiError = (error: unknown): error is ApiError => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    'errorCode' in error &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  )
}

/**
 * 에러 메시지 추출
 */
const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return '오류가 발생했습니다. 다시 시도해주세요.'
}

/**
 * 전역 에러 처리 (401 제외)
 */
const handleGlobalError = (error: unknown) => {
  // 401 에러는 리다이렉트 처리하므로 제외
  if (checkAndRedirect401(error)) {
    return
  }

  const message = getErrorMessage(error)
  usePopupStore.getState().open({
    id: 'commonAlertPopup',
    data: {
      content: message,
      buttonText: '확인',
    },
  })
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
            // 401 에러는 리다이렉트, 그 외는 팝업 표시
            handleGlobalError(error)
          },
        }),
        queryCache: new QueryCache({
          onError: (error) => {
            // 401 에러는 리다이렉트, 그 외는 팝업 표시
            handleGlobalError(error)
          },
        }),
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
};


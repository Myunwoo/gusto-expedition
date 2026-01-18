'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // 401 에러 - 로그인 페이지 리다이렉트
              if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
                if (typeof window !== 'undefined' && failureCount === 0) {
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 0);
                }
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
                if (typeof window !== 'undefined' && failureCount === 0) {
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 0);
                }
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};


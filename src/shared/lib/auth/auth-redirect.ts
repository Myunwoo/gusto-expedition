import { ROUTES } from '@/shared/config/constants'

/**
 * 로그인 페이지로 리다이렉트
 */
export const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 동작하지 않음
    return
  }

  const currentPath = window.location.pathname
  // 이미 로그인 페이지가 아니면 리다이렉트
  if (currentPath !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN
  }
}


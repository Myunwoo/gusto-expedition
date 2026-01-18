'use client';

/**
 * 로그인 폼 컴포넌트
 * 
 * TODO: JWT 토큰 관리
 * - 로그인 성공 시 Access Token, Refresh Token 저장
 * - 저장 위치: localStorage 또는 httpOnly cookie (보안 고려)
 */

export const LoginForm = () => {
  // TODO: TanStack Query mutation으로 로그인 처리
  // TODO: 로그인 성공 시 토큰 저장 및 홈으로 리다이렉트

  return (
    <form>
      <div>
        <label htmlFor="email">이메일</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div>
        <label htmlFor="password">비밀번호</label>
        <input type="password" id="password" name="password" required />
      </div>
      <button type="submit">로그인</button>
    </form>
  );
};


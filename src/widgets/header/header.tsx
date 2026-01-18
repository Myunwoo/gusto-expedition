'use client';

/**
 * 헤더 위젯
 */

export const Header = () => {
  // TODO: 로그인 상태 확인 (JWT 토큰 존재 여부)
  // TODO: 로그아웃 기능

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">구스토 원정대</h1>
        <nav>
          {/* TODO: 로그인/로그아웃 버튼 표시 */}
        </nav>
      </div>
    </header>
  );
};


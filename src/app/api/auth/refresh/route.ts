import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 서버 사이드 API Route에서 백엔드로 직접 연결
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 토큰 갱신 API Route
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('GERT')?.value;

  if (!refreshToken) {
    const errorResponse = NextResponse.json(
      { error: 'Refresh token not found' },
      { status: 401 }
    );
    errorResponse.cookies.delete('GEAT');
    errorResponse.cookies.delete('GERT');
    return errorResponse;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorResponse = NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
      errorResponse.cookies.delete('GEAT');
      errorResponse.cookies.delete('GERT');
      return errorResponse;
    }

    const data = await response.json();

    // 프로토콜 확인: 프록시 뒤에서 실행되는 경우 X-Forwarded-Proto 헤더 확인
    const protocol = request.headers.get('x-forwarded-proto') ||
      (request.url.startsWith('https') ? 'https' : 'http');
    const isSecure = protocol === 'https';

    // Response 객체 생성
    const nextResponse = NextResponse.json({ success: true });

    // 명시적으로 쿠키 설정
    nextResponse.cookies.set('GEAT', data.accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 10, // 10분 (Access Token 만료 시간)
      path: '/',
    });

    nextResponse.cookies.set('GERT', data.refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일 (Refresh Token 만료 시간)
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Token refresh error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    errorResponse.cookies.delete('GEAT');
    errorResponse.cookies.delete('GERT');
    return errorResponse;
  }
}


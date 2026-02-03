import { NextResponse } from 'next/server';

// 서버 사이드 API Route에서 백엔드로 직접 연결
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 로그인 API Route
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      return NextResponse.json(
        { error: error.message || '로그인에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 프로토콜 확인: 프록시 뒤에서 실행되는 경우 X-Forwarded-Proto 헤더 확인
    const protocol = request.headers.get('x-forwarded-proto') ||
      (request.url.startsWith('https') ? 'https' : 'http');
    const isSecure = protocol === 'https';

    // Response 객체 생성
    const nextResponse = NextResponse.json({
      success: true,
      userNum: data.userNum
    });

    // 명시적으로 쿠키 설정 (Response 객체의 cookies 사용)
    nextResponse.cookies.set('GEAT', data.accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    });

    nextResponse.cookies.set('GERT', data.refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // 디버깅: 쿠키 설정 확인
    console.log('[Login] 쿠키 설정:', {
      protocol,
      isSecure,
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
    });

    const setCookieHeaders = nextResponse.headers.getSetCookie();
    console.log('[Login] Set-Cookie 헤더:', setCookieHeaders);

    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


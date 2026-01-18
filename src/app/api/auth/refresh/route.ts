import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 토큰 갱신 API Route
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('GERT')?.value;

  if (!refreshToken) {
    cookieStore.delete('GEAT');
    cookieStore.delete('GERT');
    return NextResponse.json(
      { error: 'Refresh token not found' },
      { status: 401 }
    );
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
      cookieStore.delete('GEAT');
      cookieStore.delete('GERT');
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
    }

    const data = await response.json();
    cookieStore.set('GEAT', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10분 (Access Token 만료 시간)
      path: '/',
    });

    cookieStore.set('GERT', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일 (Refresh Token 만료 시간)
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    cookieStore.delete('GEAT');
    cookieStore.delete('GERT');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


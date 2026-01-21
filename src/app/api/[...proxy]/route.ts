import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleRequest(request, { proxy });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleRequest(request, { proxy });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleRequest(request, { proxy });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleRequest(request, { proxy });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleRequest(request, { proxy });
}

async function handleRequest(
  request: NextRequest,
  { proxy }: { proxy: string[] },
  retried = false
) {
  // 프록시 경로 구성
  const path = proxy.join('/');
  const url = new URL(request.url);
  const backendUrl = `${API_BASE_URL}/${path}${url.search}`;

  // 클라이언트 쿠키 추출
  const cookieStore = await cookies();
  const clientCookies: string[] = [];

  // GEAT, GERT 쿠키를 백엔드로 전달
  const geat = cookieStore.get('GEAT')?.value;
  const gert = cookieStore.get('GERT')?.value;

  if (geat) {
    clientCookies.push(`GEAT=${geat}`);
  }
  if (gert) {
    clientCookies.push(`GERT=${gert}`);
  }

  // 요청 본문 처리
  let body: string | undefined;
  try {
    body = await request.text();
  } catch {
    // 본문이 없는 경우 (GET 등)
  }

  // 백엔드로 요청 전송
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Authorization 헤더: GEAT 쿠키가 있으면 Bearer 토큰으로 전달
  if (geat) {
    headers['Authorization'] = `Bearer ${geat}`;
  }

  // Cookie 헤더: 백엔드가 쿠키를 직접 읽을 수 있도록 전달
  if (clientCookies.length > 0) {
    headers['Cookie'] = clientCookies.join('; ');
  }

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: body || undefined,
  });

  // 401 에러 발생 시 토큰 갱신 시도
  if (response.status === 401 && !retried && gert) {
    try {
      // 백엔드 토큰 갱신 API 직접 호출
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: gert }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();

        // 새 토큰을 httpOnly 쿠키에 저장
        cookieStore.set('GEAT', refreshData.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 10, // 10분
          path: '/',
        });

        if (refreshData.refreshToken) {
          cookieStore.set('GERT', refreshData.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7일
            path: '/',
          });
        }

        // 새 토큰으로 원래 요청 재시도
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshData.accessToken}`,
        };

        const retryCookies: string[] = [`GEAT=${refreshData.accessToken}`];
        if (refreshData.refreshToken) {
          retryCookies.push(`GERT=${refreshData.refreshToken}`);
        }
        retryHeaders['Cookie'] = retryCookies.join('; ');

        const retryResponse = await fetch(backendUrl, {
          method: request.method,
          headers: retryHeaders,
          body: body || undefined,
        });

        return createResponse(retryResponse);
      } else {
        // 갱신 실패 시 쿠키 삭제
        cookieStore.delete('GEAT');
        cookieStore.delete('GERT');
      }
    } catch (error) {
      console.error('Token refresh failed in proxy:', error);
      // 갱신 실패 시 쿠키 삭제
      cookieStore.delete('GEAT');
      cookieStore.delete('GERT');
    }
  }

  return createResponse(response);
}

async function createResponse(
  backendResponse: Response
): Promise<NextResponse> {
  const data = await backendResponse.json().catch(() => ({}));

  const nextResponse = NextResponse.json(data, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });

  return nextResponse;
}


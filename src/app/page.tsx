import { createServerApiClient } from '@/shared/lib/api/server-api-client';
import type { UserMeResponse } from '@/entities/user';

const HomePage = async () => {
  // 서버 사이드 API 클라이언트 생성
  const apiClient = await createServerApiClient();
  
  // 서버사이드 api 호출 예시
  let user: UserMeResponse | null = null;
  try {
    user = await apiClient.get<UserMeResponse>('/user/me');
  } catch {
  }

  return (
    <main className="min-h-dvh p-8">
      <h1 className="text-2xl font-bold">구스토 원정대</h1>
      <p className="mt-2 text-sm opacity-80">
        재료를 탐험해서 조합을 발견하는 서비스
      </p>

      {user && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm">
            안녕하세요, <strong>{user.nickname}</strong>님
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <a className="underline" href="/explore">탐험 시작</a>
        <a className="underline" href="/admin">어드민</a>
      </div>
    </main>
  );
};

export default HomePage;

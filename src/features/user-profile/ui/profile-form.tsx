'use client';

import { useState, useEffect } from 'react';
import { useUserMe, useUserUpdateMe, useUserDeleteMe } from '@/entities/user/api/userQueries';

export const ProfileForm = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  // 본인 정보 조회 (staleTime: 5분, refetchOnWindowFocus: false, retry: 1회)
  const { data: user, isLoading } = useUserMe();

  // 본인 정보 수정 Mutation (retry: false)
  const updateMeMutation = useUserUpdateMe();

  // 회원탈퇴 Mutation (retry: false)
  const deleteMeMutation = useUserDeleteMe();

  // 초기값 설정
  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: { nickname?: string; password?: string } = {};
    if (nickname !== user?.nickname) {
      updateData.nickname = nickname;
    }
    if (password) {
      updateData.password = password;
    }

    if (Object.keys(updateData).length > 0) {
      await updateMeMutation.mutateAsync(updateData);
      setPassword(''); // 비밀번호 필드 초기화
    }
  };

  const handleDelete = async () => {
    if (confirm('정말 탈퇴하시겠습니까?')) {
      await deleteMeMutation.mutateAsync();
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <div>사용자 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nickname">닉네임</label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">비밀번호 변경</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="변경할 비밀번호 입력"
        />
      </div>
      <button type="submit" disabled={updateMeMutation.isPending}>
        {updateMeMutation.isPending ? '수정 중...' : '수정'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteMeMutation.isPending}
      >
        {deleteMeMutation.isPending ? '탈퇴 중...' : '회원탈퇴'}
      </button>
    </form>
  );
};


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';
import type { LoginRequest } from '@/features/auth/model/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      // Next.js API Route를 통해 로그인 (서버에서 httpOnly 쿠키에 저장)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '로그인에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 어드민 메인 페이지로 리다이렉트
      router.push('/admin');
    },
    onError: (error: unknown) => {
      setError((error as Error).message || '로그인에 실패했습니다.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <div 
      className="min-h-dvh flex items-center justify-center"
      style={{ backgroundColor: 'var(--base-off-white)' }}
    >
      <div className="w-full max-w-md">
        <div 
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--spacing-card)',
            boxShadow: '0 1px 2px var(--shadow-soft)'
          }}
        >
          <h1 
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: 'var(--ink-primary)',
              marginBottom: '32px',
              textAlign: 'center',
              letterSpacing: '-0.01em',
              lineHeight: 1.4
            }}
          >
            로그인
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink-secondary)',
                  marginBottom: '6px',
                  lineHeight: 1.6
                }}
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-button)',
                  backgroundColor: 'var(--white)',
                  color: 'var(--ink-primary)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  outline: 'none',
                  transition: 'all 180ms ease-out'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brass)'
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.outline = 'none'
                }}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink-secondary)',
                  marginBottom: '6px',
                  lineHeight: 1.6
                }}
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-button)',
                  backgroundColor: 'var(--white)',
                  color: 'var(--ink-primary)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  outline: 'none',
                  transition: 'all 180ms ease-out'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brass)'
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.outline = 'none'
                }}
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <div 
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(180, 87, 58, 0.1)',
                  border: '1px solid var(--terracotta)',
                  borderRadius: 'var(--radius-button)'
                }}
              >
                <p style={{ fontSize: '13px', color: 'var(--terracotta)', lineHeight: 1.6 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: loginMutation.isPending ? 'var(--ink-muted)' : 'var(--brass)',
                color: '#ffffff',
                borderRadius: 'var(--radius-button)',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: loginMutation.isPending ? 0.6 : 1,
                transition: 'all 180ms ease-out'
              }}
              onMouseEnter={(e) => {
                if (!loginMutation.isPending) {
                  e.currentTarget.style.backgroundColor = 'var(--brass-light)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loginMutation.isPending) {
                  e.currentTarget.style.backgroundColor = 'var(--brass)'
                }
              }}
              onFocus={(e) => {
                if (!loginMutation.isPending) {
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none'
              }}
            >
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div 
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--ink-muted)',
              lineHeight: 1.6
            }}
          >
            <p>테스트용 임시 로그인 페이지입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


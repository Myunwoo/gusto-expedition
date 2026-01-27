'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '../ThemeProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { path: '/admin/ingredient', label: '재료 관리' },
    { path: '/admin/recipe', label: '레시피 관리' },
  ]

  return (
    <div 
      style={{
        display: 'flex',
        minHeight: '100dvh',
        backgroundColor: 'var(--base-off-white)'
      }}
    >
      {/* 사이드바 */}
      <aside
        style={{
          width: isCollapsed ? '64px' : '240px',
          backgroundColor: 'var(--white)',
          borderRight: '1px solid var(--border-default)',
          padding: 'var(--spacing-section) 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transition: 'width 200ms ease-out',
          position: 'relative'
        }}
      >
        {/* 토글 버튼 */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            top: '16px',
            right: isCollapsed ? '8px' : '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-button)',
            cursor: 'pointer',
            transition: 'all 180ms ease-out',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
            e.currentTarget.style.borderColor = 'var(--brass)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = 'var(--focus-ring)'
            e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none'
          }}
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          <span style={{ fontSize: '18px', color: 'var(--ink-secondary)' }}>
            {isCollapsed ? '→' : '←'}
          </span>
        </button>

        {/* 로고/헤더 영역 */}
        {!isCollapsed && (
          <div
            style={{
              padding: '0 24px 24px 24px',
              borderBottom: '1px solid var(--divider-default)',
              marginBottom: '16px'
            }}
          >
            <Link
              href="/admin"
              style={{
                display: 'block',
                fontSize: '20px',
                fontWeight: 500,
                color: 'var(--ink-primary)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                lineHeight: 1.4
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--brass)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--ink-primary)'
              }}
            >
              어드민
            </Link>
          </div>
        )}

        {/* 네비게이션 링크 (상단 정렬) */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                title={isCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  backgroundColor: isActive ? 'rgba(176, 141, 87, 0.06)' : 'transparent',
                  borderRadius: 'var(--radius-button)',
                  textDecoration: 'none',
                  transition: 'all 180ms ease-out',
                  borderLeft: isActive ? '3px solid var(--brass)' : '3px solid transparent',
                  borderTop: '1px solid transparent',
                  borderRight: '1px solid transparent',
                  borderBottom: '1px solid transparent',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
                    e.currentTarget.style.color = 'var(--ink-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--ink-secondary)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                {isCollapsed ? (
                  <span style={{ fontSize: '18px' }}>📋</span>
                ) : (
                  item.label
                )}
              </Link>
            )
          })}
        </nav>

        {/* 다크 모드 토글 버튼 (하단 정렬) */}
        <div style={{ padding: '0 16px', marginTop: 'auto', marginBottom: '16px' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--ink-secondary)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-button)',
              cursor: 'pointer',
              transition: 'all 180ms ease-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.05)'
              e.currentTarget.style.borderColor = 'var(--brass)'
              e.currentTarget.style.color = 'var(--ink-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.color = 'var(--ink-secondary)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {!isCollapsed && (
              <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
            )}
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main
        style={{
          flex: 1,
          overflow: 'auto'
        }}
      >
        {children}
      </main>
    </div>
  )
}

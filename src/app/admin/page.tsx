'use client'

import { useRouter } from 'next/navigation'

const AdminPage = () => {
  const router = useRouter()

  return (
    <div
      style={{ 
        backgroundColor: 'var(--base-off-white)',
        padding: 'var(--spacing-section) 24px',
        minHeight: '100%'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: 'var(--ink-primary)',
            marginBottom: '8px',
            letterSpacing: '-0.01em',
            lineHeight: 1.4
          }}
        >
          어드민
        </h1>
        <p 
          style={{
            marginBottom: '48px',
            fontSize: '14px',
            color: 'var(--ink-muted)',
            lineHeight: 1.6
          }}
        >
          재료/조합 데이터 입력 · 수정 · 삭제 UI가 들어갈 자리
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <button
            onClick={() => router.push('/admin/ingredient')}
            style={{
              padding: 'var(--spacing-card)',
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 1px 2px var(--shadow-soft)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 180ms ease-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.03)'
              e.currentTarget.style.borderColor = 'var(--brass)'
              e.currentTarget.style.boxShadow = '0 2px 4px var(--shadow-soft)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--white)'
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.boxShadow = '0 1px 2px var(--shadow-soft)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
          >
            <h2 
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'var(--ink-primary)',
                marginBottom: '8px',
                letterSpacing: '-0.01em',
                lineHeight: 1.4
              }}
            >
              재료 관리
            </h2>
            <p 
              style={{
                fontSize: '13px',
                color: 'var(--ink-muted)',
                lineHeight: 1.6
              }}
            >
              재료 목록 조회 및 관리
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/recipe')}
            style={{
              padding: 'var(--spacing-card)',
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 1px 2px var(--shadow-soft)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 180ms ease-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.03)'
              e.currentTarget.style.borderColor = 'var(--brass)'
              e.currentTarget.style.boxShadow = '0 2px 4px var(--shadow-soft)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--white)'
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.boxShadow = '0 1px 2px var(--shadow-soft)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
          >
            <h2 
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'var(--ink-primary)',
                marginBottom: '8px',
                letterSpacing: '-0.01em',
                lineHeight: 1.4
              }}
            >
              레시피 관리
            </h2>
            <p 
              style={{
                fontSize: '13px',
                color: 'var(--ink-muted)',
                lineHeight: 1.6
              }}
            >
              레시피 목록 조회 및 관리
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPage

import { CreateBaseInfoData } from "../types"
import type { CreateIngredientBasicReqDto, UpdateIngredientBasicReqDto } from "@/entities/ingredient_admin/model/types"

interface CreateBaseInfoProps {
  data: CreateBaseInfoData
  onChange: (data: CreateBaseInfoData) => void
  isEditMode: boolean
  ingredientId: number | null
  onSave: (data: CreateIngredientBasicReqDto | UpdateIngredientBasicReqDto) => Promise<void>
  isLoading: boolean
}

// Step 1: 기본정보
const CreateBaseInfo = ({
  data,
  onChange,
  isEditMode,
  ingredientId,
  onSave,
  isLoading,
}: CreateBaseInfoProps) => {
  const handleSave = async () => {
    if (!data.name.trim()) {
      return
    }

    if (isEditMode && ingredientId) {
      const updateData: UpdateIngredientBasicReqDto = {
        ingredientId,
        name: data.name,
        thumbnailUrl: data.thumbnailUrl || undefined,
        isActive: data.isActive,
      }
      await onSave(updateData)
    } else {
      const createData: CreateIngredientBasicReqDto = {
        name: data.name,
        thumbnailUrl: data.thumbnailUrl || undefined,
        isActive: data.isActive,
      }
      await onSave(createData)
    }
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--ink-primary)',
          marginBottom: '0',
          letterSpacing: '-0.01em',
          lineHeight: 1.4
        }}
      >
        기본정보
      </h2>

      <div>
        <label 
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--ink-secondary)',
            marginBottom: '6px',
            lineHeight: 1.6
          }}
        >
          기본명 <span style={{ color: 'var(--terracotta)' }}>*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="재료 이름을 입력하세요"
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
        />
      </div>

      <div>
        <label 
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--ink-secondary)',
            marginBottom: '6px',
            lineHeight: 1.6
          }}
        >
          썸네일 URL
        </label>
        <input
          type="url"
          value={data.thumbnailUrl}
          onChange={(e) => onChange({ ...data, thumbnailUrl: e.target.value })}
          placeholder="https://..."
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
        />
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.isActive}
            onChange={(e) => onChange({ ...data, isActive: e.target.checked })}
            style={{
              width: '18px',
              height: '18px',
              accentColor: 'var(--brass)',
              cursor: 'pointer',
              marginRight: '8px'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = '2px'
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
          />
          <span 
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--ink-secondary)',
              lineHeight: 1.6
            }}
          >
            활성화
          </span>
        </label>
      </div>

      <div 
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid var(--divider-default)'
        }}
      >
        <button
          onClick={handleSave}
          disabled={isLoading || !data.name.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: (isLoading || !data.name.trim()) ? 'var(--ink-muted)' : 'var(--brass)',
            color: '#ffffff',
            borderRadius: 'var(--radius-button)',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: (isLoading || !data.name.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !data.name.trim()) ? 0.6 : 1,
            transition: 'all 180ms ease-out'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && data.name.trim()) {
              e.currentTarget.style.backgroundColor = 'var(--brass-light)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && data.name.trim()) {
              e.currentTarget.style.backgroundColor = 'var(--brass)'
            }
          }}
          onFocus={(e) => {
            if (!isLoading && data.name.trim()) {
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none'
          }}
        >
          {isLoading ? '저장 중...' : isEditMode ? '수정' : '등록'}
        </button>
      </div>
    </div>
  )
}

export default CreateBaseInfo
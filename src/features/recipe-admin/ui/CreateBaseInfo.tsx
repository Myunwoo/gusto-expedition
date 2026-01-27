import { CreateBaseInfoData } from "../types"
import type { CreateRecipeReqDto, UpdateRecipeReqDto } from "@/entities/recipe_admin/model/types"

interface CreateBaseInfoProps {
  data: CreateBaseInfoData
  onChange: (data: CreateBaseInfoData) => void
  isEditMode: boolean
  recipeId: number | null
  onSave: (data: CreateRecipeReqDto | UpdateRecipeReqDto) => Promise<void>
  isLoading: boolean
}

// Step 1: 기본정보
const CreateBaseInfo = ({
  data,
  onChange,
  isEditMode,
  recipeId,
  onSave,
  isLoading,
}: CreateBaseInfoProps) => {
  const handleSave = async () => {
    if (!data.title.trim()) {
      return
    }

    if (isEditMode && recipeId) {
      const updateData: UpdateRecipeReqDto = {
        recipeId,
        title: data.title,
        source: data.source || undefined,
      }
      await onSave(updateData)
    } else {
      const createData: CreateRecipeReqDto = {
        title: data.title,
        source: data.source || undefined,
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
          레시피 제목 <span style={{ color: 'var(--terracotta)' }}>*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="레시피 제목을 입력하세요"
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
          출처
        </label>
        <input
          type="text"
          value={data.source}
          onChange={(e) => onChange({ ...data, source: e.target.value })}
          placeholder="레시피 출처를 입력하세요 (예: https://example.com/recipe)"
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
          disabled={isLoading || !data.title.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: (isLoading || !data.title.trim()) ? 'var(--ink-muted)' : 'var(--brass)',
            color: '#ffffff',
            borderRadius: 'var(--radius-button)',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: (isLoading || !data.title.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !data.title.trim()) ? 0.6 : 1,
            transition: 'all 180ms ease-out'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && data.title.trim()) {
              e.currentTarget.style.backgroundColor = 'var(--brass-light)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && data.title.trim()) {
              e.currentTarget.style.backgroundColor = 'var(--brass)'
            }
          }}
          onFocus={(e) => {
            if (!isLoading && data.title.trim()) {
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


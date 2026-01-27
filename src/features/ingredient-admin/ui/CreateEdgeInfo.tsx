import { useState } from "react"
import { CreateEdgeInfoData } from "../types"
import { CreateEdgeReqDto, IngredientRelationType } from "@/entities/ingredient_admin/model/types"
import { ingredientAdminApi } from '@/entities/ingredient_admin/api/ingredientAdminApi'
import { usePopupStore } from '@/shared/hooks/store/popupStore'

// Step 3: 관계 조작
const CreateEdgeInfo = ({
  ingredientId,
  data,
  onChange,
}: {
  ingredientId: number
  data: CreateEdgeInfoData
  onChange: (data: CreateEdgeInfoData) => void
}) => {
  const popupStore = usePopupStore()
  const [showAddRelation, setShowAddRelation] = useState(false)
  const [newRelation, setNewRelation] = useState({
    toIngredientId: null as number | null,
    toIngredientName: '',
    relationType: 'PAIR_WELL' as IngredientRelationType,
    score: 5,
    reasonSummary: '',
  })

  const handleOpenIngredientSelect = () => {
    popupStore.open({
      id: 'ingredientSelectPopup',
      data: {
        onSelect: (ingredient) => {
          setNewRelation({
            ...newRelation,
            toIngredientId: ingredient.ingredientId,
            toIngredientName: ingredient.name,
          })
        },
      },
    })
  }

  const handleAddRelation = async () => {
    // 수정 모드에서만 호출되므로 ingredientId는 항상 존재함
    if (!newRelation.toIngredientId || !newRelation.toIngredientName.trim()) {
      return
    }

    // PAIR_WELL 또는 AVOID일 때는 점수 필수
    if (
      (newRelation.relationType === 'PAIR_WELL' || newRelation.relationType === 'AVOID') &&
      (!newRelation.score || newRelation.score < 1 || newRelation.score > 10)
    ) {
      popupStore.open({
        id: 'commonAlertPopup',
        data: {
          title: '입력 오류',
          content: '궁합/비궁합 관계는 점수(1-10)를 입력해주세요.',
        },
      })
      return
    }

    try {
      const edgeData: CreateEdgeReqDto = {
        fromIngredientId: ingredientId,
        toIngredientId: newRelation.toIngredientId,
        relationType: newRelation.relationType,
        score: newRelation.relationType === 'NEUTRAL' ? undefined : newRelation.score,
        reasonSummary: newRelation.reasonSummary || undefined,
      }

      await ingredientAdminApi.createEdge(edgeData)

      onChange({
        relations: [
          ...data.relations,
          {
            toIngredientId: newRelation.toIngredientId,
            toIngredientName: newRelation.toIngredientName,
            relationType: newRelation.relationType,
            score: newRelation.score,
            reasonSummary: newRelation.reasonSummary,
          },
        ],
      })

      setNewRelation({
        toIngredientId: null,
        toIngredientName: '',
        relationType: 'PAIR_WELL',
        score: 5,
        reasonSummary: '',
      })
      setShowAddRelation(false)
    } catch (error) {
      console.error('관계 추가 실패:', error)
    }
  }

  const relationTypes: { value: IngredientRelationType; label: string }[] = [
    { value: 'PAIR_WELL', label: '궁합' },
    { value: 'AVOID', label: '비궁합' },
    { value: 'NEUTRAL', label: '중립' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.4
          }}
        >
          관계 조작
        </h2>
        <button
          onClick={() => setShowAddRelation(!showAddRelation)}
          style={{
            padding: '12px 20px',
            backgroundColor: showAddRelation ? 'var(--ink-muted)' : 'var(--brass)',
            color: '#ffffff',
            borderRadius: 'var(--radius-button)',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 180ms ease-out'
          }}
          onMouseEnter={(e) => {
            if (!showAddRelation) {
              e.currentTarget.style.backgroundColor = 'var(--brass-light)'
            }
          }}
          onMouseLeave={(e) => {
            if (!showAddRelation) {
              e.currentTarget.style.backgroundColor = 'var(--brass)'
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
          {showAddRelation ? '취소' : '관계 추가'}
        </button>
      </div>

      {/* 관계 추가 폼 */}
      {showAddRelation && (
        <div 
          style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--spacing-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: 'var(--white)'
          }}
        >
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
              대상 재료 (to)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newRelation.toIngredientName}
                readOnly
                placeholder="재료를 선택하세요"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-button)',
                  backgroundColor: 'var(--base-off-white)',
                  color: 'var(--ink-primary)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  cursor: 'pointer',
                  outline: 'none'
                }}
                onClick={handleOpenIngredientSelect}
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
              <button
                type="button"
                onClick={handleOpenIngredientSelect}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--brass)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-button)',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 180ms ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brass-light)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brass)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'var(--focus-ring)'
                  e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                선택
              </button>
            </div>
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
              관계 타입
            </label>
            <select
              value={newRelation.relationType}
              onChange={(e) =>
                setNewRelation({
                  ...newRelation,
                  relationType: e.target.value as IngredientRelationType,
                })
              }
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
            >
              {relationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 점수 입력 필드: NEUTRAL이 아닐 때만 표시 */}
          {newRelation.relationType !== 'NEUTRAL' && (
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
                점수 (1-10) <span style={{ color: 'var(--terracotta)' }}>*</span>
              </label>
              <input
                type="text"
                value={newRelation.score || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  if (value === '') {
                    setNewRelation({
                      ...newRelation,
                      score: 0,
                    })
                  } else {
                    const numValue = parseInt(value, 10)
                    if (numValue >= 1 && numValue <= 10) {
                      setNewRelation({
                        ...newRelation,
                        score: numValue,
                      })
                    }
                  }
                }}
                placeholder="1-10 사이의 숫자를 입력하세요"
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
          )}

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
              근거 메모
            </label>
            <textarea
              value={newRelation.reasonSummary}
              onChange={(e) =>
                setNewRelation({ ...newRelation, reasonSummary: e.target.value })
              }
              placeholder="관계의 근거를 입력하세요"
              rows={4}
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
                resize: 'vertical',
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

          <button
            onClick={handleAddRelation}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: 'var(--brass)',
              color: '#ffffff',
              borderRadius: 'var(--radius-button)',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 180ms ease-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brass-light)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brass)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'var(--focus-ring)'
              e.currentTarget.style.outlineOffset = 'var(--focus-ring-offset)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
          >
            관계 추가
          </button>
        </div>
      )}

      {/* 관계 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.relations.length === 0 ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--ink-muted)',
              fontSize: '13px',
              lineHeight: 1.6
            }}
          >
            등록된 관계가 없습니다.
          </div>
        ) : (
          data.relations.map((relation, index) => (
            <div
              key={index}
              style={{
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-button)',
                padding: '16px',
                backgroundColor: 'var(--white)'
              }}
            >
              <div>
                <p 
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'var(--ink-primary)',
                    lineHeight: 1.6,
                    marginBottom: '6px'
                  }}
                >
                  {relation.toIngredientName}
                </p>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'var(--ink-muted)',
                    lineHeight: 1.6
                  }}
                >
                  타입: {relation.relationType === 'PAIR_WELL' ? '궁합' : relation.relationType === 'AVOID' ? '비궁합' : '중립'} | 점수: {relation.score}
                </p>
                {relation.reasonSummary && (
                  <p 
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink-muted)',
                      marginTop: '6px',
                      lineHeight: 1.6
                    }}
                  >
                    {relation.reasonSummary}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CreateEdgeInfo
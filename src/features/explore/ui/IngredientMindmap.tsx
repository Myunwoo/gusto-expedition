'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAllIngredientNames,
  getTree,
  type TreeNode,
} from '../data/demoGraph'

// EXPEDITION 1.1 + 2.4: 산개 유지, min/max 반경 완만한 매핑
const MIN_RADIUS = 200
const MAX_RADIUS = 360
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}
function radiusByWeight(weight: number): number {
  return MIN_RADIUS + (1 - easeOutCubic(weight)) * (MAX_RADIUS - MIN_RADIUS)
}

// depth별 시각 토큰 (EXPEDITION 5.1)
const DEPTH_STYLE = {
  1: { opacity: 1, scale: 1, lineWidth: 1.8 },
  2: { opacity: 0.75, scale: 0.98, lineWidth: 1.2 },
  3: { opacity: 0.45, scale: 0.95, lineWidth: 0.9 },
} as const

const DEFAULT_CENTER = '토마토'
const ALL_NAMES = getAllIngredientNames()

function seedFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0
  return Math.abs(h) / 2147483647
}

interface PlacedNode extends TreeNode {
  x: number
  y: number
  angle: number
}

function useTreeLayout(center: string, stageW: number, stageH: number): { centerXY: { x: number; y: number }; placed: PlacedNode[]; lines: { x1: number; y1: number; x2: number; y2: number; depth: 1 | 2 | 3; type: 'good' | 'warn' }[] } {
  return useMemo(() => {
    const cx = stageW / 2
    const cy = stageH / 2
    const centerXY = { x: cx, y: cy }
    const tree = getTree(center)
    const angleOffset = seedFromString(center) * Math.PI * 2
    const lines: { x1: number; y1: number; x2: number; y2: number; depth: 1 | 2 | 3; type: 'good' | 'warn' }[] = []
    const placed: PlacedNode[] = []

    const d1 = tree.depth1
    const sectorAngle = (2 * Math.PI) / Math.max(d1.length, 1)

    // depth1: 각 노드에 고정 섹터 할당, 섹터 중앙에 배치 → center→노드 선이 해당 섹터 안에만 있음
    d1.forEach((n, i) => {
      const angle = angleOffset + (i + 0.5) * sectorAngle
      const r = radiusByWeight(n.weight)
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      placed.push({ ...n, x, y, angle })
      lines.push({ x1: cx, y1: cy, x2: x, y2: y, depth: 1, type: n.type })
    })

    // depth2: 부모 섹터 안에만 배치 (부모와 같은 각도 구간) → 선이 다른 노드 관통 안 함
    const d2ByParent = new Map<string, TreeNode[]>()
    tree.depth2.forEach((n) => {
      const p = n.parent!
      if (!d2ByParent.has(p)) d2ByParent.set(p, [])
      d2ByParent.get(p)!.push(n)
    })
    d2ByParent.forEach((children, parentName) => {
      const parentNode = placed.find((p) => p.name === parentName)
      if (!parentNode) return
      const parentIdx = d1.findIndex((n) => n.name === parentName)
      if (parentIdx < 0) return
      const subSector = sectorAngle / Math.max(children.length, 1)
      const parentRadius = Math.hypot(parentNode.x - cx, parentNode.y - cy)
      children.forEach((n, j) => {
        const subAngle = angleOffset + (parentIdx + 0.5) * sectorAngle - sectorAngle / 2 + (j + 0.5) * subSector
        const r2 = parentRadius + radiusByWeight(n.weight) * 0.5
        const x = cx + Math.cos(subAngle) * r2
        const y = cy + Math.sin(subAngle) * r2
        placed.push({ ...n, x, y, angle: subAngle })
        lines.push({ x1: parentNode.x, y1: parentNode.y, x2: x, y2: y, depth: 2, type: n.type })
      })
    })

    // depth3: 부모(depth2) 근처 작은 호에 배치 → 선이 부모 섹터 안에만 있음
    const d3ByParent = new Map<string, TreeNode[]>()
    tree.depth3.forEach((n) => {
      const p = n.parent!
      if (!d3ByParent.has(p)) d3ByParent.set(p, [])
      d3ByParent.get(p)!.push(n)
    })
    d3ByParent.forEach((children, parentName) => {
      const parentNode = placed.find((p) => p.name === parentName)
      if (!parentNode) return
      const spread = 0.25 / Math.max(children.length, 1)
      const parentRadius = Math.hypot(parentNode.x - cx, parentNode.y - cy)
      children.forEach((n, j) => {
        const angle = parentNode.angle + (j - (children.length - 1) / 2) * spread
        const r3 = parentRadius + radiusByWeight(n.weight) * 0.4
        const x = cx + Math.cos(angle) * r3
        const y = cy + Math.sin(angle) * r3
        placed.push({ ...n, x, y, angle })
        lines.push({ x1: parentNode.x, y1: parentNode.y, x2: x, y2: y, depth: 3, type: n.type })
      })
    })

    return { centerXY, placed, lines }
  }, [center, stageW, stageH])
}

export function IngredientMindmap() {
  const [center, setCenterState] = useState(DEFAULT_CENTER)
  const [selected, setSelected] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [toast, setToast] = useState('')
  const [stageSize, setStageSize] = useState({ w: 800, h: 600 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 })
  const stageRef = useRef<HTMLDivElement>(null)
  const stageInnerRef = useRef<HTMLDivElement>(null)

  const setCenter = useCallback((next: string) => {
    if (next === center) return
    setHistory((h) => [...h, center])
    setCenterState(next)
  }, [center])

  const goBack = useCallback(() => {
    if (history.length === 0) {
      setToast('이전 기록이 없어요')
      return
    }
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setCenterState(prev)
    setToast('뒤로')
  }, [history])

  const addSelected = useCallback((name: string) => {
    if (selected.includes(name)) {
      setToast(`이미 선택됨: ${name}`)
      return
    }
    setSelected((s) => [...s, name])
    setToast(`선택 추가: ${name}`)
  }, [selected])

  const removeSelected = useCallback((name: string) => {
    setSelected((s) => s.filter((x) => x !== name))
    setToast(`선택 제거: ${name}`)
  }, [])

  const clearSelected = useCallback(() => {
    setSelected([])
    setToast('선택을 비웠어요')
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 900)
    return () => clearTimeout(t)
  }, [toast])

  // 연관 재료 클릭·검색·뒤로 시 패닝 초기화 → 선택된 재료가 중앙에 오도록
  useEffect(() => {
    setTimeout(() => setPan({ x: 0, y: 0 }), 0)
  }, [center])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setStageSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    const r = el.getBoundingClientRect()
    setStageSize({ w: r.width, h: r.height })
    return () => ro.disconnect()
  }, [])

  const handleStageMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== stageInnerRef.current || e.button !== 0) return
    e.preventDefault()
    setIsPanning(true)
    panStartRef.current = { x: pan.x, y: pan.y, clientX: e.clientX, clientY: e.clientY }
  }, [pan.x, pan.y])

  useEffect(() => {
    if (!isPanning) return
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - panStartRef.current.clientX
      const dy = e.clientY - panStartRef.current.clientY
      setPan({ x: panStartRef.current.x + dx, y: panStartRef.current.y + dy })
    }
    const onUp = () => {
      setIsPanning(false)
      document.body.style.removeProperty('cursor')
    }
    document.body.style.cursor = 'grabbing'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isPanning])

  const { centerXY, placed, lines } = useTreeLayout(center, stageSize.w, stageSize.h)

  const handleSearch = useCallback((q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    const found =
      ALL_NAMES.find((x) => x === trimmed) ||
      ALL_NAMES.find((x) => x.includes(trimmed)) ||
      ALL_NAMES.find((x) => x.toLowerCase() === trimmed.toLowerCase()) ||
      ALL_NAMES.find((x) => x.toLowerCase().includes(trimmed.toLowerCase()))
    if (found) {
      setCenter(found)
      setToast(`점프: ${found}`)
    } else {
      setToast(`찾지 못했어요: ${trimmed}`)
    }
  }, [setCenter])

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{
        background: 'var(--base-off-white)',
        color: 'var(--ink-primary)',
      }}
    >
      <header
        className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap"
        style={{
          background: 'linear-gradient(to bottom, var(--base-off-white), transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--divider-default)',
        }}
      >
        <div className="flex items-center gap-2 min-w-[200px]">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: 'var(--brass)', boxShadow: '0 0 0 6px rgba(176,141,87,0.15)' }}
            aria-hidden
          />
          <div>
            <h1 className="text-sm font-semibold tracking-tight">재료 마인드맵</h1>
            <p className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
              중앙 클릭 → 선택 / 주변 클릭 → 중앙 이동
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border min-w-[280px] max-w-[420px] w-[44vw]"
            style={{
              background: 'var(--white)',
              borderColor: 'var(--border-default)',
            }}
            role="search"
          >
            <input
              type="text"
              placeholder="재료 검색 후 Enter (예: 토마토, 바질)"
              className="w-full bg-transparent border-none outline-none text-sm"
              style={{ color: 'var(--ink-primary)' }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch((e.target as HTMLInputElement).value)}
            />
            <small style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Enter</small>
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-xl border text-xs transition hover:opacity-90"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--white)',
              color: 'var(--ink-primary)',
            }}
            onClick={goBack}
            title="이전 중앙으로"
          >
            뒤로
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl border text-xs transition hover:opacity-90"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--white)',
              color: 'var(--ink-primary)',
            }}
            onClick={clearSelected}
            title="선택 비우기"
          >
            선택 비우기
          </button>
        </div>
      </header>

      <main className="flex-1 relative pt-14 pb-20 overflow-hidden">
        <div ref={stageRef} className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            ref={stageInnerRef}
            className="absolute will-change-transform select-none"
            style={{
              left: 0,
              top: 0,
              width: stageSize.w,
              height: stageSize.h,
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              cursor: isPanning ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleStageMouseDown}
            role="presentation"
          >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${stageSize.w} ${stageSize.h}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            {lines.map((line, i) => {
              const style = DEPTH_STYLE[line.depth]
              const stroke = line.type === 'warn' ? 'var(--mindmap-line-warn)' : 'var(--mindmap-line-good)'
              return (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={stroke}
                  strokeWidth={style.lineWidth}
                  strokeLinecap="round"
                  strokeDasharray={line.type === 'warn' ? '6 6' : undefined}
                  opacity={style.opacity}
                />
              )
            })}
          </svg>

          {/* 중앙 노드 */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`중앙 재료 ${center}. 클릭하면 선택 목록에 추가`}
            className="absolute flex items-center gap-2 rounded-full border cursor-pointer select-none transition duration-300 ease-out will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base-off-white)]"
            style={{
              left: centerXY.x,
              top: centerXY.y,
              transform: 'translate(-50%, -50%)',
              padding: '14px 16px',
              background: 'var(--white)',
              borderColor: 'var(--brass)',
              boxShadow: '0 8px 32px var(--shadow-soft)',
              color: 'var(--ink-primary)',
            }}
            onClick={() => addSelected(center)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                addSelected(center)
              }
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: 'var(--brass)', boxShadow: '0 0 0 8px rgba(176,141,87,0.15)' }}
            />
            <span className="text-[15px] font-semibold whitespace-nowrap">{center}</span>
          </div>

          {/* 주변 노드 (depth1, 2, 3) */}
          {placed.map((node) => {
            const style = DEPTH_STYLE[node.depth]
            const isWarn = node.type === 'warn'
            return (
              <div
                key={`${node.name}-${node.depth}-${node.parent ?? 'root'}`}
                role="button"
                tabIndex={0}
                aria-label={`${node.name}${isWarn ? ' (비궁합)' : ''}. 클릭하면 중앙 재료로 이동`}
                className="absolute flex items-center gap-2 rounded-full border cursor-pointer select-none transition duration-500 ease-out will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base-off-white)]"
                style={{
                  left: node.x,
                  top: node.y,
                  transform: `translate(-50%, -50%) scale(${style.scale})`,
                  padding: '10px 12px',
                  background: 'var(--white)',
                  borderColor: isWarn ? 'var(--terracotta)' : 'var(--border-default)',
                  borderWidth: isWarn ? 1.5 : 1,
                  boxShadow: isWarn ? '0 0 0 1px var(--terracotta), 0 4px 20px var(--shadow-soft)' : '0 4px 20px var(--shadow-soft)',
                  opacity: style.opacity,
                  color: 'var(--ink-primary)',
                }}
                onClick={() => setCenter(node.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setCenter(node.name)
                  }
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: isWarn ? 'var(--terracotta)' : 'var(--brass)',
                    boxShadow: isWarn ? '0 0 0 6px rgba(180,87,58,0.12)' : '0 0 0 6px rgba(176,141,87,0.12)',
                  }}
                />
                <span className="text-[13px] font-semibold whitespace-nowrap">{node.name}</span>
              </div>
            )
          })}
          </div>
        </div>

        <div
          role="note"
          className="absolute left-4 bottom-24 max-w-[380px] px-3 py-2 rounded-xl border text-xs"
          style={{
            background: 'var(--white)',
            borderColor: 'var(--border-default)',
            boxShadow: '0 8px 32px var(--shadow-soft)',
            color: 'var(--ink-secondary)',
          }}
        >
          <strong className="block mb-1.5" style={{ color: 'var(--ink-primary)' }}>사용법</strong>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><b>배경</b> 드래그: 화면 이동 (한 화면 밖 재료 보기)</li>
            <li><b>중앙 재료</b> 클릭: 하단 선택 리스트에 추가</li>
            <li><b>주변 재료</b> 클릭: 해당 재료가 중앙으로 이동</li>
            <li>하단 칩 클릭: 선택에서 제거</li>
            <li>검색 후 Enter: 해당 재료로 점프</li>
          </ul>
        </div>
      </main>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 bottom-24 px-3 py-2 rounded-xl border text-xs transition opacity duration-200 pointer-events-none z-50"
          style={{
            background: 'var(--white)',
            borderColor: 'var(--border-strong)',
            color: 'var(--ink-primary)',
            boxShadow: '0 8px 32px var(--shadow-soft)',
          }}
        >
          {toast}
        </div>
      )}

      <footer
        className="absolute left-0 right-0 bottom-0 px-4 py-3 border-t"
        style={{
          background: 'linear-gradient(to top, var(--base-off-white), transparent)',
          backdropFilter: 'blur(10px)',
          borderColor: 'var(--divider-default)',
        }}
      >
        <div className="flex items-start gap-3 max-w-[1200px] mx-auto">
          <div className="min-w-[110px] pt-1">
            <strong className="block text-xs tracking-wide" style={{ color: 'var(--ink-primary)' }}>선택됨</strong>
            <span className="text-[11px]" style={{ color: 'var(--ink-secondary)' }}>
              {selected.length}개
            </span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1 items-center">
            {selected.length === 0 ? (
              <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                아직 선택된 재료가 없어요. 중앙 재료를 클릭해보세요.
              </span>
            ) : (
              selected.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-full border cursor-pointer text-xs whitespace-nowrap transition hover:opacity-90"
                  style={{
                    background: 'var(--white)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--ink-primary)',
                  }}
                  onClick={() => removeSelected(name)}
                  title="클릭하면 제거"
                >
                  <b>{name}</b>
                  <i className="not-italic" style={{ color: 'var(--ink-muted)' }}>×</i>
                </button>
              ))
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

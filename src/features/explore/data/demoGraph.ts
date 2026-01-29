export type EdgeType = 'good' | 'warn'

export interface Edge {
  from: string
  to: string
  weight: number // 0~1, 높을수록 연관도 높음
  type: EdgeType
}

// 원본 데모 GRAPH를 Edge[] 로 변환 (weight 부여)
const RAW: Record<string, { good: string[]; warn: string[] }> = {
  토마토: { good: ['바질', '모짜렐라', '올리브오일', '마늘', '양파', '파스타', '후추', '발사믹'], warn: ['초콜릿'] },
  바질: { good: ['토마토', '모짜렐라', '올리브오일', '파인넛', '마늘', '레몬', '파스타'], warn: [] },
  모짜렐라: { good: ['토마토', '바질', '올리브오일', '발사믹', '올리브', '파스타'], warn: [] },
  올리브오일: { good: ['마늘', '레몬', '바질', '토마토', '버섯', '파스타', '빵'], warn: [] },
  마늘: { good: ['올리브오일', '버섯', '스테이크', '파스타', '치킨', '양파', '허브'], warn: [] },
  양파: { good: ['토마토', '소고기', '치킨', '버섯', '크림', '치즈', '파프리카'], warn: [] },
  파스타: { good: ['토마토', '바질', '모짜렐라', '크림', '버섯', '마늘', '파르미지아노'], warn: [] },
  버섯: { good: ['크림', '버터', '마늘', '파스타', '스테이크', '타임', '치즈'], warn: [] },
  크림: { good: ['버섯', '파스타', '베이컨', '양파', '치즈', '연어'], warn: ['레몬(과다)'] },
  버터: { good: ['버섯', '스테이크', '빵', '마늘', '감자'], warn: [] },
  스테이크: { good: ['버터', '버섯', '후추', '로즈마리', '마늘', '와인'], warn: [] },
  레몬: { good: ['올리브오일', '연어', '치킨', '허브', '샐러드'], warn: [] },
  연어: { good: ['레몬', '딜', '크림', '감자', '후추'], warn: [] },
  초콜릿: { good: ['딸기', '바나나', '우유', '견과'], warn: ['토마토'] },
  치킨: { good: ['마늘', '레몬', '로즈마리', '감자', '크림'], warn: [] },
  감자: { good: ['버터', '치킨', '연어', '치즈', '로즈마리'], warn: [] },
  딸기: { good: ['초콜릿', '요거트', '크림', '민트'], warn: [] },
  치즈: { good: ['감자', '파스타', '양파', '버섯', '크림'], warn: [] },
}

/** good은 0.55~1.0, warn은 0.25~0.45 구간으로 weight 부여 */
function buildEdges(): Edge[] {
  const edges: Edge[] = []
  const goodWeights: Record<string, number> = {}
  const warnWeights: Record<string, number> = {}

  Object.entries(RAW).forEach(([from, { good, warn }]) => {
    good.forEach((to, i) => {
      const key = `${from}-${to}`
      if (!goodWeights[key]) {
        goodWeights[key] = 0.55 + (0.45 * (1 - i / Math.max(good.length, 1)))
      }
      edges.push({ from, to, weight: goodWeights[key], type: 'good' })
    })
    warn.forEach((to, i) => {
      const key = `${from}-${to}`
      if (!warnWeights[key]) {
        warnWeights[key] = 0.25 + 0.2 * (1 - i / Math.max(warn.length, 1))
      }
      edges.push({ from, to, weight: warnWeights[key], type: 'warn' })
    })
  })

  return edges
}

export const DEMO_EDGES: Edge[] = buildEdges()

export function getAllIngredientNames(): string[] {
  const set = new Set<string>()
  DEMO_EDGES.forEach((e) => {
    set.add(e.from)
    set.add(e.to)
  })
  return Array.from(set).sort()
}

/** 한 노드에서 나가는 엣지 (to, weight, type) */
export function getOutEdges(from: string): { to: string; weight: number; type: EdgeType }[] {
  return DEMO_EDGES.filter((e) => e.from === from).map(({ to, weight, type }) => ({ to, weight, type }))
}

/** weight 기준 정렬 후 상위 N개 */
export function getTopNeighbors(from: string, n: number): { to: string; weight: number; type: EdgeType }[] {
  const out = getOutEdges(from)
  const uniq = new Map<string, { weight: number; type: EdgeType }>()
  out.forEach(({ to, weight, type }) => {
    const cur = uniq.get(to)
    if (!cur || weight > cur.weight) uniq.set(to, { weight, type })
  })
  return Array.from(uniq.entries())
    .map(([to, { weight, type }]) => ({ to, weight, type }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, n)
}

/** EXPEDITION 3.2: depth1 top N, weight >= T2면 depth2, weight >= T3면 depth3 */
const T2 = 0.65
const T3 = 0.75
/** 산개 유지: depth1 8개 → 45° 섹터씩, 선이 노드 관통 방지 */
const DEPTH1_MAX = 8
const DEPTH2_MAX = 10
const DEPTH3_MAX = 8

export interface TreeNode {
  name: string
  weight: number
  type: EdgeType
  depth: 1 | 2 | 3
  parent?: string
}

export interface TreeByDepth {
  depth1: TreeNode[]
  depth2: TreeNode[]
  depth3: TreeNode[]
}

export function getTree(center: string): TreeByDepth {
  const depth1 = getTopNeighbors(center, DEPTH1_MAX).map(({ to, weight, type }) => ({
    name: to,
    weight,
    type,
    depth: 1 as const,
  }))

  const depth2: TreeNode[] = []
  const seen = new Set<string>([center, ...depth1.map((n) => n.name)])
  depth1.forEach((d1) => {
    if (d1.weight < T2 || depth2.length >= DEPTH2_MAX) return
    const children = getTopNeighbors(d1.name, 4).filter((c) => !seen.has(c.to))
    children.forEach((c) => {
      if (depth2.length >= DEPTH2_MAX) return
      seen.add(c.to)
      depth2.push({ name: c.to, weight: c.weight, type: c.type, depth: 2, parent: d1.name })
    })
  })

  const depth3: TreeNode[] = []
  depth2.forEach((d2) => {
    if (d2.weight < T3 || depth3.length >= DEPTH3_MAX) return
    const children = getTopNeighbors(d2.name, 3).filter((c) => !seen.has(c.to))
    children.forEach((c) => {
      if (depth3.length >= DEPTH3_MAX) return
      seen.add(c.to)
      depth3.push({ name: c.to, weight: c.weight, type: c.type, depth: 3, parent: d2.name })
    })
  })

  return { depth1, depth2, depth3 }
}

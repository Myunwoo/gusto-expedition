/**
 * URL 해시 파라미터 관리 유틸
 */
export const hashParam = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(location.hash.slice(1)).get(key)
  },

  set(key: string, value: string): void {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(location.hash.slice(1))
    params.set(key, value)
    this._update(params)
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(location.hash.slice(1))
    params.delete(key)
    this._update(params)
  },

  getAll(): Record<string, string> {
    if (typeof window === 'undefined') return {}
    const params = new URLSearchParams(location.hash.slice(1))
    const result: Record<string, string> = {}
    for (const [key, value] of params.entries()) {
      result[key] = value
    }
    return result
  },

  _update(params: URLSearchParams): void {
    if (typeof window === 'undefined') return
    const newHash = params.toString()
    location.hash = newHash ? `#${newHash}` : ''
  },
}

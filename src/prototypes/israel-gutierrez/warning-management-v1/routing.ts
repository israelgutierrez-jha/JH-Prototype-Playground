export const BASE_HASH = '#/prototypes/israel-gutierrez/warning-management-v1'

export type Route = { name: 'queue' } | { name: 'detail'; id: string }

export function parseRoute(hash: string): Route {
  const sub = hash.startsWith(BASE_HASH) ? hash.slice(BASE_HASH.length) : ''
  const detailMatch = sub.match(/^\/warning\/([^/]+)/)
  if (detailMatch) return { name: 'detail', id: decodeURIComponent(detailMatch[1]) }
  return { name: 'queue' }
}

export function goToQueue() {
  window.location.hash = `${BASE_HASH}/queue`
}

export function goToDetail(id: string) {
  window.location.hash = `${BASE_HASH}/warning/${encodeURIComponent(id)}`
}

export function goToNew() {
  goToDetail('new')
}

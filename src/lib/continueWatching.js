const KEY = 'streak.continueWatching'
const MAX_ITEMS = 24
const DONE_THRESHOLD = 0.92
const EVENT = 'streak-cw'

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function itemKey(type, id) {
  return `${type}:${id}`
}

export function listContinueWatching() {
  return read().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export function getContinueItem(type, id) {
  const key = itemKey(type, id)
  return read().find((item) => item.key === key) || null
}

export function resumePath(item) {
  if (!item) return '/'
  if (item.type === 'tv') {
    const season = item.season || 1
    const episode = item.episode || 1
    return `/tv/${item.id}?play=1&s=${season}&e=${episode}`
  }
  return `/movie/${item.id}?play=1`
}

export function upsertContinueWatching(partial) {
  if (!partial?.id || !partial?.type) return null
  const key = itemKey(partial.type, partial.id)
  const currentTime = Number(partial.currentTime) || 0
  const duration = Number(partial.duration) || 0
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : Number(partial.progress) || 0

  if (partial.type === 'movie' && progress >= DONE_THRESHOLD) {
    removeContinueWatching(partial.type, partial.id)
    return null
  }

  const existing = read()
  const previous = existing.find((item) => item.key === key) || {}
  const next = {
    ...previous,
    ...partial,
    key,
    id: Number(partial.id),
    type: partial.type,
    title: partial.title || previous.title || 'Untitled',
    poster: partial.poster || previous.poster || '',
    backdrop: partial.backdrop || previous.backdrop || '',
    season: partial.type === 'tv' ? Number(partial.season || previous.season || 1) : undefined,
    episode: partial.type === 'tv' ? Number(partial.episode || previous.episode || 1) : undefined,
    episodeTitle: partial.episodeTitle || previous.episodeTitle || '',
    currentTime,
    duration,
    progress,
    updatedAt: Date.now(),
  }

  const items = [next, ...existing.filter((item) => item.key !== key)]
  write(items)
  return next
}

export function removeContinueWatching(type, id) {
  const key = itemKey(type, id)
  write(read().filter((item) => item.key !== key))
}

export function clearContinueWatching() {
  write([])
}

export function subscribeContinueWatching(handler) {
  const wrapped = () => handler(listContinueWatching())
  window.addEventListener(EVENT, wrapped)
  window.addEventListener('storage', wrapped)
  window.addEventListener('focus', wrapped)
  return () => {
    window.removeEventListener(EVENT, wrapped)
    window.removeEventListener('storage', wrapped)
    window.removeEventListener('focus', wrapped)
  }
}

const KEY = process.env.REACT_APP_TMDB_KEY || '84120436235fe71398e95a662f44db8b'
const BASE = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p'

export function posterUrl(path, size = 'w500') {
  if (!path) return ''
  return `${IMG}/${size}${path}`
}

export function stillUrl(path, size = 'w300') {
  if (!path) return ''
  return `${IMG}/${size}${path}`
}

export async function tmdb(path, params = {}) {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', KEY)
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') url.searchParams.set(key, value)
  })
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}`)
  }
  return res.json()
}

export function cardsFromResults(results = []) {
  return results
    .filter((item) => item && item.poster_path)
    .map((item) => ({
      id: item.id,
      img: item.poster_path,
      title: item.title || item.name || '',
    }))
}

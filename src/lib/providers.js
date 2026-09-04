const THEME = 'e11d48'

function withStart(url, startAt) {
  const seconds = Math.floor(Number(startAt) || 0)
  if (seconds < 10) return url
  const join = url.includes('?') ? '&' : '?'
  return `${url}${join}startAt=${seconds}`
}

export const PROVIDERS = [
  {
    id: 'vidlink',
    label: 'VidLink',
    movie: (id, startAt) =>
      withStart(`https://vidlink.pro/movie/${id}?autoplay=true&primaryColor=${THEME}&nextbutton=true`, startAt),
    tv: (id, season, episode, startAt) =>
      withStart(
        `https://vidlink.pro/tv/${id}/${season}/${episode}?autoplay=true&primaryColor=${THEME}&nextbutton=true`,
        startAt
      ),
  },
  {
    id: 'vidfast',
    label: 'VidFast',
    movie: (id, startAt) =>
      withStart(`https://vidfast.pro/movie/${id}?autoPlay=true&theme=${THEME}`, startAt),
    tv: (id, season, episode, startAt) =>
      withStart(
        `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true&theme=${THEME}&nextButton=true`,
        startAt
      ),
  },
  {
    id: 'videasy',
    label: 'Videasy',
    movie: (id) => `https://player.videasy.net/movie/${id}?color=${THEME}&autoplay=true`,
    tv: (id, season, episode) =>
      `https://player.videasy.net/tv/${id}/${season}/${episode}?color=${THEME}&autoplay=true&nextEpisode=true`,
  },
  {
    id: 'vidsrc-to',
    label: 'VidSrc',
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsrc-me',
    label: 'VidSrc.me',
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id, season, episode) =>
      `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: '2embed',
    label: '2Embed',
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, season, episode) => `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  },
  {
    id: 'vidsrc-rip',
    label: 'VidSrc.rip',
    movie: (id) => `https://vidsrc.rip/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.rip/embed/tv/${id}/${season}/${episode}`,
  },
]

const PROVIDER_KEY = 'streak.provider'

export function getSavedProviderId() {
  try {
    return localStorage.getItem(PROVIDER_KEY) || PROVIDERS[0].id
  } catch {
    return PROVIDERS[0].id
  }
}

export function saveProviderId(id) {
  try {
    localStorage.setItem(PROVIDER_KEY, id)
  } catch {
    /* ignore quota */
  }
}

export function buildSources({ type, id, season = 1, episode = 1, startAt = 0 }) {
  return PROVIDERS.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url:
      type === 'tv'
        ? provider.tv(id, season, episode, startAt)
        : provider.movie(id, startAt),
  }))
}

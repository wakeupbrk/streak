import { useEffect, useMemo, useRef, useState } from 'react'
import { buildSources, getSavedProviderId, saveProviderId } from '../lib/providers'
import { upsertContinueWatching } from '../lib/continueWatching'

function readProgressPayload(event) {
  const payload = event?.data
  if (!payload || typeof payload !== 'object') return null

  if (payload.type === 'PLAYER_EVENT' && payload.data) {
    const data = payload.data
    return {
      currentTime: Number(data.currentTime) || 0,
      duration: Number(data.duration) || 0,
      season: data.season,
      episode: data.episode,
      ended: data.event === 'ended',
    }
  }

  if (payload.type === 'MEDIA_DATA' && payload.data) {
    const bag = payload.data
    const values = Object.values(bag)
    const first = values.find((item) => item && typeof item === 'object') || bag
    const progress = first?.progress || first
    return {
      currentTime: Number(progress?.watched || progress?.currentTime) || 0,
      duration: Number(progress?.duration) || 0,
      season: first?.last_season_watched || first?.season,
      episode: first?.last_episode_watched || first?.episode,
    }
  }

  if ('currentTime' in payload || 'time' in payload) {
    return {
      currentTime: Number(payload.currentTime ?? payload.time) || 0,
      duration: Number(payload.duration) || 0,
    }
  }

  return null
}

export default function EmbedPlayer({
  type,
  id,
  season = 1,
  episode = 1,
  title,
  poster,
  backdrop,
  episodeTitle,
  startAt = 0,
  onEnded,
  onNext,
}) {
  const frameRef = useRef(null)
  const shellRef = useRef(null)
  const sources = useMemo(
    () => buildSources({ type, id, season, episode, startAt }),
    [type, id, season, episode, startAt]
  )
  const [providerId, setProviderId] = useState(() => {
    const saved = getSavedProviderId()
    return sources.some((source) => source.id === saved) ? saved : sources[0].id
  })
  const [subtitleLanguage, setSubtitleLanguage] = useState(() => localStorage.getItem('streak.subtitle') || 'auto')
  const [speed, setSpeed] = useState(() => localStorage.getItem('streak.speed') || '1')

  const active = sources.find((source) => source.id === providerId) || sources[0]

  useEffect(() => {
    upsertContinueWatching({
      id,
      type,
      title,
      poster,
      backdrop,
      season,
      episode,
      episodeTitle,
      currentTime: startAt,
    })
  }, [id, type, title, poster, backdrop, season, episode, episodeTitle, startAt])

  useEffect(() => {
    const onMessage = (event) => {
      const progress = readProgressPayload(event)
      if (!progress) return
      upsertContinueWatching({
        id,
        type,
        title,
        poster,
        backdrop,
        season: progress.season || season,
        episode: progress.episode || episode,
        episodeTitle,
        currentTime: progress.currentTime,
        duration: progress.duration,
      })
      if (progress.ended) onEnded?.()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [id, type, title, poster, backdrop, season, episode, episodeTitle, onEnded])

  useEffect(() => {
    const onKey = (event) => {
      if (event.target?.matches?.('input, select, textarea')) return
      if (event.key.toLowerCase() === 'f') shellRef.current?.requestFullscreen?.()
      if (event.key.toLowerCase() === 'n') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNext])

  function selectProvider(nextId) {
    setProviderId(nextId)
    saveProviderId(nextId)
  }

  function nextSource() {
    const index = sources.findIndex((source) => source.id === active.id)
    const next = sources[(index + 1) % sources.length]
    selectProvider(next.id)
  }

  return (
    <div className="embedPlayer" ref={shellRef}>
      <div className="embedFrame">
        <iframe
          ref={frameRef}
          key={active.url}
          title={`${title || 'Stream'} — ${active.label}`}
          src={active.url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="origin"
        />
      </div>
      <div className="sourceBar">
        {sources.map((source) => (
          <button
            key={source.id}
            type="button"
            className={source.id === active.id ? 'sourceChip active' : 'sourceChip'}
            onClick={() => selectProvider(source.id)}
          >
            {source.label}
          </button>
        ))}
        <button type="button" className="sourceChip next" onClick={nextSource}>
          Next source
        </button>
        {onNext && <button type="button" className="sourceChip next" onClick={onNext}>Next episode</button>}
        <button type="button" className="sourceChip" onClick={() => shellRef.current?.requestFullscreen?.()}>Fullscreen (F)</button>
        <label className="playerSelect">Subtitles
          <select value={subtitleLanguage} onChange={(event) => { setSubtitleLanguage(event.target.value); localStorage.setItem('streak.subtitle', event.target.value) }}>
            <option value="auto">Auto</option><option value="en">English</option><option value="off">Off</option>
          </select>
        </label>
        <label className="playerSelect">Speed
          <select value={speed} onChange={(event) => { setSpeed(event.target.value); localStorage.setItem('streak.speed', event.target.value) }}>
            <option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option>
          </select>
        </label>
      </div>
      <small className="playerHint">Subtitle and speed preferences are remembered. Availability depends on the selected source.</small>
    </div>
  )
}

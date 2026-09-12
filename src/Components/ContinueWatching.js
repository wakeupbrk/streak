import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { posterUrl } from '../lib/tmdb'
import {
  listContinueWatching,
  markWatched,
  removeContinueWatching,
  resumePath,
  subscribeContinueWatching,
} from '../lib/continueWatching'

export default function ContinueWatching() {
  const [items, setItems] = useState(() => listContinueWatching())

  useEffect(() => subscribeContinueWatching(setItems), [])

  if (!items.length) return null

  return (
    <div className="continueWatching">
      <h2 style={{ marginLeft: '1vh' }}>Continue Watching</h2>
      <section className="trendingScroll continueRow">
        {items.map((item) => {
          const percent = Math.min(Math.round((item.progress || 0) * 100), 100)
          const label =
            item.type === 'tv'
              ? `S${item.season || 1} E${item.episode || 1}`
              : 'Movie'
          return (
            <div className="continueCard" key={item.key}>
              <Link to={resumePath(item)}>
                <img src={posterUrl(item.poster, 'w342')} alt={item.title} />
                <div className="continueMeta">
                  <p>{item.title}</p>
                  <span>
                    {label}
                    {percent > 0 ? ` • ${percent}%` : ''}
                  </span>
                </div>
                <div className="continueBar">
                  <div style={{ width: `${Math.max(percent, 3)}%` }} />
                </div>
              </Link>
              <button
                type="button"
                className="continueRemove"
                aria-label={`Remove ${item.title}`}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  removeContinueWatching(item.type, item.id)
                }}
              >
                ×
              </button>
              <button
                type="button"
                className="continueWatched"
                onClick={() => markWatched(item.type, item.id)}
              >
                ✓ Watched
              </button>
            </div>
          )
        })}
      </section>
    </div>
  )
}

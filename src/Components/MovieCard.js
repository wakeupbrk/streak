import { Link } from 'react-router-dom'
import { posterUrl } from '../lib/tmdb'

export default function MovieCard({ img, id, show, title }) {
  if (!img || String(img).includes('null')) return null
  const kind = show === 'true' || show === true ? 'tv' : 'movie'
  return (
    <Link to={`/${kind}/${id}`} className="movieCard" title={title || ''}>
      <img src={posterUrl(img, 'w342')} alt={title || ''} />
    </Link>
  )
}

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MovieCard from '../Components/MovieCard'
import Nav from '../Components/Nav'
import Footer from '../Components/Footer'
import Loading from '../Components/Loading'
import { cardsFromResults, tmdb } from '../lib/tmdb'

export default function Explore({ type }) {
  const [movie, setMovie] = useState([])
  const [pageCounter, setPageCounter] = useState(1)
  const [query, setQuery] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const kind = type === 'tv' ? 'tv' : 'movie'

  async function fetchSearch(q) {
    const search = await tmdb(`/search/${kind}`, {
      query: q,
      include_adult: false,
    })
    setMovie(cardsFromResults(search.results))
  }

  useEffect(() => {
    let cancelled = false
    async function fetchExplore() {
      const explore = await tmdb(`/discover/${kind}`, {
        page: pageCounter,
        include_adult: false,
        sort_by: 'popularity.desc',
      })
      if (cancelled) return
      const cards = cardsFromResults(explore.results)
      setMovie((current) => (pageCounter === 1 ? cards : [...current, ...cards]))
    }
    if (!query) fetchExplore()
    return () => {
      cancelled = true
    }
  }, [kind, pageCounter, query])

  useEffect(() => {
    setPageCounter(1)
    setMovie([])
    setQuery('')
  }, [kind])

  return (
    <>
      {loadingMore && <Loading time={500} />}
      <Nav />
      <div className="searchBar">
        <input
          type="text"
          placeholder="Type to search..."
          value={query}
          onChange={(event) => {
            const value = event.target.value
            setQuery(value)
            if (value.trim()) fetchSearch(value.trim())
          }}
        />
        <button
          type="button"
          onClick={() => query.trim() && fetchSearch(query.trim())}
        >
          Search
        </button>
      </div>
      <div className="exploreTypes">
        <Link className={kind === 'tv' ? 'selected' : ''} to="/tv">
          Shows
        </Link>
        <Link className={kind === 'movie' ? 'selected' : ''} to="/movie">
          Movie
        </Link>
      </div>
      <section className="explore">
        <div>
          {movie.map((m) => (
            <MovieCard
              key={`${kind}-${m.id}`}
              img={m.img}
              id={m.id}
              show={kind === 'tv' ? 'true' : 'false'}
              title={m.title}
            />
          ))}
        </div>
        <button
          type="button"
          className="loadMore"
          onClick={() => {
            setLoadingMore(true)
            setPageCounter((page) => page + 1)
            setTimeout(() => setLoadingMore(false), 400)
          }}
        >
          Load More
        </button>
      </section>
      <Footer />
    </>
  )
}

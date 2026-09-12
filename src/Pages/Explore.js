import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
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
  const [year, setYear] = useState('')
  const [genre, setGenre] = useState('')
  const [rating, setRating] = useState('0')
  const [sort, setSort] = useState('popularity.desc')
  const [genres, setGenres] = useState([])
  const kind = type === 'tv' ? 'tv' : 'movie'

  async function fetchSearch(q) {
    const search = await tmdb(`/search/${kind}`, {
      query: q,
      include_adult: false,
    })
    setMovie(cardsFromResults(search.results).filter((card) => {
      const raw = search.results.find((item) => item.id === card.id)
      return (!year || String(raw?.release_date || raw?.first_air_date || '').startsWith(year)) && Number(raw?.vote_average || 0) >= Number(rating)
    }))
  }

  useEffect(() => {
    let cancelled = false
    async function fetchExplore() {
      const explore = await tmdb(`/discover/${kind}`, {
        page: pageCounter,
        include_adult: false,
        sort_by: sort,
        with_genres: genre,
        'vote_average.gte': rating,
        [kind === 'movie' ? 'primary_release_year' : 'first_air_date_year']: year,
      })
      if (cancelled) return
      const cards = cardsFromResults(explore.results)
      setMovie((current) => (pageCounter === 1 ? cards : [...current, ...cards]))
    }
    if (!query) fetchExplore()
    return () => {
      cancelled = true
    }
  }, [kind, pageCounter, query, year, genre, rating, sort])

  useEffect(() => {
    tmdb(`/genre/${kind}/list`).then((data) => setGenres(data.genres || [])).catch(() => setGenres([]))
  }, [kind])

  useEffect(() => {
    if (!query.trim()) return
    const timer = setTimeout(() => fetchSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  // fetchSearch intentionally uses the current search/filter state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, year, rating, kind])

  const years = useMemo(() => Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i)), [])

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
          }}
        />
        <button
          type="button"
          onClick={() => query.trim() && fetchSearch(query.trim())}
        >
          Search
        </button>
      </div>
      <div className="filterBar">
        <select aria-label="Genre" value={genre} onChange={(e) => { setGenre(e.target.value); setPageCounter(1) }}><option value="">All genres</option>{genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
        <select aria-label="Year" value={year} onChange={(e) => { setYear(e.target.value); setPageCounter(1) }}><option value="">Any year</option>{years.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Rating" value={rating} onChange={(e) => { setRating(e.target.value); setPageCounter(1) }}><option value="0">Any rating</option><option value="6">6+</option><option value="7">7+</option><option value="8">8+</option></select>
        <select aria-label="Sort" value={sort} onChange={(e) => { setSort(e.target.value); setPageCounter(1) }}><option value="popularity.desc">Most popular</option><option value="vote_average.desc">Top rated</option><option value={kind === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc'}>Newest</option></select>
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

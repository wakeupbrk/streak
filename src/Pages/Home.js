import { Link } from 'react-router-dom'
import Header from '../Components/Header'
import { useEffect, useState } from 'react'
import MovieCard from '../Components/MovieCard'
import Footer from '../Components/Footer'
import Loading from '../Components/Loading'
import ContinueWatching from '../Components/ContinueWatching'
import { cardsFromResults, posterUrl, tmdb } from '../lib/tmdb'

export default function Home() {
  const [featured, setFeatured] = useState(null)
  const [trending, setTrending] = useState([])
  const [popular, setPopular] = useState([])
  const [latest, setLatest] = useState([])
  const [popularTV, setPopularTV] = useState([])

  useEffect(() => {
    document.title = 'Streak'
    let cancelled = false
    async function fetchData() {
      try {
        const [trendingData, popularData, latestData, popularTData] = await Promise.all([
          tmdb('/movie/popular'),
          tmdb('/movie/top_rated'),
          tmdb('/trending/tv/week'),
          tmdb('/tv/top_rated'),
        ])
        if (cancelled) return
        const results = trendingData.results || []
        const pick = results[Math.floor(Math.random() * Math.max(results.length, 1))] || null
        setFeatured(pick)
        setTrending(cardsFromResults(results))
        setPopular(cardsFromResults(popularData.results))
        setLatest(cardsFromResults(latestData.results))
        setPopularTV(cardsFromResults(popularTData.results))
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Loading />
      <Header />
      <div className="Container">
        <div className="Types">
          <h1>
            <Link to="/tv">Shows</Link>
          </h1>
          <h1>
            <Link to="/movie">Movies</Link>
          </h1>
          <h1>
            <Link to="/list">My List</Link>
          </h1>
        </div>
        <div className="MainBackdrop">
          {featured?.poster_path && (
            <img
              width="100%"
              height="100%"
              src={posterUrl(featured.backdrop_path || featured.poster_path, 'w780')}
              alt=""
            />
          )}
        </div>
        <div className="MainMovie">
          {featured && (
            <>
              <Link to={`/movie/${featured.id}`}>
                <img src={posterUrl(featured.poster_path)} alt={featured.title} />
                <div className="MainMovieInfos">
                  <h2>{featured.title}</h2>
                  <h4>
                    {featured.release_date} • {featured.vote_average}/10
                  </h4>
                </div>
              </Link>
              <div className="MainMovieDesktop">
                <h1>{featured.title}</h1>
                <p>
                  ⭐️ {String(featured.vote_average).slice(0, 3)}/10 • 👥 {featured.popularity} • 📅{' '}
                  {String(featured.release_date || '').slice(0, 4)}
                </p>
                <h3 style={{ margin: 0, textAlign: 'start', textShadow: 'none', fontWeight: 300 }}>
                  {featured.overview}
                </h3>
                <Link className="DesktopBtn" to={`/movie/${featured.id}?play=1`}>
                  <i className="fa fa-play" aria-hidden="true"></i>
                  &nbsp;&nbsp;Play
                </Link>
              </div>
            </>
          )}
        </div>
        <div style={{ margin: '1vh', top: '3vh', position: 'relative' }}>
          <ContinueWatching />
          <h2 style={{ marginLeft: '1vh' }}>Trending Movies</h2>
          <section className="trendingScroll">
            {trending.map((m) => (
              <MovieCard key={m.id} img={m.img} id={m.id} title={m.title} />
            ))}
          </section>
          <h2 style={{ marginLeft: '1vh' }}>Popular Movies</h2>
          <section className="trendingScroll">
            {popular.map((m) => (
              <MovieCard key={m.id} img={m.img} id={m.id} title={m.title} />
            ))}
          </section>
          <br />
          <h2 style={{ marginLeft: '1vh' }}>Latest TV Series</h2>
          <section className="trendingScroll">
            {latest.map((m) => (
              <MovieCard key={m.id} img={m.img} id={m.id} show="true" title={m.title} />
            ))}
          </section>
          <h2 style={{ marginLeft: '1vh' }}>Popular TV Series</h2>
          <section className="trendingScroll">
            {popularTV.map((m) => (
              <MovieCard key={m.id} img={m.img} id={m.id} show="true" title={m.title} />
            ))}
          </section>
        </div>
      </div>
      <Footer style={{ position: 'relative', top: '10vh', margin: '1vh' }} />
    </>
  )
}

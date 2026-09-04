import { useParams, useSearchParams } from 'react-router-dom'
import Nav from '../Components/Nav'
import { useEffect, useState } from 'react'
import MovieCard from '../Components/MovieCard'
import Footer from '../Components/Footer'
import Loading from '../Components/Loading'
import { toast } from 'react-hot-toast'
import MovieScraper from '../Components/MovieScraper'
import { cardsFromResults, posterUrl, tmdb } from '../lib/tmdb'
import { getContinueItem, upsertContinueWatching } from '../lib/continueWatching'

export default function Movie() {
  const [similar, setSimilar] = useState([])
  const [recom, setRecom] = useState([])
  const [player, setPlayer] = useState(false)
  const [data, setData] = useState(null)
  const [resume, setResume] = useState(null)
  const [inLibrary, setInLibrary] = useState(false)
  const params = useParams()
  const [searchParams] = useSearchParams()

  function saveToLibrary() {
    const library = JSON.parse(localStorage.getItem('library') || '[]')
    const path = `/movie/${params.id}`
    if (!library.includes(path)) {
      library.push(path)
      localStorage.setItem('library', JSON.stringify(library))
    }
    setInLibrary(true)
    toast.success('Added To Your List.', { position: 'bottom-center' })
  }

  function openPlayer() {
    if (data) {
      upsertContinueWatching({
        id: data.id,
        type: 'movie',
        title: data.title,
        poster: data.poster_path,
        backdrop: data.backdrop_path,
        currentTime: resume?.currentTime || 0,
        duration: resume?.duration || 0,
      })
    }
    setPlayer(true)
  }

  useEffect(() => {
    let cancelled = false
    setPlayer(false)
    setData(null)
    setResume(getContinueItem('movie', params.id))
    setInLibrary((JSON.parse(localStorage.getItem('library') || '[]') || []).includes(`/movie/${params.id}`))
    async function fetchData() {
      try {
        const movie = await tmdb(`/movie/${params.id}`)
        if (cancelled) return
        setData(movie)
        document.title = `Streak | ${movie.title}`
        const [recomData, similarData] = await Promise.all([
          tmdb(`/movie/${params.id}/recommendations`),
          tmdb(`/movie/${params.id}/similar`),
        ])
        if (cancelled) return
        setRecom(cardsFromResults(recomData.results))
        setSimilar(cardsFromResults(similarData.results))
        if (searchParams.get('play') === '1') setPlayer(true)
      } catch (error) {
        console.error(error)
        toast.error('Could not load this title.')
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [params.id, searchParams])

  const language = data?.spoken_languages?.[0]?.english_name || 'English'
  const resumeLabel =
    resume?.currentTime > 15
      ? `Resume ${Math.floor(resume.currentTime / 60)}m`
      : 'Play'

  return (
    <>
      <Loading />
      {data?.poster_path && (
        <img className="MovieBackground" src={posterUrl(data.poster_path)} alt="" />
      )}
      {data?.backdrop_path && (
        <img className="backdrop" src={posterUrl(data.backdrop_path, 'w780')} alt="" />
      )}
      <Nav />
      <div>
        <div className="mainInfosContainer">
          <div className="MovieInfos">
            {data?.poster_path && <img src={posterUrl(data.poster_path)} alt={data?.title} />}
            <div>
              <h2>{data?.title}</h2>
              <p
                style={{
                  color: '#505050',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  fontWeight: '500',
                  textShadow: '0 0 5px #151515',
                }}
              >
                {data?.tagline}
              </p>
              <br />
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <button
                  type="button"
                  className={inLibrary ? 'ListButton buttonDisabled' : 'ListButton'}
                  onClick={saveToLibrary}
                  disabled={inLibrary}
                >
                  <i className="fa fa-bookmark" aria-hidden="true"></i>
                  &nbsp;&nbsp;List
                </button>
                <button type="button" onClick={openPlayer}>
                  <i className="fa fa-play" aria-hidden="true"></i>
                  &nbsp;&nbsp;{resumeLabel}
                </button>
              </div>
            </div>
          </div>
          <div style={{ margin: '0 3vh' }}>
            <div className="genres">
              {(data?.genres || []).map((genre) => (
                <span key={genre.id}>{genre.name}</span>
              ))}
            </div>
            <p className="rating">
              ⭐️ {data?.vote_average || 0}/10 • 👥 {data?.popularity || 0}
            </p>
            <p className="desc">{data?.overview}</p>
            <p className="DateAndLangs">
              🌐 {language} • 📅 {data?.release_date}
            </p>
          </div>
        </div>
        <div style={{ margin: '3vh' }}>
          {recom.length > 1 && (
            <>
              <h3>Recommendations</h3>
              <section className="recom">
                {recom.map((m) => (
                  <MovieCard key={m.id} img={m.img} id={m.id} title={m.title} />
                ))}
              </section>
            </>
          )}
          {similar.length > 1 && (
            <>
              <h3>Similar</h3>
              <section className="recom">
                {similar.map((m) => (
                  <MovieCard key={m.id} img={m.img} id={m.id} title={m.title} />
                ))}
              </section>
            </>
          )}
        </div>
        {player && (
          <div className="Player is-open">
            <button type="button" className="close" onClick={() => setPlayer(false)} aria-label="Close player">
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
            <MovieScraper
              id={params.id}
              title={data?.title}
              poster={data?.poster_path}
              backdrop={data?.backdrop_path}
              startAt={resume?.currentTime || 0}
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

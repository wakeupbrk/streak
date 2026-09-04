import { useParams, useSearchParams } from 'react-router-dom'
import Nav from '../Components/Nav'
import { useEffect, useState } from 'react'
import MovieCard from '../Components/MovieCard'
import Footer from '../Components/Footer'
import Loading from '../Components/Loading'
import { toast } from 'react-hot-toast'
import EpCard from '../Components/EpCard'
import ShowScraper from '../Components/ShowScraper'
import { cardsFromResults, posterUrl, stillUrl, tmdb } from '../lib/tmdb'
import { getContinueItem, upsertContinueWatching } from '../lib/continueWatching'

export default function Show() {
  const [similar, setSimilar] = useState([])
  const [recom, setRecom] = useState([])
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [episodes, setEpisodes] = useState([])
  const [player, setPlayer] = useState(false)
  const [data, setData] = useState(null)
  const [resume, setResume] = useState(null)
  const [inLibrary, setInLibrary] = useState(false)
  const params = useParams()
  const [searchParams] = useSearchParams()

  function saveToLibrary() {
    const library = JSON.parse(localStorage.getItem('library') || '[]')
    const path = `/tv/${params.id}`
    if (!library.includes(path)) {
      library.push(path)
      localStorage.setItem('library', JSON.stringify(library))
    }
    setInLibrary(true)
    toast.success('Added To Your List.', { position: 'bottom-center' })
  }

  function playEpisode(epNumber, seasonNumber = season) {
    setSeason(Number(seasonNumber))
    setEpisode(Number(epNumber))
    const ep = episodes.find((item) => Number(item.epNumber) === Number(epNumber))
    upsertContinueWatching({
      id: params.id,
      type: 'tv',
      title: data?.name,
      poster: data?.poster_path,
      backdrop: data?.backdrop_path,
      season: Number(seasonNumber),
      episode: Number(epNumber),
      episodeTitle: ep?.title,
    })
    setPlayer(true)
  }

  useEffect(() => {
    let cancelled = false
    setPlayer(false)
    setData(null)
    const saved = getContinueItem('tv', params.id)
    setResume(saved)
    setInLibrary((JSON.parse(localStorage.getItem('library') || '[]') || []).includes(`/tv/${params.id}`))
    const querySeason = Number(searchParams.get('s') || saved?.season || 1)
    const queryEpisode = Number(searchParams.get('e') || saved?.episode || 1)
    setSeason(querySeason)
    setEpisode(queryEpisode)

    async function loadSeason(show, seasonNumber) {
      const seasonData = await tmdb(`/tv/${params.id}/season/${seasonNumber}`)
      const cards = (seasonData.episodes || []).map((item) => ({
        title: item.name,
        epNumber: item.episode_number,
        runtime: item.runtime,
        number: item.episode_number,
        vote: item.vote_average,
        img: stillUrl(item.still_path),
      }))
      if (!cancelled) setEpisodes(cards)
    }

    async function fetchData() {
      try {
        const show = await tmdb(`/tv/${params.id}`)
        if (cancelled) return
        setData(show)
        document.title = `Streak | ${show.name}`
        const firstSeason = querySeason || show.seasons?.find((s) => s.season_number > 0)?.season_number || 1
        setSeason(firstSeason)
        await loadSeason(show, firstSeason)
        const [recomData, similarData] = await Promise.all([
          tmdb(`/tv/${params.id}/recommendations`),
          tmdb(`/tv/${params.id}/similar`),
        ])
        if (cancelled) return
        setRecom(cardsFromResults(recomData.results))
        setSimilar(cardsFromResults(similarData.results))
        if (searchParams.get('play') === '1') setPlayer(true)
      } catch (error) {
        console.error(error)
        toast.error('Could not load this show.')
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [params.id, searchParams])

  async function changeSeason(nextSeason) {
    const value = Number(nextSeason)
    setSeason(value)
    try {
      const seasonData = await tmdb(`/tv/${params.id}/season/${value}`)
      setEpisodes(
        (seasonData.episodes || []).map((item) => ({
          title: item.name,
          epNumber: item.episode_number,
          runtime: item.runtime,
          number: item.episode_number,
          vote: item.vote_average,
          img: stillUrl(item.still_path),
        }))
      )
    } catch (error) {
      console.error(error)
    }
  }

  const language = data?.spoken_languages?.[0]?.english_name || 'English'
  const seasonCount = data?.number_of_seasons || 1
  const activeEpisode = episodes.find((item) => Number(item.epNumber) === Number(episode))
  const seasons = Array.from({ length: seasonCount }, (_, index) => index + 1)

  return (
    <>
      <Loading />
      {data?.poster_path && <img className="MovieBackground" src={posterUrl(data.poster_path)} alt="" />}
      {data?.backdrop_path && (
        <img className="backdrop" src={posterUrl(data.backdrop_path, 'w780')} alt="" />
      )}
      <Nav />
      <div>
        <div className="mainInfosContainer">
          <div className="MovieInfos">
            {data?.poster_path && <img src={posterUrl(data.poster_path)} alt={data?.name} />}
            <div>
              <h3>{data?.name}</h3>
              <p className="returning">{data?.status}</p>
              <br />
              <div style={{ display: 'flex', flexDirection: 'row', gap: '1vh' }}>
                <button
                  type="button"
                  className={inLibrary ? 'ListButton buttonDisabled' : 'ListButton'}
                  onClick={saveToLibrary}
                  disabled={inLibrary}
                >
                  <i className="fa fa-bookmark" aria-hidden="true"></i>
                  &nbsp;&nbsp;List
                </button>
                <button type="button" onClick={() => playEpisode(episode, season)}>
                  <i className="fa fa-play" aria-hidden="true"></i>
                  &nbsp;&nbsp;
                  {resume ? `Resume S${resume.season || 1} E${resume.episode || 1}` : 'Play'}
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
              🌐 {language} • 📅 {data?.first_air_date}
            </p>
          </div>
        </div>
        <div style={{ margin: '3vh' }}>
          <div className="EPS">
            <select
              id="seasonSelector"
              value={`Season ${season}`}
              onChange={(event) => changeSeason(event.target.value.replace(/\D/g, ''))}
            >
              {seasons.map((number) => (
                <option key={number}>Season {number}</option>
              ))}
            </select>
            <div className="EPslider">
              {episodes.map((card) => (
                <EpCard
                  key={`${season}-${card.number}`}
                  number={card.number}
                  img={card.img}
                  minutes={card.runtime}
                  title={card.title}
                  vote={card.vote}
                  epNumber={card.epNumber}
                  active={Number(card.epNumber) === Number(episode)}
                  onPlay={(ep) => playEpisode(ep, season)}
                />
              ))}
            </div>
          </div>
          {recom.length > 1 && (
            <>
              <h3>Recommendations</h3>
              <section className="recom">
                {recom.map((m) => (
                  <MovieCard key={m.id} img={m.img} id={m.id} show="true" title={m.title} />
                ))}
              </section>
            </>
          )}
          {similar.length > 1 && (
            <>
              <h3>Similar</h3>
              <section className="recom">
                {similar.map((m) => (
                  <MovieCard key={m.id} img={m.img} id={m.id} show="true" title={m.title} />
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
            <ShowScraper
              id={params.id}
              s={season}
              e={episode}
              title={data?.name}
              poster={data?.poster_path}
              backdrop={data?.backdrop_path}
              episodeTitle={activeEpisode?.title}
              startAt={
                resume && Number(resume.season) === Number(season) && Number(resume.episode) === Number(episode)
                  ? resume.currentTime
                  : 0
              }
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
